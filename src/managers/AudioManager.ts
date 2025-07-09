/**
 * 音频管理器
 * 负责游戏中所有音效和背景音乐的管理
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';

export class AudioManager {
    public sounds: { [key: string]: () => void };
    public backgroundMusic: boolean | null;
    public muted: boolean;
    public volume: number;
    public audioContext: AudioContext;

    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.muted = false;
        this.volume = GAME_CONFIG.AUDIO.DEFAULT_VOLUME;
        this.initializeSounds();
    }

    /**
     * 初始化音效系统
     */
    initializeSounds(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // 预生成音效
            this.createShootSound();
            this.createExplosionSound();
            this.createPowerUpSound();
            this.createHitSound();
            this.createBackgroundMusic();
        } catch (error) {
            console.error('音频初始化失败:', error);
            this.muted = true; // 如果音频失败，设为静音模式
        }
    }

    /**
     * 创建射击音效
     */
    createShootSound(): void {
        this.sounds.shoot = () => {
            if (this.muted) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    /**
     * 创建爆炸音效
     */
    createExplosionSound(): void {
        this.sounds.explosion = () => {
            if (this.muted) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    /**
     * 创建道具音效
     */
    createPowerUpSound(): void {
        this.sounds.powerUp = () => {
            if (this.muted) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.4);
            
            gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.4);
        };
    }

    /**
     * 创建撞击音效
     */
    createHitSound(): void {
        this.sounds.hit = () => {
            if (this.muted) return;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
    }

    /**
     * 创建背景音乐
     */
    createBackgroundMusic(): void {
        this.sounds.backgroundMusic = () => {
            if (this.muted || this.backgroundMusic) return;
            
            // 简单的背景音乐循环
            const playNote = (frequency, duration, delay) => {
                setTimeout(() => {
                    if (this.muted || !this.backgroundMusic) return;
                    
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(this.volume * GAME_CONFIG.AUDIO.BACKGROUND_MUSIC_VOLUME, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + duration);
                }, delay);
            };
            
            // 音乐序列
            const melody = [
                {freq: 261.63, duration: 0.5}, // C
                {freq: 293.66, duration: 0.5}, // D
                {freq: 329.63, duration: 0.5}, // E
                {freq: 349.23, duration: 0.5}, // F
                {freq: 392.00, duration: 1.0}, // G
            ];
            
            let delay = 0;
            melody.forEach(note => {
                playNote(note.freq, note.duration, delay * 1000);
                delay += note.duration;
            });
            
            // 循环播放
            setTimeout(() => {
                if (this.backgroundMusic) {
                    this.sounds.backgroundMusic();
                }
            }, delay * 1000);
        };
    }

    /**
     * 播放指定音效
     * @param {string} soundName - 音效名称
     */
    play(soundName: string): void {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    /**
     * 开始播放背景音乐
     */
    startBackgroundMusic(): void {
        this.backgroundMusic = true;
        this.sounds.backgroundMusic();
    }

    /**
     * 播放背景音乐（别名）
     */
    playBackground(): void {
        this.startBackgroundMusic();
    }

    /**
     * 停止播放背景音乐
     */
    stopBackgroundMusic(): void {
        this.backgroundMusic = false;
    }

    /**
     * 暂停背景音乐
     */
    pauseBackground(): void {
        this.backgroundMusic = false;
    }

    /**
     * 恢复背景音乐
     */
    resumeBackground(): void {
        if (!this.muted) {
            this.startBackgroundMusic();
        }
    }

    /**
     * 停止所有音效
     */
    stopAll(): void {
        this.stopBackgroundMusic();
        // 停止所有正在播放的音效
        if (this.audioContext && this.audioContext.state === 'running') {
            // Web Audio API会自动清理已结束的音效
        }
    }

    /**
     * 切换静音状态
     */
    toggleMute(): void {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBackgroundMusic();
        }
    }

    /**
     * 设置音量
     * @param {number} volume - 音量值 (0-1)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 销毁音频管理器
     */
    destroy(): void {
        this.stopAll();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.sounds = {};
        this.audioContext = null;
        console.log('🎵 音频管理器已销毁');
    }
}

export default AudioManager; 