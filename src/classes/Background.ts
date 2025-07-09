/**
 * 背景星空系统
 * 处理动态星空背景效果
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';
import {  random  } from '../utils/helpers.js';

/**
 * 星星类
 */
class Star {
    public canvas: { width: number; height: number };
    public x: number;
    public y: number;
    public speed: number;
    public size: number;
    public brightness: number;
    public color: string;
    public type: string;
    public twinklePhase: number;
    public twinkleSpeed: number;

    constructor(canvas: { width: number; height: number }) {
        this.canvas = canvas;
        this.reset();
        this.y = random(0, canvas.height); // 初始化时随机分布
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.03;
    }

    /**
     * 重置星星位置和属性
     */
    reset() {
        this.x = random(0, this.canvas.width);
        this.y = -5;
        this.speed = random(GAME_CONFIG.BACKGROUND.STAR_SPEED_MIN, GAME_CONFIG.BACKGROUND.STAR_SPEED_MAX);
        this.size = random(0.5, 3);
        this.brightness = random(0.3, 1);
        this.color = this.getStarColor();
        this.type = this.getStarType();
    }

    /**
     * 获取星星颜色
     * @returns {string} 星星颜色
     */
    getStarColor() {
        const colors = [
            '#ffffff', // 白色
            '#ffffcc', // 淡黄色
            '#ccccff', // 淡蓝色
            '#ffcccc', // 淡红色
            '#ccffcc', // 淡绿色
            '#ffccff'  // 淡紫色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 获取星星类型
     * @returns {string} 星星类型
     */
    getStarType() {
        const rand = Math.random();
        if (rand < 0.7) return 'normal';      // 70% 普通星
        if (rand < 0.9) return 'bright';     // 20% 明亮星
        return 'twinkle';                     // 10% 闪烁星
    }

    /**
     * 更新星星状态
     */
    update() {
        this.y += this.speed;
        this.twinklePhase += this.twinkleSpeed;

        // 如果星星移出屏幕，重置位置
        if (this.y > this.canvas.height + 5) {
            this.reset();
        }
    }

    /**
     * 渲染星星
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        let currentBrightness = this.brightness;
        let currentSize = this.size;

        // 根据类型应用特殊效果
        switch (this.type) {
            case 'bright':
                // 明亮星星有光晕效果
                currentBrightness = Math.min(1, this.brightness * 1.5);
                this.renderGlow(ctx, currentBrightness);
                break;
            
            case 'twinkle':
                // 闪烁星星
                const twinkle = (Math.sin(this.twinklePhase) + 1) / 2;
                currentBrightness = this.brightness * (0.3 + twinkle * 0.7);
                currentSize = this.size * (0.8 + twinkle * 0.4);
                this.renderTwinkle(ctx, twinkle);
                break;
        }

        // 设置透明度
        ctx.globalAlpha = currentBrightness;
        ctx.fillStyle = this.color;

        // 绘制星星主体
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 渲染光晕效果
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} brightness
     */
    renderGlow(ctx: CanvasRenderingContext2D, brightness: number) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 4
        );
        gradient.addColorStop(0, this.color + Math.floor(brightness * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, this.color + '20');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 渲染闪烁效果（十字光芒）
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} twinkle
     */
    renderTwinkle(ctx: CanvasRenderingContext2D, twinkle: number) {
        if (twinkle > 0.7) { // 只在亮度较高时显示光芒
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = (twinkle - 0.7) * 3; // 0.7-1.0 映射到 0-0.9

            const rayLength = this.size * 8;
            
            // 绘制十字光芒
            ctx.beginPath();
            // 水平线
            ctx.moveTo(this.x - rayLength, this.y);
            ctx.lineTo(this.x + rayLength, this.y);
            // 垂直线
            ctx.moveTo(this.x, this.y - rayLength);
            ctx.lineTo(this.x, this.y + rayLength);
            
            ctx.stroke();
        }
    }
}

/**
 * 背景星空系统
 */
export class Background {
    public canvas: { width: number; height: number };
    public stars: Star[];
    public nebulaPhase: number;
    public nebulaSpeed: number;

    constructor(width: number, height: number) {
        this.canvas = { width, height };
        this.stars = [];
        this.initStars();
        
        // 星云效果参数
        this.nebulaPhase = 0;
        this.nebulaSpeed = 0.005;
    }

    /**
     * 初始化星星
     */
    initStars() {
        this.stars = [];
        for (let i = 0; i < GAME_CONFIG.BACKGROUND.STAR_COUNT; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    /**
     * 更新背景
     */
    update() {
        // 更新所有星星
        this.stars.forEach(star => star.update());
        
        // 更新星云效果
        this.nebulaPhase += this.nebulaSpeed;
    }

    /**
     * 渲染背景
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx: CanvasRenderingContext2D) {
        // 清除画布并设置背景色
        ctx.fillStyle = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染星云效果
        this.renderNebula(ctx);

        // 渲染星星
        this.stars.forEach(star => star.render(ctx));
    }

    /**
     * 渲染星云效果
     * @param {CanvasRenderingContext2D} ctx
     */
    renderNebula(ctx: CanvasRenderingContext2D) {
        // 检查canvas尺寸是否有效
        if (!this.canvas.width || !this.canvas.height || 
            this.canvas.width <= 0 || this.canvas.height <= 0 ||
            !isFinite(this.canvas.width) || !isFinite(this.canvas.height)) {
            return;
        }

        ctx.save();

        try {
            // 计算渐变参数并验证
            const centerX = this.canvas.width * 0.7;
            const centerY = this.canvas.height * 0.3;
            const radius = this.canvas.width * 0.8;

            // 确保所有值都是有限数字
            if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(radius) || radius <= 0) {
                ctx.restore();
                return;
            }

            // 创建星云渐变
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

                    // 动态透明度
            const alpha = Math.floor((Math.sin(this.nebulaPhase) + 1) * 5 + 5).toString(16).padStart(2, '0');
            
            gradient.addColorStop(0, `#4a69bd${alpha}`);
            gradient.addColorStop(0.3, `#1e3799${alpha}`);
            gradient.addColorStop(0.7, `#0c2461${alpha}`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 添加第二层星云
            const center2X = this.canvas.width * 0.2;
            const center2Y = this.canvas.height * 0.8;
            const radius2 = this.canvas.width * 0.6;

            // 验证第二个渐变的参数
            if (isFinite(center2X) && isFinite(center2Y) && isFinite(radius2) && radius2 > 0) {
                const gradient2 = ctx.createRadialGradient(center2X, center2Y, 0, center2X, center2Y, radius2);

                const alpha2 = Math.floor((Math.sin(this.nebulaPhase + Math.PI) + 1) * 3 + 3).toString(16).padStart(2, '0');
                
                gradient2.addColorStop(0, `#8c7ae6${alpha2}`);
                gradient2.addColorStop(0.4, `#6c5ce7${alpha2}`);
                gradient2.addColorStop(0.8, `#2d3436${alpha2}`);
                gradient2.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

        } catch (error) {
            console.warn('星云渲染错误:', error);
        }

        ctx.restore();
    }

    /**
     * 调整星星数量（用于性能优化）
     * @param {number} count
     */
    setStarCount(count) {
        const currentCount = this.stars.length;
        
        if (count > currentCount) {
            // 添加星星
            for (let i = currentCount; i < count; i++) {
                this.stars.push(new Star(this.canvas));
            }
        } else if (count < currentCount) {
            // 移除星星
            this.stars.splice(count);
        }
    }

    /**
     * 设置星星移动速度（用于游戏状态变化）
     * @param {number} multiplier - 速度倍数
     */
    setSpeedMultiplier(multiplier) {
        this.stars.forEach(star => {
            star.speed = random(
                GAME_CONFIG.BACKGROUND.STAR_SPEED_MIN * multiplier,
                GAME_CONFIG.BACKGROUND.STAR_SPEED_MAX * multiplier
            );
        });
    }

    /**
     * 重置背景（用于游戏重新开始）
     */
    reset() {
        this.initStars();
        this.nebulaPhase = 0;
    }

    /**
     * 获取星星数量
     * @returns {number}
     */
    getStarCount() {
        return this.stars.length;
    }
}

export default Background; 