/**
 * 游戏工具函数
 * 包含各种辅助功能和通用方法
 */

import type { ScreenShake, EventCallback, IEventEmitter } from '../types/global.js';

// 矩形碰撞检测接口
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// 圆形碰撞检测接口
interface Circle {
    x: number;
    y: number;
    radius: number;
}

/**
 * 生成随机数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机数
 */
export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 限制数值在指定范围内
 * @param value - 数值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param start - 起始值
 * @param end - 结束值
 * @param t - 插值系数 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * 计算两点之间的距离
 * @param x1 - 点1的X坐标
 * @param y1 - 点1的Y坐标
 * @param x2 - 点2的X坐标
 * @param y2 - 点2的Y坐标
 * @returns 距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的角度
 * @param x1 - 起点X坐标
 * @param y1 - 起点Y坐标
 * @param x2 - 终点X坐标
 * @param y2 - 终点Y坐标
 * @returns 角度（弧度）
 */
export function angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 角度转弧度
 * @param degrees - 角度
 * @returns 弧度
 */
export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * 弧度转角度
 * @param radians - 弧度
 * @returns 角度
 */
export function radToDeg(radians: number): number {
    return radians * 180 / Math.PI;
}

/**
 * 检查矩形碰撞
 * @param rect1 - 矩形1
 * @param rect2 - 矩形2
 * @returns 是否碰撞
 */
export function rectCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 检查圆形碰撞
 * @param circle1 - 圆形1
 * @param circle2 - 圆形2
 * @returns 是否碰撞
 */
export function circleCollision(circle1: Circle, circle2: Circle): boolean {
    const dist = distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return dist < circle1.radius + circle2.radius;
}

/**
 * 从数组中随机选择一个元素
 * @param array - 数组
 * @returns 随机元素
 */
export function randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
        throw new Error('Cannot choose from empty array');
    }
    return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * 根据权重随机选择
 * @param choices - 选择项数组
 * @param weights - 权重数组
 * @returns 选择的项
 */
export function weightedChoice<T>(choices: T[], weights: number[]): T {
    if (choices.length === 0 || weights.length === 0) {
        throw new Error('Cannot choose from empty arrays');
    }
    if (choices.length !== weights.length) {
        throw new Error('Choices and weights arrays must have the same length');
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < choices.length; i++) {
        random -= weights[i]!;
        if (random <= 0) {
            return choices[i]!;
        }
    }
    
    return choices[choices.length - 1]!;
}

/**
 * 创建屏幕震动效果
 * @param intensity - 震动强度
 * @param duration - 持续时间（毫秒）
 * @returns 震动对象
 */
export function createScreenShake(intensity: number = 5, duration: number = 300): ScreenShake & { 
    update(): void; 
    x: number; 
    y: number; 
    active: boolean; 
} {
    const startTime = Date.now();
    const active = true;
    
    return {
        x: 0,
        y: 0,
        duration,
        intensity,
        active,
        update() {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
                this.active = false;
                this.x = 0;
                this.y = 0;
                return;
            }
            
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);
            
            this.x = (Math.random() - 0.5) * currentIntensity * 2;
            this.y = (Math.random() - 0.5) * currentIntensity * 2;
        }
    };
}

/**
 * 格式化时间显示
 * @param seconds - 秒数
 * @returns 格式化的时间字符串
 */
export function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 格式化分数显示
 * @param score - 分数
 * @returns 格式化的分数字符串
 */
export function formatScore(score: number): string {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 本地存储管理
 */
export const Storage = {
    /**
     * 保存数据
     * @param key - 键名
     * @param data - 数据
     */
    save(key: string, data: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    },

    /**
     * 读取数据
     * @param key - 键名
     * @param defaultValue - 默认值
     * @returns 读取的数据
     */
    load<T>(key: string, defaultValue: T = null as T): T {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },

    /**
     * 删除数据
     * @param key - 键名
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('删除数据失败:', error);
        }
    },

    /**
     * 清除所有数据
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('清除数据失败:', error);
        }
    }
};

/**
 * 简单的事件发射器
 */
export class EventEmitter implements IEventEmitter {
    private events: Record<string, EventCallback[]> = {};

    /**
     * 监听事件
     * @param eventName - 事件名
     * @param callback - 回调函数
     */
    on(eventName: string, callback: EventCallback): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 取消监听事件
     * @param eventName - 事件名
     * @param callback - 回调函数
     */
    off(eventName: string, callback: EventCallback): void {
        if (!this.events[eventName]) return;
        
        const index = this.events[eventName].indexOf(callback);
        if (index > -1) {
            this.events[eventName].splice(index, 1);
        }
    }

    /**
     * 触发事件
     * @param eventName - 事件名
     * @param args - 参数
     */
    emit(eventName: string, ...args: any[]): void {
        if (!this.events[eventName]) return;
        
        this.events[eventName].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error('事件回调执行错误:', error);
            }
        });
    }
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param limit - 时间限制
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function executedFunction(this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 保存最高分
 * @param score - 分数
 * @returns 是否为新记录
 */
export function saveHighScore(score: number): boolean {
    const currentHighScore = loadHighScore();
    if (score > currentHighScore) {
        Storage.save('highScore', score);
        return true; // 新记录
    }
    return false;
}

/**
 * 读取最高分
 * @returns 最高分
 */
export function loadHighScore(): number {
    return Storage.load('highScore', 0);
}

export default {
    random,
    randomInt,
    clamp,
    lerp,
    distance,
    angle,
    degToRad,
    radToDeg,
    rectCollision,
    circleCollision,
    randomChoice,
    weightedChoice,
    createScreenShake,
    formatTime,
    formatScore,
    saveHighScore,
    loadHighScore,
    Storage,
    EventEmitter,
    debounce,
    throttle
}; 