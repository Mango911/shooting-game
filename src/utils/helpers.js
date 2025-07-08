/**
 * 游戏工具函数
 * 包含各种辅助功能和通用方法
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

/**
 * 生成随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 限制数值在指定范围内
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的数值
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} t - 插值系数 (0-1)
 * @returns {number} 插值结果
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * 计算两点之间的距离
 * @param {number} x1 - 点1的X坐标
 * @param {number} y1 - 点1的Y坐标
 * @param {number} x2 - 点2的X坐标
 * @param {number} y2 - 点2的Y坐标
 * @returns {number} 距离
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的角度
 * @param {number} x1 - 起点X坐标
 * @param {number} y1 - 起点Y坐标
 * @param {number} x2 - 终点X坐标
 * @param {number} y2 - 终点Y坐标
 * @returns {number} 角度（弧度）
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 角度转弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 弧度转角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

/**
 * 检查矩形碰撞
 * @param {Object} rect1 - 矩形1 {x, y, width, height}
 * @param {Object} rect2 - 矩形2 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
export function rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 检查圆形碰撞
 * @param {Object} circle1 - 圆形1 {x, y, radius}
 * @param {Object} circle2 - 圆形2 {x, y, radius}
 * @returns {boolean} 是否碰撞
 */
export function circleCollision(circle1, circle2) {
    const dist = distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return dist < circle1.radius + circle2.radius;
}

/**
 * 从数组中随机选择一个元素
 * @param {Array} array - 数组
 * @returns {*} 随机元素
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 根据权重随机选择
 * @param {Array} choices - 选择项数组
 * @param {Array} weights - 权重数组
 * @returns {*} 选择的项
 */
export function weightedChoice(choices, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < choices.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return choices[i];
        }
    }
    
    return choices[choices.length - 1];
}

/**
 * 创建屏幕震动效果
 * @param {number} intensity - 震动强度
 * @param {number} duration - 持续时间（毫秒）
 * @returns {Object} 震动对象 {x, y, active, update}
 */
export function createScreenShake(intensity = 5, duration = 300) {
    let startTime = Date.now();
    let active = true;
    
    return {
        x: 0,
        y: 0,
        active: active,
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
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时间字符串
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 格式化分数显示
 * @param {number} score - 分数
 * @returns {string} 格式化的分数字符串
 */
export function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 本地存储管理
 */
export const Storage = {
    /**
     * 保存数据
     * @param {string} key - 键名
     * @param {*} data - 数据
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    },

    /**
     * 读取数据
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 读取的数据
     */
    load(key, defaultValue = null) {
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
     * @param {string} key - 键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('删除数据失败:', error);
        }
    },

    /**
     * 清除所有数据
     */
    clear() {
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
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * 监听事件
     * @param {string} eventName - 事件名
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 取消监听事件
     * @param {string} eventName - 事件名
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        
        const index = this.events[eventName].indexOf(callback);
        if (index > -1) {
            this.events[eventName].splice(index, 1);
        }
    }

    /**
     * 触发事件
     * @param {string} eventName - 事件名
     * @param {...*} args - 参数
     */
    emit(eventName, ...args) {
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
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
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
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 保存最高分
 * @param {number} score - 分数
 */
export function saveHighScore(score) {
    const currentHighScore = loadHighScore();
    if (score > currentHighScore) {
        Storage.save('highScore', score);
        return true; // 新记录
    }
    return false;
}

/**
 * 读取最高分
 * @returns {number} 最高分
 */
export function loadHighScore() {
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