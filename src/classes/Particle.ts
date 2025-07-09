/**
 * 粒子系统
 * 处理爆炸、闪光等视觉效果
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';

interface TrailPoint {
    x: number;
    y: number;
}

// 基础粒子类
export class Particle {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public life: number;
    public maxLife: number;
    public color: string;
    public size: number;
    public active: boolean;
    public gravity: number;
    public rotation: number;
    public rotationSpeed: number;

    constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number = 2) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.active = true;
        this.gravity = 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    /**
     * 更新粒子状态
     */
    update(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        
        this.life--;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    /**
     * 渲染粒子
     * @param ctx
     */
    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        const alpha = this.life / this.maxLife;
        const currentSize = this.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillRect(-currentSize/2, -currentSize/2, currentSize, currentSize);
        
        ctx.restore();
    }
}

// 圆形粒子
export class CircleParticle extends Particle {
    constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number = 3) {
        super(x, y, vx, vy, life, color, size);
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        const alpha = this.life / this.maxLife;
        const currentSize = this.size * (0.5 + alpha * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        // 添加发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = currentSize * 2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 火花粒子（拖尾效果）
export class SparkParticle extends Particle {
    public trail: TrailPoint[];
    public trailLength: number;

    constructor(x: number, y: number, vx: number, vy: number, life: number, color: string) {
        super(x, y, vx, vy, life, color, 1);
        this.trail = [];
        this.trailLength = 8;
    }

    update(): void {
        // 记录轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        super.update();
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        const alpha = this.life / this.maxLife;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 绘制拖尾
        if (this.trail.length > 1) {
            for (let i = 1; i < this.trail.length; i++) {
                const trailAlpha = (i / this.trail.length) * alpha;
                const lineWidth = (i / this.trail.length) * 2;
                
                ctx.globalAlpha = trailAlpha;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = lineWidth;
                
                ctx.beginPath();
                ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
            }
        }

        // 绘制粒子本体
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// 粒子系统管理器
export class ParticleSystem {
    public particles: Particle[];

    constructor() {
        this.particles = [];
    }

    /**
     * 添加粒子
     * @param particle
     */
    addParticle(particle: Particle): void {
        this.particles.push(particle);
    }

    /**
     * 创建爆炸效果
     * @param x - X坐标
     * @param y - Y坐标
     * @param color - 爆炸颜色
     * @param intensity - 强度（粒子数量倍数）
     */
    createExplosion(x: number, y: number, color: string = '#ff6b6b', intensity: number = 1): void {
        const particleCount = GAME_CONFIG.PARTICLE.EXPLOSION_COUNT * intensity;
        const sparkCount = GAME_CONFIG.PARTICLE.SPARK_COUNT * intensity;
        
        // 创建圆形爆炸粒子
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = GAME_CONFIG.PARTICLE.LIFE_TIME + Math.random() * 20;
            const size = 2 + Math.random() * 3;
            
            const particle = new CircleParticle(x, y, vx, vy, life, color, size);
            this.addParticle(particle);
        }

        // 创建火花粒子
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 20 + Math.random() * 15;
            
            const sparkColor = i % 2 === 0 ? '#feca57' : color;
            const spark = new SparkParticle(x, y, vx, vy, life, sparkColor);
            this.addParticle(spark);
        }
    }

    /**
     * 创建Boss爆炸效果
     * @param x 
     * @param y 
     */
    createBossExplosion(x: number, y: number): void {
        // 多重爆炸效果
        this.createExplosion(x, y, '#ff3742', 2);
        
        setTimeout(() => {
            this.createExplosion(x - 20, y - 10, '#feca57', 1.5);
        }, 100);
        
        setTimeout(() => {
            this.createExplosion(x + 20, y + 10, '#ff6b6b', 1.5);
        }, 200);
        
        setTimeout(() => {
            this.createExplosion(x, y - 15, '#ffffff', 1);
        }, 300);
    }

    /**
     * 创建屏幕震动效果的闪光粒子
     * @param x 
     * @param y 
     */
    createFlashEffect(x: number, y: number): void {
        const flashCount = GAME_CONFIG.PARTICLE.FLASH_COUNT;
        
        for (let i = 0; i < flashCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            const flashX = x + Math.cos(angle) * distance;
            const flashY = y + Math.sin(angle) * distance;
            
            const particle = new CircleParticle(
                flashX, flashY, 
                0, 0, 
                10, 
                '#ffffff', 
                5 + Math.random() * 10
            );
            particle.gravity = 0; // 闪光粒子不受重力影响
            this.addParticle(particle);
        }
    }

    /**
     * 创建道具收集效果
     * @param x 
     * @param y 
     * @param color 
     */
    createPickupEffect(x: number, y: number, color: string): void {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 1 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2; // 向上飘
            const life = 30 + Math.random() * 10;
            
            const particle = new CircleParticle(x, y, vx, vy, life, color, 3);
            particle.gravity = -0.05; // 向上浮力
            this.addParticle(particle);
        }
    }

    /**
     * 创建推进器尾迹效果
     * @param x 
     * @param y 
     * @param color 
     */
    createThrusterEffect(x: number, y: number, color: string = '#ff6b6b'): void {
        if (Math.random() < 0.7) { // 70%概率生成尾迹
            const vx = (Math.random() - 0.5) * 2;
            const vy = 3 + Math.random() * 2;
            const life = 8 + Math.random() * 6;
            
            const particle = new CircleParticle(x, y, vx, vy, life, color, 2);
            particle.gravity = 0.05;
            this.addParticle(particle);
        }
    }

    /**
     * 更新所有粒子
     */
    update(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (!particle.active) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 渲染所有粒子
     * @param ctx
     */
    render(ctx: CanvasRenderingContext2D): void {
        this.particles.forEach(particle => particle.render(ctx));
    }

    /**
     * 清除所有粒子
     */
    clear(): void {
        this.particles = [];
    }

    /**
     * 获取粒子数量
     * @returns 粒子数量
     */
    getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * 销毁粒子系统
     */
    destroy(): void {
        this.clear();
        console.log('✨ 粒子系统已销毁');
    }
}

export default ParticleSystem; 