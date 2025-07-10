/**
 * UI管理器
 * 处理游戏中所有UI界面的渲染
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';
import {  loadHighScore  } from '../utils/helpers.js';

export class UIManager {
    public game: any;
    public ctx: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;
    public titleAnimTime: number;
    public flashTimer: number;
    public uiAnimations: any[];

    constructor(game: any) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        
        // UI动画状态
        this.titleAnimTime = 0;
        this.flashTimer = 0;
        this.uiAnimations = [];
        
        console.log('🎨 UI管理器初始化完成');
    }

    /**
     * 渲染所有UI元素
     */
    render(): void {
        this.updateAnimations();
        
        switch (this.game.gameState) {
            case GAME_CONFIG.GAME_STATES.START:
                this.renderStartScreen();
                break;
            case GAME_CONFIG.GAME_STATES.PLAYING:
                this.renderGameUI();
                break;
            case GAME_CONFIG.GAME_STATES.PAUSED:
                this.renderGameUI();
                this.renderPauseOverlay();
                break;
            case GAME_CONFIG.GAME_STATES.GAME_OVER:
                this.renderGameOverScreen();
                break;
            case GAME_CONFIG.GAME_STATES.LEVEL_UP:
                this.renderGameUI();
                this.renderLevelUpOverlay();
                break;
        }
    }

    /**
     * 更新UI动画
     */
    updateAnimations(): void {
        this.titleAnimTime += 0.05;
        this.flashTimer += 0.1;
        
        // 更新自定义动画
        this.uiAnimations = this.uiAnimations.filter(anim => {
            anim.time += anim.speed;
            return anim.time < anim.duration;
        });
    }

    /**
     * 渲染开始界面
     */
    renderStartScreen(): void {
        // 背景渐变
        this.renderBackground();
        
        // 标题
        this.renderTitle();
        
        // 副标题和说明
        this.renderStartInstructions();
        
        // 最高分显示
        this.renderHighScore();
        
        // 闪烁的开始提示
        this.renderStartPrompt();
    }

    /**
     * 渲染背景
     */
    renderBackground(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 渲染标题
     */
    renderTitle(): void {
        const centerX = this.canvas.width / 2;
        const titleY = this.canvas.height * 0.3;
        
        // 标题阴影效果
        this.ctx.save();
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 动画缩放效果
        const scale = 1 + Math.sin(this.titleAnimTime) * 0.05;
        this.ctx.translate(centerX, titleY);
        this.ctx.scale(scale, scale);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🚀 打飞机大战', 0, 0);
        
        this.ctx.restore();
    }

    /**
     * 渲染开始说明
     */
    renderStartInstructions(): void {
        const centerX = this.canvas.width / 2;
        let y = this.canvas.height * 0.5;
        
        const instructions = [
            '🎮 游戏操作',
            '',
            '⬅️➡️⬆️⬇️ 或 WASD - 移动',
            '🔥 空格键 - 射击',
            '⏸️ P键 - 暂停',
            '🔄 Esc键 - 暂停/返回',
            '',
            '🎯 游戏目标：击败敌机，收集道具，获得高分！'
        ];
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        
        instructions.forEach((line, _index) => {
            if (line === '') {
                y += 10;
                return;
            }
            
            if (line.includes('🎮') || line.includes('🎯')) {
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.font = 'bold 18px Arial';
            } else {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '16px Arial';
            }
            
            this.ctx.fillText(line, centerX, y);
            y += 25;
        });
    }

    /**
     * 渲染最高分
     */
    renderHighScore(): void {
        const highScore = loadHighScore();
        if (highScore > 0) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `🏆 最高分: ${highScore}`, 
                this.canvas.width / 2, 
                this.canvas.height * 0.15
            );
        }
    }

    /**
     * 渲染开始提示
     */
    renderStartPrompt(): void {
        const alpha = (Math.sin(this.flashTimer * 3) + 1) / 2;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            '按 Enter 开始游戏', 
            this.canvas.width / 2, 
            this.canvas.height * 0.85
        );
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * 渲染游戏UI
     */
    renderGameUI(): void {
        this.renderHealthBar();
        this.renderScore();
        this.renderLevel();
        this.renderWeaponStatus();
        this.renderProgress();
        this.renderWeaponPanel();
    }

    /**
     * 渲染血条
     */
    renderHealthBar(): void {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 20;
        
        // 背景
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        // 血条
        const healthPercent = this.game.player.health / this.game.player.maxHealth;
        const healthWidth = width * healthPercent;
        
        // 根据血量变色
        if (healthPercent > 0.6) {
            this.ctx.fillStyle = '#4ecdc4';
        } else if (healthPercent > 0.3) {
            this.ctx.fillStyle = '#ffd700';
        } else {
            this.ctx.fillStyle = '#ff6b6b';
        }
        
        this.ctx.fillRect(x, y, healthWidth, height);
        
        // 边框
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 文字
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            `❤️ ${this.game.player.health}/${this.game.player.maxHealth}`, 
            x + 5, y + 15
        );
    }

    /**
     * 渲染分数
     */
    renderScore(): void {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `分数: ${this.game.score}`, 
            this.canvas.width - 20, 
            30
        );
    }

    /**
     * 渲染关卡信息
     */
    renderLevel(): void {
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `关卡: ${this.game.level}`, 
            this.canvas.width - 20, 
            55
        );
        
        // 击杀数
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(
            `击杀: ${this.game.enemiesKilled}`, 
            this.canvas.width - 20, 
            75
        );
    }

    /**
     * 渲染武器状态
     */
    renderWeaponStatus(): void {
        const x = 20;
        let y = 60;
        
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        // 护盾状态
        if (this.game.player.shield) {
            this.ctx.fillStyle = '#3742fa';
            this.ctx.fillText('🛡️ 护盾激活', x, y);
            y += 20;
        }
        
        // 连射状态
        const rapidTime = this.game.player.rapidFireEnd - Date.now();
        if (rapidTime > 0) {
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillText(`🔥 连射 ${Math.ceil(rapidTime / 1000)}s`, x, y);
            y += 20;
        }
        
        // 双发状态
        const doubleTime = this.game.player.doubleShotEnd - Date.now();
        if (doubleTime > 0) {
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.fillText(`🔫 双发 ${Math.ceil(doubleTime / 1000)}s`, x, y);
            y += 20;
        }
        
        // 多发状态
        const multiTime = this.game.player.multiShotEnd - Date.now();
        if (multiTime > 0) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText(`💥 多发 ${Math.ceil(multiTime / 1000)}s`, x, y);
            y += 20;
        }
    }

    /**
     * 渲染进度条
     */
    renderProgress(): void {
        const requiredKills = this.game.level * 15;
        const progress = Math.min(this.game.enemiesKilled / requiredKills, 1);
        
        const x = this.canvas.width / 2 - 100;
        const y = this.canvas.height - 30;
        const width = 200;
        const height = 10;
        
        // 背景
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        // 进度
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(x, y, width * progress, height);
        
        // 边框
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // 文字
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `升级进度: ${this.game.enemiesKilled}/${requiredKills}`, 
            this.canvas.width / 2, 
            y - 5
        );
    }

    /**
     * 渲染武器面板
     */
    renderWeaponPanel(): void {
        const weaponInfo = this.game.player.getWeaponInfo();
        const x = this.canvas.width - 150;
        const y = 100;
        
        // 面板背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, 140, 120);
        
        // 面板边框
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, 140, 120);
        
        // 标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('武器系统', x + 70, y + 20);
        
        // 当前武器
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText(`当前: ${weaponInfo.name}`, x + 10, y + 40);
        
        // 弹药（如果有限制）
        if (weaponInfo.ammo !== Infinity) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`弹药: ${weaponInfo.ammo}/${weaponInfo.maxAmmo}`, x + 10, y + 55);
        }
        
        // 蓄力进度（激光武器）
        if (weaponInfo.isCharging) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText(`蓄力: ${Math.round(weaponInfo.chargeProgress * 100)}%`, x + 10, y + 70);
        }
        
        // 能量（等离子武器）
        if (weaponInfo.energyPercent !== undefined && weaponInfo.energyPercent < 1) {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillText(`能量: ${Math.round(weaponInfo.energyPercent * 100)}%`, x + 10, y + 70);
        }
        
        // 可用武器列表
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('可用武器:', x + 10, y + 90);
        
        let weaponY = y + 105;
        weaponInfo.available.forEach((weapon, index) => {
            if (index >= 4) return; // 最多显示4个
            
            const weaponNames = {
                normal: '普通炮',
                double: '双管炮',
                shotgun: '散弹枪',
                laser: '激光炮',
                missile: '导弹',
                plasma: '等离子'
            };
            
            this.ctx.fillStyle = weapon === weaponInfo.current ? '#ffd700' : '#aaaaaa';
            this.ctx.fillText(`${index + 1}. ${weaponNames[weapon] || weapon}`, x + 10, weaponY);
            weaponY += 12;
        });
        
        // 操作提示
        this.ctx.font = '8px Arial';
        this.ctx.fillStyle = '#888888';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Q/E切换 1-6直选', x + 70, y + 110);
    }

    /**
     * 渲染暂停覆盖层
     */
    renderPauseOverlay(): void {
        // 半透明遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 暂停标题
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️ 游戏暂停', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // 继续提示
        const alpha = (Math.sin(this.flashTimer * 2) + 1) / 2;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按 P 或 Enter 继续', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.globalAlpha = 1;
    }

    /**
     * 渲染升级覆盖层
     */
    renderLevelUpOverlay(): void {
        // 半透明遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 升级动画
        const scale = 1 + Math.sin(this.titleAnimTime * 3) * 0.1;
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        
        // 升级文字
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 升级！', 0, -30);
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`关卡 ${this.game.level}`, 0, 30);
        
        this.ctx.restore();
        
        // 奖励信息
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('❤️ 生命值恢复 +1', this.canvas.width / 2, this.canvas.height / 2 + 100);
    }

    /**
     * 渲染游戏结束界面
     */
    renderGameOverScreen(): void {
        // 背景
        this.renderBackground();
        
        // 游戏结束标题
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💀 游戏结束', this.canvas.width / 2, this.canvas.height * 0.3);
        
        // 最终分数
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`最终分数: ${this.game.score}`, this.canvas.width / 2, this.canvas.height * 0.45);
        
        // 新记录提示
        if (this.game.isNewHighScore) {
            const alpha = (Math.sin(this.flashTimer * 4) + 1) / 2;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('🏆 新纪录！', this.canvas.width / 2, this.canvas.height * 0.55);
            this.ctx.globalAlpha = 1;
        }
        
        // 统计信息
        this.renderGameStats();
        
        // 重新开始提示
        const alpha = (Math.sin(this.flashTimer * 2) + 1) / 2;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按 Enter 重新开始', this.canvas.width / 2, this.canvas.height * 0.85);
        this.ctx.globalAlpha = 1;
    }

    /**
     * 渲染游戏统计
     */
    renderGameStats(): void {
        const centerX = this.canvas.width / 2;
        let y = this.canvas.height * 0.65;
        
        const stats = [
            `关卡: ${this.game.level}`,
            `击杀敌机: ${this.game.enemiesKilled}`,
            `击败Boss: ${this.game.bossKilled}`
        ];
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        
        stats.forEach(stat => {
            this.ctx.fillText(stat, centerX, y);
            y += 25;
        });
    }

    /**
     * 添加UI动画
     * @param {Object} animation 
     */
    addAnimation(animation: any): void {
        this.uiAnimations.push({
            time: 0,
            duration: 1000,
            speed: 1,
            ...animation
        });
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo(): void {
        if (!GAME_CONFIG.DEBUG.ENABLED) return;
        
        const info = [
            `FPS: ${Math.round(this.game.fps)}`,
            `敌机: ${this.game.enemies.length}`,
            `子弹: ${this.game.bullets.length}`,
            `粒子: ${this.game.particleSystem.particles.length}`,
            `状态: ${this.game.gameState}`
        ];
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        info.forEach((line, index) => {
            this.ctx.fillText(line, 10, this.canvas.height - 100 + index * 15);
        });
    }

    /**
     * 清理UI管理器
     */
    destroy(): void {
        this.uiAnimations.length = 0;
        this.game = null;
        this.ctx = null;
        this.canvas = null;
        console.log('🎨 UI管理器已销毁');
    }
}

export default UIManager; 