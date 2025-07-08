/**
 * 武器系统
 * 处理不同类型武器的射击逻辑和特效
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { Bullet } from './Bullet.js';

/**
 * 武器基类
 */
export class Weapon {
    constructor(name, cooldown, damage = 1) {
        this.name = name;
        this.cooldown = cooldown;
        this.damage = damage;
        this.lastShot = 0;
        this.ammo = Infinity; // 弹药数量，Infinity表示无限
        this.maxAmmo = Infinity;
    }

    /**
     * 检查是否可以射击
     * @returns {boolean}
     */
    canShoot() {
        const now = Date.now();
        return (now - this.lastShot > this.cooldown) && this.ammo > 0;
    }

    /**
     * 射击方法（子类需要重写）
     * @param {number} x - 射击位置X
     * @param {number} y - 射击位置Y
     * @param {Array} bullets - 子弹数组
     */
    shoot(x, y, bullets) {
        if (!this.canShoot()) return false;
        
        this.lastShot = Date.now();
        if (this.ammo !== Infinity) {
            this.ammo--;
        }
        return true;
    }

    /**
     * 装弹
     * @param {number} amount 
     */
    reload(amount = this.maxAmmo) {
        this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    }

    /**
     * 获取武器信息
     * @returns {Object}
     */
    getInfo() {
        return {
            name: this.name,
            damage: this.damage,
            ammo: this.ammo,
            maxAmmo: this.maxAmmo,
            cooldown: this.cooldown
        };
    }
}

/**
 * 普通武器
 */
export class NormalWeapon extends Weapon {
    constructor() {
        super('普通炮', 200, 1);
    }

    shoot(x, y, bullets) {
        if (!super.shoot(x, y, bullets)) return false;
        
        bullets.push(new Bullet(x - 2, y, -GAME_CONFIG.BULLET.SPEED, 'player', this.damage));
        return true;
    }
}

/**
 * 双管武器
 */
export class DoubleWeapon extends Weapon {
    constructor() {
        super('双管炮', 250, 1);
    }

    shoot(x, y, bullets) {
        if (!super.shoot(x, y, bullets)) return false;
        
        bullets.push(new Bullet(x - 8, y, -GAME_CONFIG.BULLET.SPEED, 'player', this.damage));
        bullets.push(new Bullet(x + 4, y, -GAME_CONFIG.BULLET.SPEED, 'player', this.damage));
        return true;
    }
}

/**
 * 散弹枪
 */
export class ShotgunWeapon extends Weapon {
    constructor() {
        super('散弹枪', 400, 0.7);
        this.pelletsCount = 5; // 散弹数量
        this.spread = 40; // 散布角度
    }

    shoot(x, y, bullets) {
        if (!super.shoot(x, y, bullets)) return false;
        
        const centerAngle = -90; // 向上射击
        const angleStep = this.spread / (this.pelletsCount - 1);
        const startAngle = centerAngle - this.spread / 2;
        
        for (let i = 0; i < this.pelletsCount; i++) {
            const angle = startAngle + i * angleStep;
            const radians = angle * Math.PI / 180;
            const speed = GAME_CONFIG.BULLET.SPEED + Math.random() * 2 - 1; // 速度随机化
            
            const vx = Math.sin(radians) * speed;
            const vy = Math.cos(radians) * speed;
            
            // 创建散弹
            const pellet = new Bullet(
                x + (Math.random() - 0.5) * 10, 
                y, 
                vy, 
                'player', 
                this.damage
            );
            pellet.vx = vx; // 设置水平速度
            pellet.color = '#ff6b6b';
            pellet.size = 3; // 较小的散弹
            pellet.trail = true; // 添加尾迹
            bullets.push(pellet);
        }
        return true;
    }
}

/**
 * 激光武器
 */
export class LaserWeapon extends Weapon {
    constructor() {
        super('激光炮', 150, 2);
        this.chargeTime = 500; // 蓄力时间
        this.isCharging = false;
        this.chargeStart = 0;
    }

    canShoot() {
        const now = Date.now();
        if (this.isCharging) {
            return now - this.chargeStart >= this.chargeTime;
        }
        return super.canShoot();
    }

    shoot(x, y, bullets) {
        const now = Date.now();
        
        if (!this.isCharging) {
            // 开始蓄力
            if (super.canShoot()) {
                this.isCharging = true;
                this.chargeStart = now;
                return false; // 还在蓄力，不发射
            }
            return false;
        } else {
            // 蓄力完成，发射激光
            if (now - this.chargeStart >= this.chargeTime) {
                this.isCharging = false;
                this.lastShot = now;
                
                // 创建激光束
                const laser = new Bullet(x - 3, y, -GAME_CONFIG.BULLET.SPEED * 2, 'player', this.damage);
                laser.width = 6;
                laser.height = 30;
                laser.color = '#00ff00';
                laser.glow = true;
                laser.piercing = true; // 激光可以穿透
                bullets.push(laser);
                return true;
            }
        }
        return false;
    }

    /**
     * 获取蓄力进度
     * @returns {number} 0-1之间的进度值
     */
    getChargeProgress() {
        if (!this.isCharging) return 0;
        const elapsed = Date.now() - this.chargeStart;
        return Math.min(elapsed / this.chargeTime, 1);
    }
}

/**
 * 导弹武器
 */
export class MissileWeapon extends Weapon {
    constructor() {
        super('导弹发射器', 800, 3);
        this.ammo = 20;
        this.maxAmmo = 20;
        this.homingRange = 150; // 追踪范围
    }

    shoot(x, y, bullets, enemies = []) {
        if (!super.shoot(x, y, bullets)) return false;
        
        // 寻找最近的敌机作为目标
        let target = null;
        let minDistance = this.homingRange;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x + enemy.width/2 - x, 2) + 
                Math.pow(enemy.y + enemy.height/2 - y, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                target = enemy;
            }
        });
        
        // 创建导弹
        const missile = new Bullet(x - 4, y, -GAME_CONFIG.BULLET.SPEED * 0.8, 'player', this.damage);
        missile.width = 8;
        missile.height = 16;
        missile.color = '#ffd700';
        missile.target = target;
        missile.homing = true;
        missile.turnSpeed = 0.05; // 转向速度
        missile.trail = true;
        missile.explosive = true; // 爆炸伤害
        bullets.push(missile);
        
        return true;
    }
}

/**
 * 等离子武器
 */
export class PlasmaWeapon extends Weapon {
    constructor() {
        super('等离子炮', 300, 1.5);
        this.energyConsumption = 2;
        this.energy = 100;
        this.maxEnergy = 100;
        this.rechargeRate = 1; // 每帧恢复的能量
    }

    canShoot() {
        return super.canShoot() && this.energy >= this.energyConsumption;
    }

    shoot(x, y, bullets) {
        if (!this.canShoot()) return false;
        
        this.lastShot = Date.now();
        this.energy -= this.energyConsumption;
        
        // 创建等离子球
        const plasma = new Bullet(x - 5, y, -GAME_CONFIG.BULLET.SPEED * 1.2, 'player', this.damage);
        plasma.width = 10;
        plasma.height = 10;
        plasma.color = '#e74c3c';
        plasma.glow = true;
        plasma.expanding = true; // 等离子球会逐渐扩大
        plasma.maxSize = 15;
        bullets.push(plasma);
        
        return true;
    }

    /**
     * 更新能量恢复
     */
    update() {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.rechargeRate);
        }
    }

    /**
     * 获取能量百分比
     * @returns {number}
     */
    getEnergyPercent() {
        return this.energy / this.maxEnergy;
    }
}

/**
 * 武器管理器
 */
export class WeaponManager {
    constructor() {
        this.weapons = {
            normal: new NormalWeapon(),
            double: new DoubleWeapon(),
            shotgun: new ShotgunWeapon(),
            laser: new LaserWeapon(),
            missile: new MissileWeapon(),
            plasma: new PlasmaWeapon()
        };
        
        this.currentWeapon = 'normal';
        this.availableWeapons = ['normal']; // 玩家拥有的武器
    }

    /**
     * 切换武器
     * @param {string} weaponType 
     */
    switchWeapon(weaponType) {
        if (this.availableWeapons.includes(weaponType)) {
            this.currentWeapon = weaponType;
            console.log(`🔫 切换到武器: ${this.weapons[weaponType].name}`);
            return true;
        }
        return false;
    }

    /**
     * 获取当前武器
     * @returns {Weapon}
     */
    getCurrentWeapon() {
        return this.weapons[this.currentWeapon];
    }

    /**
     * 解锁武器
     * @param {string} weaponType 
     */
    unlockWeapon(weaponType) {
        if (!this.availableWeapons.includes(weaponType) && this.weapons[weaponType]) {
            this.availableWeapons.push(weaponType);
            console.log(`🔓 解锁新武器: ${this.weapons[weaponType].name}`);
            return true;
        }
        return false;
    }

    /**
     * 射击
     * @param {number} x 
     * @param {number} y 
     * @param {Array} bullets 
     * @param {Array} enemies 
     * @returns {boolean}
     */
    shoot(x, y, bullets, enemies = []) {
        const weapon = this.getCurrentWeapon();
        return weapon.shoot(x, y, bullets, enemies);
    }

    /**
     * 更新所有武器状态
     */
    update() {
        Object.values(this.weapons).forEach(weapon => {
            if (weapon.update) {
                weapon.update();
            }
        });
    }

    /**
     * 获取武器状态信息
     * @returns {Object}
     */
    getWeaponStatus() {
        const current = this.getCurrentWeapon();
        return {
            current: this.currentWeapon,
            name: current.name,
            available: this.availableWeapons,
            ...current.getInfo(),
            isCharging: current.isCharging || false,
            chargeProgress: current.getChargeProgress ? current.getChargeProgress() : 0,
            energyPercent: current.getEnergyPercent ? current.getEnergyPercent() : 1
        };
    }

    /**
     * 下一个武器
     */
    nextWeapon() {
        const currentIndex = this.availableWeapons.indexOf(this.currentWeapon);
        const nextIndex = (currentIndex + 1) % this.availableWeapons.length;
        this.switchWeapon(this.availableWeapons[nextIndex]);
    }

    /**
     * 上一个武器
     */
    previousWeapon() {
        const currentIndex = this.availableWeapons.indexOf(this.currentWeapon);
        const prevIndex = (currentIndex - 1 + this.availableWeapons.length) % this.availableWeapons.length;
        this.switchWeapon(this.availableWeapons[prevIndex]);
    }
}

export default WeaponManager; 