/**
 * 敌机类
 * 包含各种类型的敌机：普通、快速、重型、之字形、Boss
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { Bullet } from './Bullet.js';

// 敌机基类
export class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        const config = GAME_CONFIG.ENEMY.TYPES[type.toUpperCase()];
        this.width = config.width;
        this.height = config.height;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.score = config.score;
        this.speed = 2 * config.speedMultiplier;
        this.color = config.color;
        
        this.active = true;
        this.lastShot = 0;
        this.shootCooldown = 2000; // 2秒射击间隔
        
        // 特殊移动模式参数
        this.movePattern = 'straight';
        this.zigzagTime = 0;
        this.zigzagDirection = 1;
    }

    /**
     * 更新敌机状态
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {Array} enemyBullets - 敌机子弹数组
     */
    update(playerX, playerY, enemyBullets) {
        this.move();
        this.tryShoot(playerX, playerY, enemyBullets);
        
        // 检查是否超出屏幕
        if (this.y > GAME_CONFIG.CANVAS.HEIGHT + this.height) {
            this.active = false;
        }
    }

    /**
     * 移动方法（子类可重写）
     */
    move() {
        this.y += this.speed;
    }

    /**
     * 尝试射击
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {Array} enemyBullets - 敌机子弹数组
     */
    tryShoot(playerX, playerY, enemyBullets) {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown && this.canShoot(playerX, playerY)) {
            this.shoot(playerX, playerY, enemyBullets);
            this.lastShot = now;
        }
    }

    /**
     * 检查是否可以射击
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @returns {boolean}
     */
    canShoot(playerX, playerY) {
        // 只有在玩家前方一定范围内才射击
        return Math.abs(this.x - playerX) < 100 && this.y < playerY;
    }

    /**
     * 射击方法
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {Array} enemyBullets - 敌机子弹数组
     */
    shoot(playerX, playerY, enemyBullets) {
        const bulletX = this.x + this.width / 2 - 2;
        const bulletY = this.y + this.height;
        enemyBullets.push(new Bullet(bulletX, bulletY, 4, true));
    }

    /**
     * 受到伤害
     * @param {number} damage - 伤害值
     * @returns {boolean} 是否死亡
     */
    takeDamage(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.active = false;
            return true;
        }
        return false;
    }

    /**
     * 检查与其他对象的碰撞
     * @param {Object} other - 其他对象
     * @returns {boolean}
     */
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    /**
     * 基础渲染方法（子类会重写）
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        // 血条显示（对于血量大于1的敌机）
        if (this.maxHp > 1) {
            this.renderHealthBar(ctx);
        }
    }

    /**
     * 渲染血条
     * @param {CanvasRenderingContext2D} ctx
     */
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;
        
        // 背景
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = healthPercent > 0.5 ? '#4ecdc4' : 
                       healthPercent > 0.25 ? '#feca57' : '#ff6b6b';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}

// 普通敌机
export class NormalEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'normal');
    }

    render(ctx) {
        super.render(ctx);
        
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 主体（倒三角）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height); // 底部尖端
        ctx.lineTo(this.x + 5, this.y + 5); // 左上
        ctx.lineTo(this.x + this.width - 5, this.y + 5); // 右上
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = '#2c2c54';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 8, 3, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 细节装饰
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x + 8, this.y + 3, 2, 8);
        ctx.fillRect(this.x + this.width - 10, this.y + 3, 2, 8);
        
        ctx.restore();
    }
}

// 快速敌机
export class FastEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'fast');
        this.shootCooldown = 1500; // 更快的射击速度
    }

    render(ctx) {
        super.render(ctx);
        
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 主体（菱形）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y); // 顶部
        ctx.lineTo(this.x + this.width, centerY); // 右
        ctx.lineTo(centerX, this.y + this.height); // 底部
        ctx.lineTo(this.x, centerY); // 左
        ctx.closePath();
        ctx.fill();
        
        // 发光引擎
        ctx.fillStyle = '#feca57';
        ctx.shadowColor = '#feca57';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height - 3, 3, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
}

// 重型敌机
export class HeavyEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'heavy');
        this.shootCooldown = 3000; // 较慢的射击速度
    }

    shoot(playerX, playerY, enemyBullets) {
        // 双管射击
        const leftX = this.x + 8 - 2;
        const rightX = this.x + this.width - 8 - 2;
        const bulletY = this.y + this.height;
        
        enemyBullets.push(new Bullet(leftX, bulletY, 3, true));
        enemyBullets.push(new Bullet(rightX, bulletY, 3, true));
    }

    render(ctx) {
        super.render(ctx);
        
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 主体（方形装甲舰）
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // 炮塔
        ctx.fillStyle = '#40407a';
        ctx.fillRect(this.x + 8, this.y + 2, 6, 12);
        ctx.fillRect(this.x + this.width - 14, this.y + 2, 6, 12);
        
        // 装甲条纹
        ctx.fillStyle = '#706fd3';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x + 5, this.y + 8 + i * 8, this.width - 10, 2);
        }
        
        // 发光推进器
        ctx.fillStyle = '#ff3742';
        ctx.shadowColor = '#ff3742';
        ctx.shadowBlur = 6;
        ctx.fillRect(this.x + 15, this.y + this.height - 3, 4, 8);
        ctx.fillRect(this.x + this.width - 19, this.y + this.height - 3, 4, 8);
        
        ctx.restore();
    }
}

// 之字形敌机
export class ZigzagEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'zigzag');
        this.movePattern = 'zigzag';
        this.shootCooldown = 2500;
    }

    move() {
        // 之字形移动
        this.y += this.speed;
        this.zigzagTime += 0.1;
        this.x += Math.sin(this.zigzagTime) * 3;
        
        // 边界检查
        if (this.x < 0 || this.x + this.width > GAME_CONFIG.CANVAS.WIDTH) {
            this.zigzagTime += Math.PI; // 反向
        }
    }

    render(ctx) {
        super.render(ctx);
        
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 不规则形状
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y);
        ctx.lineTo(this.x + this.width, this.y + 8);
        ctx.lineTo(this.x + this.width - 3, this.y + this.height - 5);
        ctx.lineTo(this.x + 8, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height - 8);
        ctx.lineTo(this.x + 3, this.y + 5);
        ctx.closePath();
        ctx.fill();
        
        // 脉动能量核心
        const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
        ctx.fillStyle = `rgba(255, 99, 72, ${0.6 + pulse * 0.4})`;
        ctx.shadowColor = '#feca57';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 4 + pulse * 2, 4 + pulse * 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
}

// Boss敌机
export class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'boss');
        this.speed = 1; // Boss移动较慢
        this.shootCooldown = 1000; // 频繁射击
        this.lastSpecialAttack = 0;
        this.specialAttackCooldown = 5000; // 5秒特殊攻击
    }

    shoot(playerX, playerY, enemyBullets) {
        // 多管齐射
        const positions = [-15, -5, 5, 15];
        const centerX = this.x + this.width / 2;
        
        positions.forEach(offset => {
            enemyBullets.push(new Bullet(centerX + offset - 2, this.y + this.height, 5, true));
        });
    }

    tryShoot(playerX, playerY, enemyBullets) {
        super.tryShoot(playerX, playerY, enemyBullets);
        
        // 特殊攻击
        const now = Date.now();
        if (now - this.lastSpecialAttack > this.specialAttackCooldown) {
            this.specialAttack(playerX, playerY, enemyBullets);
            this.lastSpecialAttack = now;
        }
    }

    specialAttack(playerX, playerY, enemyBullets) {
        // 扇形弹幕攻击
        const centerX = this.x + this.width / 2;
        const angles = [-30, -15, 0, 15, 30];
        
        angles.forEach(angle => {
            const radians = (angle * Math.PI) / 180;
            const speedX = Math.sin(radians) * 3;
            const speedY = Math.cos(radians) * 4;
            
            const bullet = new Bullet(centerX - 2, this.y + this.height, speedY, true);
            bullet.speedX = speedX; // 添加横向速度
            bullet.update = function() {
                this.x += this.speedX || 0;
                this.y += this.speedY;
                if (this.y > GAME_CONFIG.CANVAS.HEIGHT + this.height || 
                    this.x < -this.width || this.x > GAME_CONFIG.CANVAS.WIDTH) {
                    this.active = false;
                }
            };
            
            enemyBullets.push(bullet);
        });
    }

    render(ctx) {
        super.render(ctx);
        
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 主要舰体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 10, this.y + 5, this.width - 20, this.height - 15);
        
        // 指挥塔
        ctx.fillStyle = '#ff3742';
        ctx.fillRect(this.x + 25, this.y, this.width - 50, 12);
        
        // 四个炮塔
        ctx.fillStyle = '#2c2c54';
        const turretPositions = [
            {x: this.x + 5, y: this.y + 10},
            {x: this.x + this.width - 15, y: this.y + 10},
            {x: this.x + 15, y: this.y + 25},
            {x: this.x + this.width - 25, y: this.y + 25}
        ];
        
        turretPositions.forEach(pos => {
            ctx.fillRect(pos.x, pos.y, 10, 8);
        });
        
        // 主炮
        ctx.fillStyle = '#40407a';
        ctx.fillRect(centerX - 8, this.y + this.height - 8, 16, 12);
        
        // 引擎
        const engineFlicker = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 71, 87, ${engineFlicker})`;
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 12;
        
        for (let i = 0; i < 4; i++) {
            const engineX = this.x + 15 + i * 12;
            ctx.fillRect(engineX, this.y + this.height - 3, 6, 8);
        }
        
        // 发光效果
        ctx.fillStyle = `rgba(255, 255, 255, ${engineFlicker * 0.5})`;
        ctx.fillRect(centerX - 20, this.y + 2, 40, 2);
        
        ctx.restore();
    }
}

export default Enemy; 