/**
 * 输入管理器
 * 处理键盘输入、事件监听和游戏控制
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';

export class InputManager {
    public game: any;
    public keys: { [key: string]: boolean };

    constructor(game: any) {
        this.game = game;
        this.keys = {};
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners(): void {
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 窗口事件
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        console.log('📱 输入管理器初始化完成');
    }

    /**
     * 处理按键按下
     * @param {KeyboardEvent} e 
     */
    handleKeyDown(e: KeyboardEvent): void {
        this.keys[e.key.toLowerCase()] = true;
        
        // 游戏控制键
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.handleSpaceKey();
                break;
            case 'Enter':
                e.preventDefault();
                this.handleEnterKey();
                break;
            case 'Escape':
                e.preventDefault();
                this.handleEscapeKey();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.handlePauseKey();
                break;
            case 'q':
            case 'Q':
                e.preventDefault();
                this.handleWeaponSwitchKey('prev');
                break;
            case 'e':
            case 'E':
                e.preventDefault();
                this.handleWeaponSwitchKey('next');
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                e.preventDefault();
                this.handleWeaponSelectKey(e.key);
                break;
        }
    }

    /**
     * 处理按键释放
     * @param {KeyboardEvent} e 
     */
    handleKeyUp(e: KeyboardEvent): void {
        this.keys[e.key.toLowerCase()] = false;
    }

    /**
     * 处理空格键（射击）
     */
    handleSpaceKey(): void {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.game.player.shoot(this.game.bullets);
            this.game.audioManager.play('shoot');
        }
    }

    /**
     * 处理Enter键
     */
    handleEnterKey(): void {
        switch (this.game.gameState) {
            case GAME_CONFIG.GAME_STATES.START:
                this.game.stateManager.startGame();
                break;
            case GAME_CONFIG.GAME_STATES.GAME_OVER:
                this.game.stateManager.restartGame();
                break;
            case GAME_CONFIG.GAME_STATES.PAUSED:
                this.game.stateManager.resumeGame();
                break;
        }
    }

    /**
     * 处理Escape键
     */
    handleEscapeKey(): void {
        this.game.stateManager.togglePause();
    }

    /**
     * 处理暂停键
     */
    handlePauseKey(): void {
        this.game.stateManager.togglePause();
    }

    /**
     * 处理武器切换键
     * @param {string} direction - 'next' 或 'prev'
     */
    handleWeaponSwitchKey(direction: string): void {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.game.player.switchWeapon(direction);
        }
    }

    /**
     * 处理武器直选键
     * @param {string} key - 数字键1-6
     */
    handleWeaponSelectKey(key: string): void {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            const weaponMap = {
                '1': 'normal',
                '2': 'double', 
                '3': 'shotgun',
                '4': 'laser',
                '5': 'missile',
                '6': 'plasma'
            };
            
            const weaponType = weaponMap[key];
            if (weaponType) {
                this.game.player.selectWeapon(weaponType);
            }
        }
    }

    /**
     * 处理窗口失去焦点
     */
    handleWindowBlur(): void {
        if (this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.game.stateManager.pauseGame();
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize(): void {
        console.log('📱 窗口大小变化，可在此添加响应式逻辑');
        // 这里可以添加画布大小调整逻辑
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange(): void {
        if (document.hidden && this.game.gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
            this.game.stateManager.pauseGame();
        }
    }

    /**
     * 检查按键是否被按下
     * @param {string} key - 按键名称
     * @returns {boolean}
     */
    isKeyPressed(key: string): boolean {
        return this.keys[key.toLowerCase()] || false;
    }

    /**
     * 检查移动按键
     * @returns {Object} 移动方向对象
     */
    getMovementInput(): object {
        return {
            left: this.isKeyPressed('a') || this.isKeyPressed('arrowleft'),
            right: this.isKeyPressed('d') || this.isKeyPressed('arrowright'),
            up: this.isKeyPressed('w') || this.isKeyPressed('arrowup'),
            down: this.isKeyPressed('s') || this.isKeyPressed('arrowdown'),
            shoot: this.isKeyPressed(' ')
        };
    }

    /**
     * 清理事件监听器
     */
    destroy(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('resize', this.handleWindowResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('📱 输入管理器已销毁');
    }
}

export default InputManager; 