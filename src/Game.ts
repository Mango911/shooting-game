/**
 * 游戏主控制器（重构后）
 * 协调各个管理器，保持游戏流程的简洁性
 */

import { GAME_CONFIG } from './config/gameConfig.js';
import AudioManager from './managers/AudioManager.js';
import InputManager from './managers/InputManager.js';
import CollisionManager from './managers/CollisionManager.js';
import SpawnManager from './managers/SpawnManager.js';
import GameStateManager from './managers/GameStateManager.js';
import UIManager from './managers/UIManager.js';

import Player from './classes/Player.js';
import Particle from './classes/Particle.js';
import Background from './classes/Background.js';
import Bullet from './classes/Bullet.js';
import Enemy from './classes/Enemy.js';
import PowerUp from './classes/PowerUp.js';

import type { 
    GameState, 
    GameStats, 
    ScreenShake, 
    HTMLCanvasElementWithSize 
} from './types/global.js';

interface GameDebug {
    spawnEnemy: (type: string) => void;
    spawnPowerUp: (type: string) => void;
    spawnBoss: () => void;
    clearAll: () => void;
    setState: (state: GameState) => void;
    getStats: () => GameStats;
    toggleDebug: () => void;
}

export class Game {
    // 核心组件
    canvas: HTMLCanvasElementWithSize;
    ctx: CanvasRenderingContext2D;
    
    // 游戏状态
    gameState: GameState;
    score: number;
    level: number;
    enemiesKilled: number;
    bossKilled: number;
    isNewHighScore: boolean;
    
    // 游戏对象数组
    enemies: Enemy[];
    bullets: Bullet[];
    enemyBullets: Bullet[];
    powerUps: PowerUp[];
    
    // 特效
    screenShake: ScreenShake | null;
    fps: number;
    lastFrameTime: number;
    
    // 游戏循环控制
    gameLoopRunning: boolean;
    
    // 游戏对象
    player: Player;
    particleSystem: Particle;
    background: Background;
    
    // 管理器
    audioManager: AudioManager;
    inputManager: InputManager;
    collisionManager: CollisionManager;
    spawnManager: SpawnManager;
    stateManager: GameStateManager;
    uiManager: UIManager;
    
    // 调试接口
    debug: GameDebug;

    constructor(canvas: HTMLCanvasElementWithSize) {
        // 核心组件
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        // 设置canvas尺寸
        this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
        
        // 游戏状态
        this.gameState = GAME_CONFIG.GAME_STATES.START as GameState;
        this.score = 0;
        this.level = 1;
        this.enemiesKilled = 0;
        this.bossKilled = 0;
        this.isNewHighScore = false;
        
        // 游戏对象数组
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        
        // 特效
        this.screenShake = null;
        this.fps = 60;
        this.lastFrameTime = 0;
        
        // 游戏循环控制
        this.gameLoopRunning = false;
        
        // 初始化调试接口
        this.debug = {
            spawnEnemy: (type: string) => this.spawnManager.forceSpawnEnemy(type),
            spawnPowerUp: (type: string) => this.spawnManager.forceSpawnPowerUp(type),
            spawnBoss: () => this.spawnManager.forceSpawnBoss(),
            clearAll: () => this.spawnManager.clearAll(),
            setState: (state: GameState) => this.stateManager.forceState(state),
            getStats: () => this.getStats(),
            toggleDebug: () => {
                if (GAME_CONFIG.DEBUG) {
                    GAME_CONFIG.DEBUG.ENABLED = !GAME_CONFIG.DEBUG.ENABLED;
                    console.log(`🔧 调试模式: ${GAME_CONFIG.DEBUG.ENABLED ? '开启' : '关闭'}`);
                }
            }
        };
        
        // 初始化所有管理器和游戏对象
        this.initializeGame();
        
        console.log('🎮 游戏主控制器初始化完成');
    }

    /**
     * 初始化游戏
     */
    private initializeGame(): void {
        // 创建玩家
        this.player = new Player(
            this.canvas.width / 2 - 25,
            this.canvas.height - 100
        );
        
        // 创建粒子系统
        this.particleSystem = new Particle(this.ctx);
        
        // 创建背景
        this.background = new Background(this.canvas.width, this.canvas.height);
        
        // 初始化管理器
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager(this);
        this.collisionManager = new CollisionManager(this);
        this.spawnManager = new SpawnManager(this);
        this.stateManager = new GameStateManager(this);
        this.uiManager = new UIManager(this);
        
        console.log('🚀 游戏初始化完成！所有系统已加载');
    }

    /**
     * 游戏主循环
     * @param currentTime 当前时间戳
     */
    gameLoop(currentTime: number): void {
        // 计算FPS
        this.calculateFPS(currentTime);
        
        // 清空画布
        this.clearCanvas();
        
        // 渲染背景
        this.background.update();
        this.background.render(this.ctx);
        
        // 根据游戏状态更新
        if (this.stateManager.isPlaying()) {
            this.updateGame(currentTime);
        }
        
        // 渲染游戏对象
        this.renderGame();
        
        // 渲染UI
        this.uiManager.render();
        
        // 应用屏幕震动
        this.applyScreenShake();
    }

    /**
     * 更新游戏逻辑
     * @param currentTime 当前时间戳
     */
    private updateGame(currentTime: number): void {
        // 处理输入
        this.handleInput();
        
        // 生成敌机和道具
        this.spawnManager.update(currentTime);
        
        // 更新所有游戏对象
        this.updateGameObjects();
        
        // 检查碰撞
        this.collisionManager.checkAllCollisions();
        
        // 清理超出边界的对象
        this.cleanupObjects();
        
        // 检查升级条件
        this.stateManager.checkLevelUp();
    }

    /**
     * 处理输入
     */
    private handleInput(): void {
        const input = this.inputManager.getMovementInput();
        
        // 移动玩家
        this.player.handleInput(input, this.canvas);
        
        // 射击（连续射击由玩家类内部处理）
        if (input.shoot) {
            this.player.shoot(this.bullets, this.enemies);
        }
    }

    /**
     * 更新所有游戏对象
     */
    private updateGameObjects(): void {
        // 更新玩家
        this.player.update();
        
        // 更新敌机
        this.enemies.forEach(enemy => {
            enemy.update();
            // 敌机射击
            if ((enemy as any).canShoot && (enemy as any).canShoot()) {
                (enemy as any).shoot(this.enemyBullets);
            }
        });
        
        // 更新子弹
        this.bullets.forEach(bullet => bullet.update());
        this.enemyBullets.forEach(bullet => bullet.update());
        
        // 更新道具
        this.powerUps.forEach(powerUp => powerUp.update());
        
        // 更新粒子系统
        this.particleSystem.update();
    }

    /**
     * 渲染游戏对象
     */
    private renderGame(): void {
        // 渲染玩家
        this.player.render(this.ctx);
        
        // 渲染敌机
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
        
        // 渲染道具
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // 渲染粒子
        this.particleSystem.render();
        
        // 渲染调试信息
        this.uiManager.renderDebugInfo();
    }

    /**
     * 清理超出边界的对象
     */
    private cleanupObjects(): void {
        const canvasHeight = this.canvas.height;
        const canvasWidth = this.canvas.width;
        
        // 清理子弹
        this.bullets = this.bullets.filter(bullet => 
            bullet.y > -50 && bullet.y < canvasHeight + 50 &&
            bullet.x > -50 && bullet.x < canvasWidth + 50
        );
        
        this.enemyBullets = this.enemyBullets.filter(bullet => 
            bullet.y > -50 && bullet.y < canvasHeight + 50 &&
            bullet.x > -50 && bullet.x < canvasWidth + 50
        );
        
        // 清理敌机
        this.enemies = this.enemies.filter(enemy => 
            enemy.y < canvasHeight + 100
        );
        
        // 清理道具
        this.powerUps = this.powerUps.filter(powerUp => 
            powerUp.y < canvasHeight + 50
        );
    }

    /**
     * 计算FPS
     * @param currentTime 当前时间戳
     */
    private calculateFPS(currentTime: number): void {
        if (this.lastFrameTime) {
            this.fps = 1000 / (currentTime - this.lastFrameTime);
        }
        this.lastFrameTime = currentTime;
    }

    /**
     * 清空画布
     */
    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 应用屏幕震动效果
     */
    private applyScreenShake(): void {
        if (this.screenShake) {
            if (this.screenShake.duration > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake.intensity * 2;
                const shakeY = (Math.random() - 0.5) * this.screenShake.intensity * 2;
                
                this.ctx.save();
                this.ctx.translate(shakeX, shakeY);
                this.ctx.restore();
                
                this.screenShake.duration -= 16; // 假设60FPS
                this.screenShake.intensity *= 0.95; // 衰减
            } else {
                this.screenShake = null;
            }
        }
    }

    /**
     * 重置游戏（委托给状态管理器）
     */
    reset(): void {
        this.stateManager.resetGame();
    }

    /**
     * 暂停游戏（委托给状态管理器）
     */
    pause(): void {
        this.stateManager.pauseGame();
    }

    /**
     * 恢复游戏（委托给状态管理器）
     */
    resume(): void {
        this.stateManager.resumeGame();
    }

    /**
     * 开始游戏（委托给状态管理器）
     */
    start(): void {
        this.stateManager.startGame();
        this.startGameLoop();
    }

    /**
     * 启动游戏主循环
     */
    startGameLoop(): void {
        // 防止重复启动
        if (this.gameLoopRunning) return;
        
        this.gameLoopRunning = true;
        
        const loop = (currentTime: number) => {
            if (this.gameLoopRunning) {
                this.gameLoop(currentTime);
                requestAnimationFrame(loop);
            }
        };
        
        requestAnimationFrame(loop);
        console.log('🔄 游戏主循环已启动');
    }

    /**
     * 停止游戏主循环
     */
    stopGameLoop(): void {
        this.gameLoopRunning = false;
        console.log('⏹️ 游戏主循环已停止');
    }

    /**
     * 获取游戏统计信息
     */
    getStats(): GameStats {
        return {
            score: this.score,
            level: this.level,
            enemiesKilled: this.enemiesKilled,
            bossKilled: this.bossKilled,
            playerHealth: this.player.health,
            enemyCount: this.enemies.length,
            bulletCount: this.bullets.length + this.enemyBullets.length,
            powerUpCount: this.powerUps.length,
            particleCount: this.particleSystem.particles.length,
            fps: Math.round(this.fps),
            gameState: this.gameState
        };
    }

    /**
     * 销毁游戏，清理所有资源
     */
    destroy(): void {
        // 停止游戏循环
        this.stopGameLoop();
        
        // 清理管理器
        this.inputManager?.destroy();
        this.audioManager?.destroy();
        this.stateManager?.destroy();
        this.uiManager?.destroy();
        
        // 清空数组
        this.enemies.length = 0;
        this.bullets.length = 0;
        this.enemyBullets.length = 0;
        this.powerUps.length = 0;
        
        // 清理粒子系统
        this.particleSystem?.destroy();
        
        console.log('🎮 游戏已销毁，资源已清理');
    }
}

export default Game; 