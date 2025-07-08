/**
 * 游戏主入口文件
 * 负责初始化游戏并处理UI交互
 */

import Game from './Game.js';

// 全局游戏实例
let game = null;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const loadingScreen = document.getElementById('loadingScreen');
const errorScreen = document.getElementById('errorScreen');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const retryBtn = document.getElementById('retryBtn');
const loadingText = document.getElementById('loadingText');
const progressBar = document.getElementById('progressBar');

/**
 * 显示加载进度
 * @param {number} progress - 进度 (0-100)
 * @param {string} text - 加载文本
 */
function updateLoadingProgress(progress, text) {
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/**
 * 隐藏加载屏幕
 */
function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

/**
 * 显示错误屏幕
 * @param {string} message - 错误消息
 */
function showErrorScreen(message) {
    hideLoadingScreen();
    if (errorScreen) {
        document.getElementById('errorMessage').textContent = message;
        errorScreen.style.display = 'flex';
    }
}

/**
 * 初始化音频控制
 */
function initAudioControls() {
    if (!game || !game.audioManager) return;

    // 静音按钮
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            game.audioManager.toggleMute();
            muteBtn.textContent = game.audioManager.muted ? '🔇 静音' : '🔊 音效';
        });
    }

    // 音量滑块
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            game.audioManager.setVolume(volume);
            if (volumeValue) {
                volumeValue.textContent = `${e.target.value}%`;
            }
        });
    }

    console.log('🎵 音频控制初始化完成');
}

/**
 * 检查浏览器兼容性
 */
function checkBrowserSupport() {
    const issues = [];

    // 检查 Canvas 支持
    if (!canvas.getContext) {
        issues.push('Canvas API');
    }

    // 检查 ES6 模块支持（如果到了这里说明已经支持）
    
    // 检查 Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
        issues.push('Web Audio API');
    }

    // 检查 localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('Local Storage');
    }

    if (issues.length > 0) {
        throw new Error(`浏览器不支持以下功能: ${issues.join(', ')}`);
    }
}

/**
 * 预加载资源（模拟）
 */
async function preloadResources() {
    const steps = [
        { progress: 20, text: '加载音频系统...' },
        { progress: 40, text: '初始化图形引擎...' },
        { progress: 60, text: '载入游戏资源...' },
        { progress: 80, text: '设置游戏配置...' },
        { progress: 95, text: '最终检查...' },
        { progress: 100, text: '启动游戏...' }
    ];

    for (const step of steps) {
        updateLoadingProgress(step.progress, step.text);
        // 模拟异步加载
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    }
}

/**
 * 初始化游戏
 */
async function initGame() {
    try {
        console.log('🎮 开始初始化游戏...');
        
        // 检查浏览器支持
        updateLoadingProgress(10, '检查浏览器兼容性...');
        checkBrowserSupport();
        
        // 预加载资源
        await preloadResources();
        
        // 创建游戏实例
        game = new Game(canvas);
        
        // 初始化音频控制
        initAudioControls();
        
        // 隐藏加载屏幕
        hideLoadingScreen();
        
        // 启动游戏循环
        game.start();
        
        console.log('✅ 游戏初始化成功！');
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        showErrorScreen(error.message || '游戏初始化失败，请刷新页面重试');
    }
}

/**
 * 重试初始化
 */
function retryInit() {
    if (errorScreen) {
        errorScreen.style.display = 'none';
    }
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
    
    // 重新初始化
    setTimeout(initGame, 500);
}

/**
 * 页面卸载时清理资源
 */
function cleanup() {
    if (game) {
        game.destroy();
        game = null;
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 重试按钮
    if (retryBtn) {
        retryBtn.addEventListener('click', retryInit);
    }
    
    // 页面卸载清理
    window.addEventListener('beforeunload', cleanup);
    
    // 页面可见性变化时暂停/恢复游戏
    document.addEventListener('visibilitychange', () => {
        if (game && game.gameState === 'playing') {
            if (document.hidden) {
                game.gameState = 'paused';
            }
        }
    });
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        // 游戏画布大小是固定的，这里可以添加响应式逻辑
        console.log('📱 窗口大小变化');
    });
    
    console.log('📡 事件监听器初始化完成');
}

/**
 * 显示版本信息
 */
function showVersionInfo() {
    const stats = document.getElementById('gameStats');
    if (stats) {
        const info = stats.querySelector('p:last-child');
        if (info) {
            const features = [
                'ES6 模块',
                '工程化架构',
                '粒子系统',
                '音频引擎',
                '状态管理'
            ];
            info.innerHTML = `版本: v2.0.0 | 特性: ${features.join(', ')}`;
        }
    }
}

/**
 * 应用程序入口点
 */
function main() {
    console.log('🚀 太空射击游戏 v2.0.0 启动中...');
    console.log('🔧 模块化架构已加载');
    
    // 显示版本信息
    showVersionInfo();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化游戏（延迟一点以显示加载动画）
    setTimeout(initGame, 800);
}

// DOM 加载完成后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

// 导出给全局使用（调试用）
window.game = game;
window.retryGame = retryInit;

console.log('📦 主模块加载完成'); 