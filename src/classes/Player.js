/**
 * 玩家飞机类（武器系统版）
 * 处理玩家的移动、射击、道具效果和武器管理
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import WeaponManager from './Weapon.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER.WIDTH;
        this.height = GAME_CONFIG.PLAYER.HEIGHT;
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.invulnerable = false;
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
        
        // 武器系统
        this.weaponManager = new WeaponManager();
        
        // 道具效果（保留为了兼容性）
        this.rapidFire = false;
        this.rapidFireEnd = 0;
        this.shield = false;
        this.shieldEnd = 0;
        this.doubleShotEnd = 0;
        this.multiShotEnd = 0;
    }

    /**
     * 处理输入并更新玩家状态
     * @param {Object} input - 输入状态对象
     * @param {Object} canvas - 画布对象
     */
    handleInput(input, canvas) {
        // 移动控制
        if (input.left) {
            this.x -= this.speed;
        }
        if (input.right) {
            this.x += this.speed;
        }
        if (input.up) {
            this.y -= this.speed;
        }
        if (input.down) {
            this.y += this.speed;
        }

        // 边界检查
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }

    /**
     * 更新玩家状态
     */
    update() {
        // 更新武器系统
        this.weaponManager.update();
        
        // 更新道具效果
        this.updatePowerUpEffects();
    }

    /**
     * 更新道具效果
     */
    updatePowerUpEffects() {
        const now = Date.now();
        
        // 检查快速射击效果是否过期
        if (this.rapidFire && now > this.rapidFireEnd) {
            this.rapidFire = false;
        }
        
        // 检查护盾效果是否过期
        if (this.shield && now > this.shieldEnd) {
            this.shield = false;
        }
    }

    /**
     * 应用道具效果
     * @param {string} type - 道具类型
     */
    applyPowerUp(type) {
        const now = Date.now();
        
        switch(type) {
            case 'health':
                if (this.health < this.maxHealth) {
                    this.health++;
                    console.log('❤️ 生命值恢复！');
                }
                break;
            case 'doubleShot':
                this.doubleShotEnd = now + GAME_CONFIG.POWER_UP.DURATION.DOUBLE_SHOT;
                this.weaponManager.unlockWeapon('double');
                console.log('🔫 解锁双管炮！');
                break;
            case 'shield':
                this.shield = true;
                this.shieldEnd = now + GAME_CONFIG.POWER_UP.DURATION.SHIELD;
                console.log('🛡️ 护盾激活！');
                break;
            case 'rapidFire':
                this.rapidFire = true;
                this.rapidFireEnd = now + GAME_CONFIG.POWER_UP.DURATION.RAPID_FIRE;
                console.log('🔥 连射模式！');
                break;
            case 'multiShot':
                this.multiShotEnd = now + GAME_CONFIG.POWER_UP.DURATION.MULTI_SHOT;
                this.weaponManager.unlockWeapon('shotgun');
                console.log('💥 解锁散弹枪！');
                break;
            
            // 新武器道具
            case 'laser':
                this.weaponManager.unlockWeapon('laser');
                console.log('⚡ 解锁激光炮！');
                break;
            case 'missile':
                this.weaponManager.unlockWeapon('missile');
                this.weaponManager.weapons.missile.reload(); // 装填导弹
                console.log('🚀 解锁导弹发射器！');
                break;
            case 'plasma':
                this.weaponManager.unlockWeapon('plasma');
                console.log('🔮 解锁等离子炮！');
                break;
        }
    }

    /**
     * 射击方法
     * @param {Array} bullets - 子弹数组
     * @param {Array} enemies - 敌机数组（导弹追踪用）
     */
    shoot(bullets, enemies = []) {
        const centerX = this.x + this.width / 2;
        const shootY = this.y;
        
        // 使用武器管理器射击
        const shot = this.weaponManager.shoot(centerX, shootY, bullets, enemies);
        
        // 如果射击成功，返回true
        return shot;
    }

    /**
     * 切换武器
     * @param {string} direction - 'next' 或 'prev'
     */
    switchWeapon(direction = 'next') {
        if (direction === 'next') {
            this.weaponManager.nextWeapon();
        } else {
            this.weaponManager.previousWeapon();
        }
    }

    /**
     * 切换到指定武器
     * @param {string} weaponType 
     */
    selectWeapon(weaponType) {
        this.weaponManager.switchWeapon(weaponType);
    }

    /**
     * 获取当前武器信息
     * @returns {Object}
     */
    getWeaponInfo() {
        return this.weaponManager.getWeaponStatus();
    }

    /**
     * 渲染玩家飞机
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 护盾效果
        if (this.shield) {
            ctx.save();
            ctx.shadowColor = '#3742fa';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#3742fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width/2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 无敌状态闪烁效果
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // 绘制玩家战斗机
        ctx.save();
        
        // 主体颜色（根据当前武器变化）
        let primaryColor = '#4ecdc4';
        let secondaryColor = '#45b7b8';
        let accentColor = '#ffffff';
        
        const currentWeapon = this.weaponManager.currentWeapon;
        
        // 根据武器类型改变颜色
        switch(currentWeapon) {
            case 'laser':
                primaryColor = '#00ff00';
                secondaryColor = '#00cc00';
                accentColor = '#ffffff';
                break;
            case 'missile':
                primaryColor = '#ffd700';
                secondaryColor = '#ffcc00';
                accentColor = '#ff4757';
                break;
            case 'plasma':
                primaryColor = '#e74c3c';
                secondaryColor = '#c0392b';
                accentColor = '#ffffff';
                break;
            case 'shotgun':
                primaryColor = '#ff6b6b';
                secondaryColor = '#ff5533';
                accentColor = '#feca57';
                break;
        }
        
        if (this.rapidFire) {
            primaryColor = '#ff6348';
            secondaryColor = '#ff5533';
            accentColor = '#feca57';
        }
        
        // 绘制机身（三角形战斗机）
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y); // 机头
        ctx.lineTo(this.x + 8, this.y + this.height - 5); // 左后
        ctx.lineTo(centerX, this.y + this.height - 15); // 中后
        ctx.lineTo(this.x + this.width - 8, this.y + this.height - 5); // 右后
        ctx.closePath();
        ctx.fill();
        
        // 绘制机翼
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        // 左翼
        ctx.moveTo(this.x + 5, this.y + 15);
        ctx.lineTo(this.x, this.y + 25);
        ctx.lineTo(this.x + 10, this.y + 30);
        ctx.lineTo(this.x + 15, this.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 右翼
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 5, this.y + 15);
        ctx.lineTo(this.x + this.width, this.y + 25);
        ctx.lineTo(this.x + this.width - 10, this.y + 30);
        ctx.lineTo(this.x + this.width - 15, this.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 12, 4, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制引擎喷焰（动态效果）
        this.renderEngineFlame(ctx, currentWeapon);
        
        ctx.restore();

        // 武器指示器
        this.renderWeaponIndicator(ctx, centerX);
        
        // 激光蓄力指示器
        this.renderChargeIndicator(ctx, centerX);

        ctx.globalAlpha = 1;
    }

    /**
     * 渲染引擎喷焰
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} weaponType 
     */
    renderEngineFlame(ctx, weaponType) {
        const time = Date.now() * 0.01;
        const flameLength = this.rapidFire ? 20 : 15;
        const flameWidth = this.rapidFire ? 6 : 4;
        
        // 根据武器类型改变喷焰颜色
        let flameColor1 = this.rapidFire ? '#ff4757' : '#ff6b6b';
        let flameColor2 = this.rapidFire ? '#feca57' : '#ffa502';
        
        if (weaponType === 'laser') {
            flameColor1 = '#00ff00';
            flameColor2 = '#ffffff';
        } else if (weaponType === 'plasma') {
            flameColor1 = '#e74c3c';
            flameColor2 = '#f39c12';
        }
        
        for (let i = 0; i < 3; i++) {
            const flameX = this.x + 12 + i * 8;
            const flameY = this.y + this.height - 5;
            const waver = Math.sin(time + i) * 2;
            
            // 外层火焰
            ctx.fillStyle = flameColor1;
            ctx.beginPath();
            ctx.moveTo(flameX, flameY);
            ctx.lineTo(flameX - flameWidth/2 + waver, flameY + flameLength);
            ctx.lineTo(flameX + flameWidth/2 + waver, flameY + flameLength);
            ctx.closePath();
            ctx.fill();
            
            // 内层火焰
            ctx.fillStyle = flameColor2;
            ctx.beginPath();
            ctx.moveTo(flameX, flameY + 2);
            ctx.lineTo(flameX - flameWidth/4 + waver, flameY + flameLength - 3);
            ctx.lineTo(flameX + flameWidth/4 + waver, flameY + flameLength - 3);
            ctx.closePath();
            ctx.fill();
        }
    }

    /**
     * 渲染武器指示器
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} centerX 
     */
    renderWeaponIndicator(ctx, centerX) {
        const weaponInfo = this.getWeaponInfo();
        
        // 武器名称显示
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // 武器图标
        let weaponIcon = '🔫';
        switch(weaponInfo.current) {
            case 'laser': weaponIcon = '⚡'; break;
            case 'missile': weaponIcon = '🚀'; break;
            case 'plasma': weaponIcon = '🔮'; break;
            case 'shotgun': weaponIcon = '💥'; break;
            case 'double': weaponIcon = '🔫🔫'; break;
        }
        
        ctx.strokeText(weaponIcon, centerX, this.y - 8);
        ctx.fillText(weaponIcon, centerX, this.y - 8);
        
        // 弹药显示（如果有限制）
        if (weaponInfo.ammo !== Infinity) {
            ctx.font = '8px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`${weaponInfo.ammo}/${weaponInfo.maxAmmo}`, centerX, this.y - 18);
        }
    }

    /**
     * 渲染蓄力指示器（激光武器）
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} centerX 
     */
    renderChargeIndicator(ctx, centerX) {
        const weaponInfo = this.getWeaponInfo();
        
        if (weaponInfo.isCharging && weaponInfo.chargeProgress > 0) {
            const barWidth = 30;
            const barHeight = 4;
            const barX = centerX - barWidth / 2;
            const barY = this.y - 30;
            
            // 背景
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 进度
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(barX, barY, barWidth * weaponInfo.chargeProgress, barHeight);
            
            // 边框
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
        
        // 等离子能量条
        if (weaponInfo.current === 'plasma') {
            const energyPercent = weaponInfo.energyPercent || 1;
            const barWidth = 20;
            const barHeight = 3;
            const barX = centerX - barWidth / 2;
            const barY = this.y - 25;
            
            // 背景
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 能量
            ctx.fillStyle = energyPercent > 0.3 ? '#e74c3c' : '#ff6b6b';
            ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);
        }
    }

    /**
     * 重置玩家状态
     */
    reset() {
        this.x = GAME_CONFIG.CANVAS.WIDTH / 2 - this.width / 2;
        this.y = GAME_CONFIG.CANVAS.HEIGHT - this.height - 20;
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.shield = false;
        this.rapidFire = false;
        this.shieldEnd = 0;
        this.rapidFireEnd = 0;
        this.doubleShotEnd = 0;
        this.multiShotEnd = 0;
        
        // 重置武器系统
        this.weaponManager = new WeaponManager();
        
        console.log('🔄 玩家状态已重置');
    }

    /**
     * 碰撞检测
     * @param {Object} other 
     * @returns {boolean}
     */
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    /**
     * 获取玩家状态信息
     * @returns {Object}
     */
    getStatus() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            shield: this.shield,
            rapidFire: this.rapidFire,
            position: { x: this.x, y: this.y },
            weapon: this.getWeaponInfo()
        };
    }
}

export default Player; 