/**
 * 子弹类（扩展版）
 * 处理游戏中所有子弹的行为和渲染，支持多种武器特性
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class Bullet {
    constructor(x, y, speedY, type = 'normal', damage = 1) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.BULLET.WIDTH;
        this.height = GAME_CONFIG.BULLET.HEIGHT;
        this.speedY = speedY;
        this.vx = 0; // 水平速度（散弹枪用）
        this.type = type; // 'normal', 'enemy', 'player'
        this.damage = damage;
        this.color = type === 'enemy' ? '#ff6b6b' : GAME_CONFIG.BULLET.COLOR;
        this.active = true;
        
        // 武器特性
        this.piercing = false; // 穿透
        this.homing = false; // 追踪
        this.explosive = false; // 爆炸
        this.target = null; // 追踪目标
        this.turnSpeed = 0.05; // 转向速度
        this.maxHits = 1; // 最大命中次数（穿透用）
        this.hitCount = 0;
        
        // 视觉效果
        this.glow = false; // 发光
        this.trail = false; // 尾迹
        this.expanding = false; // 扩展效果
        this.size = 4; // 尺寸
        this.maxSize = 10;
        this.currentSize = this.size;
        this.particles = []; // 粒子尾迹
        
        // 生命周期
        this.lifeTime = 5000; // 生存时间（毫秒）
        this.createdAt = Date.now();
        
        this.isEnemyBullet = type === 'enemy'; // 兼容性
    }

    /**
     * 更新子弹位置和特效
     */
    update() {
        const deltaTime = 16; // 假设60FPS
        
        // 追踪逻辑
        if (this.homing && this.target && this.target.active !== false) {
            this.updateHoming();
        }
        
        // 更新位置
        this.x += this.vx;
        this.y += this.speedY;
        
        // 扩展效果
        if (this.expanding && this.currentSize < this.maxSize) {
            this.currentSize += 0.2;
        }
        
        // 更新粒子尾迹
        if (this.trail) {
            this.updateTrail();
        }
        
        // 检查生命周期
        if (Date.now() - this.createdAt > this.lifeTime) {
            this.active = false;
        }
        
        // 检查边界
        if (this.y < -this.height - 50 || this.y > GAME_CONFIG.CANVAS.HEIGHT + 50 ||
            this.x < -this.width - 50 || this.x > GAME_CONFIG.CANVAS.WIDTH + 50) {
            this.active = false;
        }
    }

    /**
     * 更新追踪逻辑
     */
    updateHoming() {
        if (!this.target) return;
        
        const targetX = this.target.x + this.target.width / 2;
        const targetY = this.target.y + this.target.height / 2;
        
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        
        const angle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(this.speedY, this.vx);
        
        // 计算角度差
        let angleDiff = angle - currentAngle;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // 逐渐调整方向
        const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);
        
        const speed = Math.sqrt(this.speedY * this.speedY + this.vx * this.vx);
        this.vx = Math.cos(newAngle) * speed;
        this.speedY = Math.sin(newAngle) * speed;
    }

    /**
     * 更新尾迹粒子
     */
    updateTrail() {
        // 添加新粒子
        if (Math.random() < 0.7) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 4,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 20,
                maxLife: 20,
                size: Math.random() * 2 + 1,
                color: this.color
            });
        }
        
        // 更新现有粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.size *= 0.95;
            return particle.life > 0;
        });
    }

    /**
     * 处理命中
     * @param {Object} target - 被命中的目标
     * @returns {boolean} 是否应该销毁子弹
     */
    onHit(target) {
        this.hitCount++;
        
        if (this.explosive) {
            // 爆炸效果将由外部处理
            return true;
        }
        
        if (this.piercing && this.hitCount < this.maxHits) {
            return false; // 穿透，不销毁
        }
        
        return true; // 普通子弹命中后销毁
    }

    /**
     * 渲染子弹
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // 渲染尾迹粒子
        if (this.trail) {
            this.renderTrail(ctx);
        }
        
        // 根据类型渲染不同效果
        switch(true) {
            case this.type === 'enemy':
                this.renderEnemyBullet(ctx);
                break;
            case this.glow:
                this.renderGlowBullet(ctx);
                break;
            case this.homing:
                this.renderMissile(ctx);
                break;
            case this.expanding:
                this.renderPlasma(ctx);
                break;
            default:
                this.renderNormalBullet(ctx);
                break;
        }
        
        ctx.restore();
    }

    /**
     * 渲染尾迹
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderTrail(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * 渲染普通子弹
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderNormalBullet(ctx) {
        // 光晕效果
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
        }
        
        // 主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 
                   this.width/2, this.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 核心亮点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 
                   this.width/4, this.height/4, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * 渲染敌机子弹
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderEnemyBullet(ctx) {
        const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
        
        // 外层光晕
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 8;
        
        // 主体（椭圆形）
        ctx.fillStyle = `rgba(255, 107, 107, ${0.8 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 
                   this.width/2 + pulse * 2, this.height/2 + pulse * 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 内层高亮
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, 
                   this.width/4, this.height/4, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * 渲染发光子弹（激光）
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderGlowBullet(ctx) {
        // 强烈光晕
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 激光束效果
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 中心亮线
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + this.width/3, this.y, this.width/3, this.height);
        
        // 边缘光晕
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 3, this.y, this.width + 6, this.height);
    }

    /**
     * 渲染导弹
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderMissile(ctx) {
        // 导弹主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 导弹头部
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height/3);
        ctx.lineTo(this.x + this.width, this.y + this.height/3);
        ctx.closePath();
        ctx.fill();
        
        // 尾焰
        const time = Date.now() * 0.01;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/4, this.y + this.height);
        ctx.lineTo(this.x + this.width/2, this.y + this.height + 8 + Math.sin(time) * 2);
        ctx.lineTo(this.x + 3*this.width/4, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 渲染等离子球
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderPlasma(ctx) {
        const size = this.currentSize;
        const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        
        // 外层能量环
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, size + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // 主体
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, size/3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 检查与另一个对象的碰撞
     * @param {Object} other - 其他对象
     * @returns {boolean} 是否发生碰撞
     */
    collidesWith(other) {
        if (this.expanding) {
            // 圆形碰撞检测（等离子球）
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const otherCenterX = other.x + other.width / 2;
            const otherCenterY = other.y + other.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(centerX - otherCenterX, 2) + Math.pow(centerY - otherCenterY, 2)
            );
            
            return distance < this.currentSize + Math.min(other.width, other.height) / 2;
        }
        
        // 矩形碰撞检测
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    /**
     * 销毁子弹
     */
    destroy() {
        this.active = false;
    }

    /**
     * 获取边界框
     * @returns {Object}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }
}

export default Bullet; 