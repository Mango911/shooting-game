/**
 * 道具类
 * 处理游戏中各种道具的行为和渲染
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 20;
        this.height = 20;
        this.speed = 2;
        this.active = true;
        this.bobOffset = Math.random() * Math.PI * 2; // 随机浮动相位
        this.glowPhase = 0;
        
        // 道具配置
        this.config = this.getTypeConfig(type);
    }

    /**
     * 获取道具类型配置
     * @param {string} type - 道具类型
     * @returns {Object} 道具配置
     */
    getTypeConfig(type) {
        const configs = {
            health: {
                color: '#ff6b6b',
                secondaryColor: '#ff5252',
                symbol: '❤',
                name: '生命恢复'
            },
            doubleShot: {
                color: '#feca57',
                secondaryColor: '#ff9ff3',
                symbol: '××',
                name: '双重射击'
            },
            shield: {
                color: '#3742fa',
                secondaryColor: '#2f3542',
                symbol: '🛡',
                name: '护盾保护'
            },
            rapidFire: {
                color: '#ff6348',
                secondaryColor: '#ff3838',
                symbol: '⚡',
                name: '快速射击'
            },
            multiShot: {
                color: '#7bed9f',
                secondaryColor: '#5f27cd',
                symbol: '◊◊◊',
                name: '三重射击'
            },
            laser: {
                color: '#00ff00',
                secondaryColor: '#00cc00',
                symbol: '⚡',
                name: '激光炮'
            },
            missile: {
                color: '#ffd700',
                secondaryColor: '#ffcc00',
                symbol: '🚀',
                name: '导弹发射器'
            },
            plasma: {
                color: '#e74c3c',
                secondaryColor: '#c0392b',
                symbol: '🔮',
                name: '等离子炮'
            }
        };
        
        return configs[type] || configs.health;
    }

    /**
     * 更新道具状态
     */
    update() {
        // 向下移动
        this.y += this.speed;
        
        // 浮动效果
        this.glowPhase += 0.1;
        
        // 检查是否超出屏幕
        if (this.y > GAME_CONFIG.CANVAS.HEIGHT + this.height) {
            this.active = false;
        }
    }

    /**
     * 渲染道具
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 浮动效果
        const bobAmount = Math.sin(Date.now() * 0.005 + this.bobOffset) * 2;
        const currentY = centerY + bobAmount;
        
        // 发光效果
        const glowIntensity = (Math.sin(this.glowPhase) + 1) / 2;
        const glowSize = 8 + glowIntensity * 4;
        
        // 外层光晕
        const gradient = ctx.createRadialGradient(
            centerX, currentY, 0,
            centerX, currentY, glowSize
        );
        gradient.addColorStop(0, this.config.color + '40');
        gradient.addColorStop(0.7, this.config.color + '20');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, currentY, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 主体形状
        this.renderMainShape(ctx, centerX, currentY, glowIntensity);
        
        // 符号或图标
        this.renderSymbol(ctx, centerX, centerY);
        
        // 边框
        ctx.strokeStyle = this.config.secondaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, currentY, this.width / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * 渲染主体形状
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} glowIntensity 
     */
    renderMainShape(ctx, centerX, centerY, glowIntensity) {
        // 根据道具类型渲染不同形状
        switch (this.type) {
            case 'health':
                this.renderHeartShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'shield':
                this.renderShieldShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'doubleShot':
            case 'multiShot':
                this.renderWeaponShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'rapidFire':
                this.renderLightningShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'laser':
                this.renderLaserShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'missile':
                this.renderMissileShape(ctx, centerX, centerY, glowIntensity);
                break;
            case 'plasma':
                this.renderPlasmaShape(ctx, centerX, centerY, glowIntensity);
                break;
            default:
                this.renderDefaultShape(ctx, centerX, centerY, glowIntensity);
                break;
        }
    }

    /**
     * 渲染心形（生命道具）
     */
    renderHeartShape(ctx, centerX, centerY, glowIntensity) {
        const size = 6 + glowIntensity * 2;
        
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + size/2);
        ctx.bezierCurveTo(centerX - size, centerY - size/2, centerX - size, centerY - size, centerX, centerY - size/4);
        ctx.bezierCurveTo(centerX + size, centerY - size, centerX + size, centerY - size/2, centerX, centerY + size/2);
        ctx.fill();
    }

    /**
     * 渲染盾牌形状
     */
    renderShieldShape(ctx, centerX, centerY, glowIntensity) {
        const size = 8 + glowIntensity;
        
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX + size * 0.7, centerY - size * 0.3);
        ctx.lineTo(centerX + size * 0.7, centerY + size * 0.3);
        ctx.lineTo(centerX, centerY + size);
        ctx.lineTo(centerX - size * 0.7, centerY + size * 0.3);
        ctx.lineTo(centerX - size * 0.7, centerY - size * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 渲染武器形状
     */
    renderWeaponShape(ctx, centerX, centerY, glowIntensity) {
        const size = 6 + glowIntensity;
        
        ctx.fillStyle = this.config.color;
        // 绘制子弹形状
        for (let i = 0; i < (this.type === 'multiShot' ? 3 : 2); i++) {
            const offsetX = (i - (this.type === 'multiShot' ? 1 : 0.5)) * 4;
            ctx.beginPath();
            ctx.ellipse(centerX + offsetX, centerY, 2, size, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * 渲染闪电形状
     */
    renderLightningShape(ctx, centerX, centerY, glowIntensity) {
        const size = 8 + glowIntensity;
        
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.moveTo(centerX - size/3, centerY - size);
        ctx.lineTo(centerX + size/3, centerY - size/3);
        ctx.lineTo(centerX, centerY - size/3);
        ctx.lineTo(centerX + size/3, centerY + size);
        ctx.lineTo(centerX - size/3, centerY + size/3);
        ctx.lineTo(centerX, centerY + size/3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 渲染默认圆形
     */
    renderDefaultShape(ctx, centerX, centerY, glowIntensity) {
        const size = 8 + glowIntensity;
        
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染激光形状
     */
    renderLaserShape(ctx, centerX, centerY, glowIntensity) {
        const size = 8 + glowIntensity;
        
        // 激光束效果
        ctx.fillStyle = this.config.color;
        ctx.fillRect(centerX - 2, centerY - size, 4, size * 2);
        
        // 发光核心
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, centerY - size + 2, 2, size * 2 - 4);
        
        // 激光聚焦点
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY - size - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染导弹形状
     */
    renderMissileShape(ctx, centerX, centerY, glowIntensity) {
        const size = 8 + glowIntensity;
        
        // 导弹主体
        ctx.fillStyle = this.config.color;
        ctx.fillRect(centerX - 2, centerY - size, 4, size * 1.5);
        
        // 导弹头部
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX - 3, centerY - size + 4);
        ctx.lineTo(centerX + 3, centerY - size + 4);
        ctx.closePath();
        ctx.fill();
        
        // 尾翼
        ctx.fillStyle = this.config.secondaryColor;
        ctx.fillRect(centerX - 4, centerY + size/2, 2, 3);
        ctx.fillRect(centerX + 2, centerY + size/2, 2, 3);
    }

    /**
     * 渲染等离子形状
     */
    renderPlasmaShape(ctx, centerX, centerY, glowIntensity) {
        const size = 6 + glowIntensity;
        const time = Date.now() * 0.01;
        
        // 等离子球核心
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 能量环
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size + 3 + Math.sin(time) * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        
        // 内部亮核
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染符号
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} centerX 
     * @param {number} centerY 
     */
    renderSymbol(ctx, centerX, centerY) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 添加描边以提高可读性
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(this.config.symbol, centerX, centerY);
        ctx.fillText(this.config.symbol, centerX, centerY);
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
     * 销毁道具
     */
    destroy() {
        this.active = false;
    }

    /**
     * 获取道具名称
     * @returns {string}
     */
    getName() {
        return this.config.name;
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
            height: this.height
        };
    }
}

export default PowerUp; 