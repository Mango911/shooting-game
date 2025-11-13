/**
 * 游戏主入口文件
 * 负责初始化游戏并处理UI交互
 */

import Game from './Game.js';
import type { HTMLCanvasElementWithSize } from './types/global.js';

// 全局游戏实例
let game: Game | null = null;

// DOM 元素
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElementWithSize;
const loadingScreen = document.getElementById('loadingScreen') as HTMLElement | null;
const errorScreen = document.getElementById('errorScreen') as HTMLElement | null;
const muteBtn = document.getElementById('muteBtn') as HTMLButtonElement | null;
const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement | null;
const volumeValue = document.getElementById('volumeValue') as HTMLElement | null;
const retryBtn = document.getElementById('retryBtn') as HTMLButtonElement | null;
const loadingText = document.getElementById('loadingText') as HTMLElement | null;
const progressBar = document.getElementById('progressBar') as HTMLElement | null;

/**
 * 显示加载进度
 * @param progress - 进度 (0-100)
 * @param text - 加载文本
 */
function updateLoadingProgress(progress: number, text: string): void {
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
function hideLoadingScreen(): void {
    if (loadingScreen) {
        // 立即隐藏加载屏幕的所有属性
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        loadingScreen.style.pointerEvents = 'none';
        loadingScreen.style.zIndex = '-1';

        // 300ms后彻底移除display，避免占用空间
        setTimeout(() => {
            if (loadingScreen && loadingScreen.style) {
                loadingScreen.style.display = 'none';
            }
        }, 350);
    }
}

/**
 * 显示错误屏幕
 * @param message - 错误消息
 */
function showErrorScreen(message: string): void {
    hideLoadingScreen();
    if (errorScreen) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorScreen.style.display = 'flex';
    }
}

/**
 * 初始化音频控制
 */
function initAudioControls(): void {
    if (!game || !game.audioManager) return;

    // 静音按钮
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (game?.audioManager) {
                game.audioManager.toggleMute();
                muteBtn.textContent = (game.audioManager as any).muted ? '🔇 静音' : '🔊 音效';
            }
        });
    }

    // 音量滑块
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const volume = parseInt(target.value) / 100;
            game?.audioManager.setVolume(volume);
            if (volumeValue) {
                volumeValue.textContent = `${target.value}%`;
            }
        });
    }

    console.log('🎵 音频控制初始化完成');
}

/**
 * 检查浏览器兼容性
 */
function checkBrowserSupport(): void {
    const issues: string[] = [];

    // 检查 Canvas 支持
    if (!canvas.getContext) {
        issues.push('Canvas API');
    }

    // 检查 ES6 模块支持（如果到了这里说明已经支持）
    
    // 检查 Web Audio API
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
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
async function preloadResources(): Promise<void> {
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
        // 快速加载
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
}

/**
 * 初始化游戏
 */
async function initGame(): Promise<void> {
    try {
        console.log('🎮 开始初始化游戏...');
        updateLoadingProgress(10, '检查浏览器兼容性...');

        // 检查浏览器支持
        try {
            checkBrowserSupport();
            console.log('✓ 浏览器支持检查通过');
        } catch (e) {
            console.error('✗ 浏览器支持检查失败:', e);
            throw e;
        }

        // 预加载资源
        console.log('开始预加载资源...');
        try {
            await preloadResources();
            console.log('✓ 资源预加载完成');
        } catch (e) {
            console.error('✗ 资源预加载失败:', e);
            throw e;
        }

        // 创建游戏实例
        console.log('开始创建Game实例...');
        console.log('Canvas信息:', { width: canvas.width, height: canvas.height });
        try {
            game = new Game(canvas);
            console.log('✓ Game实例创建成功');
        } catch (e) {
            console.error('✗ Game实例创建失败:', e);
            throw e;
        }

        // 设置为全局变量（调试用）
        window.game = game;
        console.log('✓ 全局变量设置完成');

        // 初始化音频控制
        console.log('初始化音频控制...');
        try {
            initAudioControls();
            console.log('✓ 音频控制初始化完成');
        } catch (e) {
            console.error('✗ 音频控制初始化失败:', e);
            // 不中断流程，音频失败不影响游戏运行
        }

        // 隐藏加载屏幕
        console.log('隐藏加载屏幕...');
        try {
            hideLoadingScreen();
            console.log('✓ 加载屏幕已隐藏');
        } catch (e) {
            console.error('✗ 隐藏加载屏幕失败:', e);
            throw e;
        }

        // 启动游戏循环
        console.log('启动游戏循环...');
        try {
            game.start();
            console.log('✓ 游戏循环已启动');
        } catch (e) {
            console.error('✗ 启动游戏循环失败:', e);
            throw e;
        }

        console.log('✅ 游戏初始化成功！');

    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        const message = error instanceof Error ? error.message : '游戏初始化失败，请刷新页面重试';
        console.error('错误详情:', message);
        if (error instanceof Error) {
            console.error('堆栈:', error.stack);
        }
        showErrorScreen(message);
    }
}

/**
 * 重试初始化
 */
function retryInit(): void {
    if (errorScreen) {
        errorScreen.style.display = 'none';
    }
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        loadingScreen.style.visibility = 'visible';
        loadingScreen.style.pointerEvents = 'auto';
    }

    // 重新初始化
    setTimeout(initGame, 500);
}

/**
 * 页面卸载时清理资源
 */
function cleanup(): void {
    if (game) {
        game.destroy();
        game = null;
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners(): void {
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
function showVersionInfo(): void {
    const stats = document.getElementById('gameStats');
    if (stats) {
        const info = stats.querySelector('p:last-child');
        if (info) {
            const features = [
                'ES6 模块',
                'TypeScript',
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
function main(): void {
    console.log('🚀 太空射击游戏 v2.0.0 启动中...');
    console.log('🔧 TypeScript 模块化架构已加载');
    
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
window.retryGame = retryInit;

console.log('📦 TypeScript 主模块加载完成'); 