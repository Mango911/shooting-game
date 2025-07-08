/**
 * 游戏状态管理器
 * 处理游戏状态切换和相关逻辑
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { saveHighScore, loadHighScore } from '../utils/helpers.js';

export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.previousState = null;
        this.stateStartTime = Date.now();
        
        console.log('🎮 游戏状态管理器初始化完成');
    }

    /**
     * 设置游戏状态
     * @param {string} newState 
     */
    setState(newState) {
        const oldState = this.game.gameState;
        this.previousState = oldState;
        this.game.gameState = newState;
        this.stateStartTime = Date.now();
        
        this.onStateChange(oldState, newState);
        
        console.log(`🎮 状态变更: ${oldState} → ${newState}`);
    }

    /**
     * 状态变更处理
     * @param {string} oldState 
     * @param {string} newState 
     */
    onStateChange(oldState, newState) {
        switch (newState) {
            case GAME_CONFIG.GAME_STATES.START:
                this.onEnterStart();
                break;
            case GAME_CONFIG.GAME_STATES.PLAYING:
                this.onEnterPlaying();
                break;
            case GAME_CONFIG.GAME_STATES.PAUSED:
                this.onEnterPaused();
                break;
            case GAME_CONFIG.GAME_STATES.GAME_OVER:
                this.onEnterGameOver();
                break;
            case GAME_CONFIG.GAME_STATES.LEVEL_UP:
                this.onEnterLevelUp();
                break;
        }
    }

    /**
     * 进入开始状态
     */
    onEnterStart() {
        // 显示开始界面，可以添加背景音乐等
        if (this.game.audioManager && typeof this.game.audioManager.stopAll === 'function') {
            this.game.audioManager.stopAll();
        } else if (this.game.audioManager && typeof this.game.audioManager.stopBackgroundMusic === 'function') {
            this.game.audioManager.stopBackgroundMusic();
        }
        console.log('🏁 游戏进入开始状态');
    }

    /**
     * 进入游戏状态
     */
    onEnterPlaying() {
        // 开始背景音乐
        if (this.game.audioManager && typeof this.game.audioManager.playBackground === 'function') {
            this.game.audioManager.playBackground();
        } else if (this.game.audioManager && typeof this.game.audioManager.startBackgroundMusic === 'function') {
            this.game.audioManager.startBackgroundMusic();
        }
        console.log('🎮 游戏开始');
    }

    /**
     * 进入暂停状态
     */
    onEnterPaused() {
        // 暂停所有音效
        if (this.game.audioManager && typeof this.game.audioManager.pauseBackground === 'function') {
            this.game.audioManager.pauseBackground();
        } else if (this.game.audioManager && typeof this.game.audioManager.stopBackgroundMusic === 'function') {
            this.game.audioManager.stopBackgroundMusic();
        }
        console.log('⏸️ 游戏暂停');
    }

    /**
     * 进入游戏结束状态
     */
    onEnterGameOver() {
        // 停止音乐，检查最高分
        if (this.game.audioManager && typeof this.game.audioManager.stopAll === 'function') {
            this.game.audioManager.stopAll();
        } else if (this.game.audioManager && typeof this.game.audioManager.stopBackgroundMusic === 'function') {
            this.game.audioManager.stopBackgroundMusic();
        }
        this.checkAndSaveHighScore();
        console.log('💀 游戏结束');
    }

    /**
     * 进入升级状态
     */
    onEnterLevelUp() {
        // 升级音效
        this.game.audioManager.play('powerUp');
        console.log(`📈 升到 ${this.game.level} 级！`);
        
        // 2秒后自动返回游戏
        setTimeout(() => {
            if (this.game.gameState === GAME_CONFIG.GAME_STATES.LEVEL_UP) {
                this.setState(GAME_CONFIG.GAME_STATES.PLAYING);
            }
        }, 2000);
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.resetGame();
        this.setState(GAME_CONFIG.GAME_STATES.PLAYING);
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.setState(GAME_CONFIG.GAME_STATES.PAUSED);
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PAUSED) {
            this.setState(GAME_CONFIG.GAME_STATES.PLAYING);
            if (this.game.audioManager && typeof this.game.audioManager.resumeBackground === 'function') {
                this.game.audioManager.resumeBackground();
            } else if (this.game.audioManager && typeof this.game.audioManager.startBackgroundMusic === 'function') {
                this.game.audioManager.startBackgroundMusic();
            }
        }
    }

    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.pauseGame();
        } else if (this.game.gameState === GAME_CONFIG.GAME_STATES.PAUSED) {
            this.resumeGame();
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.setState(GAME_CONFIG.GAME_STATES.GAME_OVER);
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        this.startGame();
    }

    /**
     * 升级
     */
    levelUp() {
        this.game.level++;
        this.setState(GAME_CONFIG.GAME_STATES.LEVEL_UP);
        
        // 更新生成管理器的关卡
        this.game.spawnManager.updateLevel(this.game.level);
        
        // 清空屏幕上的敌机和子弹
        this.clearScreen();
        
        // 恢复玩家血量
        this.game.player.health = Math.min(
            this.game.player.health + 1, 
            this.game.player.maxHealth
        );
    }

    /**
     * 清空屏幕
     */
    clearScreen() {
        // 清空敌机子弹
        this.game.enemyBullets.length = 0;
        
        // 清空部分敌机（保留Boss）
        this.game.enemies = this.game.enemies.filter(enemy => 
            enemy.type === 'boss'
        );
        
        // 添加升级特效
        this.game.particleSystem.createLevelUpEffect(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2
        );
    }

    /**
     * 重置游戏
     */
    resetGame() {
        // 重置游戏变量
        this.game.score = 0;
        this.game.level = 1;
        this.game.enemiesKilled = 0;
        this.game.bossKilled = 0;
        this.game.screenShake = null;
        
        // 清空所有对象
        this.game.enemies.length = 0;
        this.game.bullets.length = 0;
        this.game.enemyBullets.length = 0;
        this.game.powerUps.length = 0;
        this.game.particleSystem.particles.length = 0;
        
        // 重置玩家
        this.game.player.reset();
        
        // 重置生成管理器
        this.game.spawnManager.resetSpawnTimers();
        this.game.spawnManager.updateLevel(1);
        
        console.log('🔄 游戏已重置');
    }

    /**
     * 检查并保存最高分
     */
    checkAndSaveHighScore() {
        const currentHigh = loadHighScore();
        if (this.game.score > currentHigh) {
            saveHighScore(this.game.score);
            this.game.isNewHighScore = true;
            console.log(`🏆 新纪录: ${this.game.score}！`);
        } else {
            this.game.isNewHighScore = false;
        }
    }

    /**
     * 检查升级条件
     */
    checkLevelUp() {
        const requiredKills = this.game.level * 15; // 每级需要击杀的敌机数
        if (this.game.enemiesKilled >= requiredKills) {
            this.levelUp();
            return true;
        }
        return false;
    }

    /**
     * 获取当前状态持续时间
     * @returns {number}
     */
    getStateDuration() {
        return Date.now() - this.stateStartTime;
    }

    /**
     * 检查是否可以进行某操作
     * @param {string} action 
     * @returns {boolean}
     */
    canPerformAction(action) {
        const state = this.game.gameState;
        
        switch (action) {
            case 'move':
            case 'shoot':
                return state === GAME_CONFIG.GAME_STATES.PLAYING;
            
            case 'pause':
                return state === GAME_CONFIG.GAME_STATES.PLAYING || 
                       state === GAME_CONFIG.GAME_STATES.PAUSED;
            
            case 'restart':
                return state === GAME_CONFIG.GAME_STATES.GAME_OVER ||
                       state === GAME_CONFIG.GAME_STATES.START;
            
            case 'start':
                return state === GAME_CONFIG.GAME_STATES.START;
            
            default:
                return false;
        }
    }

    /**
     * 获取状态信息
     * @returns {Object}
     */
    getStateInfo() {
        return {
            current: this.game.gameState,
            previous: this.previousState,
            duration: this.getStateDuration(),
            canMove: this.canPerformAction('move'),
            canShoot: this.canPerformAction('shoot'),
            canPause: this.canPerformAction('pause')
        };
    }

    /**
     * 强制设置状态（调试用）
     * @param {string} state 
     */
    forceState(state) {
        this.setState(state);
        console.log(`🔧 强制设置状态: ${state}`);
    }

    /**
     * 返回上一个状态
     */
    returnToPreviousState() {
        if (this.previousState && this.previousState !== this.game.gameState) {
            this.setState(this.previousState);
            console.log(`↩️ 返回到上一状态: ${this.previousState}`);
        }
    }

    /**
     * 检查是否是特定状态
     * @param {string} state 
     * @returns {boolean}
     */
    isState(state) {
        return this.game.gameState === state;
    }

    /**
     * 检查是否是游戏进行状态
     * @returns {boolean}
     */
    isPlaying() {
        return this.isState(GAME_CONFIG.GAME_STATES.PLAYING);
    }

    /**
     * 检查是否是暂停状态
     * @returns {boolean}
     */
    isPaused() {
        return this.isState(GAME_CONFIG.GAME_STATES.PAUSED);
    }

    /**
     * 检查是否是游戏结束状态
     * @returns {boolean}
     */
    isGameOver() {
        return this.isState(GAME_CONFIG.GAME_STATES.GAME_OVER);
    }

    /**
     * 清理管理器
     */
    destroy() {
        this.game = null;
        this.previousState = null;
        console.log('🎮 游戏状态管理器已销毁');
    }
}

export default GameStateManager; 