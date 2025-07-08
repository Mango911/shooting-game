/**
 * 碰撞管理器
 * 处理游戏中所有的碰撞检测逻辑
 */

import { createScreenShake } from '../utils/helpers.js';

export class CollisionManager {
    constructor(game) {
        this.game = game;
        console.log('💥 碰撞管理器初始化完成');
    }

    /**
     * 检查所有碰撞
     */
    checkAllCollisions() {
        this.checkPlayerBulletEnemyCollisions();
        this.checkEnemyPlayerCollisions();
        this.checkEnemyBulletPlayerCollisions();
        this.checkPlayerPowerUpCollisions();
    }

    /**
     * 检查玩家子弹与敌机的碰撞
     */
    checkPlayerBulletEnemyCollisions() {
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];
            
            for (let j = this.game.bullets.length - 1; j >= 0; j--) {
                const bullet = this.game.bullets[j];
                
                if (bullet.collidesWith(enemy)) {
                    // 子弹击中敌机
                    this.handleBulletHitEnemy(bullet, enemy, i, j);
                    break; // 一发子弹只能击中一个敌机
                }
            }
        }
    }

    /**
     * 处理子弹击中敌机
     * @param {Bullet} bullet 
     * @param {Enemy} enemy 
     * @param {number} enemyIndex 
     * @param {number} bulletIndex 
     */
    handleBulletHitEnemy(bullet, enemy, enemyIndex, bulletIndex) {
        // 销毁子弹
        bullet.destroy();
        this.game.bullets.splice(bulletIndex, 1);
        
        // 敌机受伤
        if (enemy.takeDamage()) {
            // 敌机被摧毁
            this.handleEnemyDestroyed(enemy, enemyIndex);
        } else {
            // 敌机受伤但未死亡
            this.handleEnemyHit(enemy);
        }
    }

    /**
     * 处理敌机被摧毁
     * @param {Enemy} enemy 
     * @param {number} enemyIndex 
     */
    handleEnemyDestroyed(enemy, enemyIndex) {
        // 增加分数
        this.game.score += enemy.score;
        this.game.enemiesKilled++;
        
        // 特效和音效
        if (enemy.type === 'boss') {
            this.createBossDestroyEffect(enemy);
            this.game.bossKilled++;
        } else {
            this.createEnemyDestroyEffect(enemy);
        }
        
        this.game.audioManager.play('explosion');
        this.game.enemies.splice(enemyIndex, 1);
    }

    /**
     * 处理敌机受击
     * @param {Enemy} enemy 
     */
    handleEnemyHit(enemy) {
        this.game.audioManager.play('hit');
        this.game.particleSystem.createFlashEffect(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2
        );
    }

    /**
     * 创建Boss摧毁特效
     * @param {Enemy} enemy 
     */
    createBossDestroyEffect(enemy) {
        this.game.particleSystem.createBossExplosion(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2
        );
        this.game.screenShake = createScreenShake(10, 500);
    }

    /**
     * 创建敌机摧毁特效
     * @param {Enemy} enemy 
     */
    createEnemyDestroyEffect(enemy) {
        this.game.particleSystem.createExplosion(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2,
            enemy.color
        );
        this.game.screenShake = createScreenShake(3, 200);
    }

    /**
     * 检查敌机与玩家的碰撞
     */
    checkEnemyPlayerCollisions() {
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];
            
            if (enemy.collidesWith(this.game.player)) {
                this.handleEnemyHitPlayer(enemy, i);
            }
        }
    }

    /**
     * 处理敌机撞击玩家
     * @param {Enemy} enemy 
     * @param {number} enemyIndex 
     */
    handleEnemyHitPlayer(enemy, enemyIndex) {
        this.handlePlayerHit();
        
        // Boss撞击后不会消失
        if (enemy.type !== 'boss') {
            this.game.enemies.splice(enemyIndex, 1);
        }
    }

    /**
     * 检查敌机子弹与玩家的碰撞
     */
    checkEnemyBulletPlayerCollisions() {
        for (let i = this.game.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.game.enemyBullets[i];
            
            if (bullet.collidesWith(this.game.player)) {
                this.handleEnemyBulletHitPlayer(bullet, i);
            }
        }
    }

    /**
     * 处理敌机子弹击中玩家
     * @param {Bullet} bullet 
     * @param {number} bulletIndex 
     */
    handleEnemyBulletHitPlayer(bullet, bulletIndex) {
        // 销毁子弹
        bullet.destroy();
        this.game.enemyBullets.splice(bulletIndex, 1);
        
        // 玩家受伤
        this.handlePlayerHit();
    }

    /**
     * 处理玩家受击
     */
    handlePlayerHit() {
        if (this.game.player.invulnerable) return;
        
        if (this.game.player.shield) {
            // 护盾吸收伤害
            this.handleShieldHit();
        } else {
            // 玩家直接受伤
            this.handlePlayerDamage();
        }
    }

    /**
     * 处理护盾受击
     */
    handleShieldHit() {
        this.game.player.shield = false;
        this.game.player.shieldEnd = 0;
        this.game.audioManager.play('hit');
        this.game.screenShake = createScreenShake(5, 300);
        
        // 护盾破裂特效
        this.game.particleSystem.createExplosion(
            this.game.player.x + this.game.player.width / 2,
            this.game.player.y + this.game.player.height / 2,
            '#3742fa',
            0.5
        );
    }

    /**
     * 处理玩家受伤
     */
    handlePlayerDamage() {
        this.game.player.health--;
        this.game.player.invulnerable = true;
        
        // 无敌时间
        setTimeout(() => {
            this.game.player.invulnerable = false;
        }, this.game.player.constructor.INVULNERABLE_TIME || 1500);
        
        this.game.audioManager.play('hit');
        this.game.screenShake = createScreenShake(8, 400);
        
        // 受伤特效
        this.game.particleSystem.createFlashEffect(
            this.game.player.x + this.game.player.width / 2,
            this.game.player.y + this.game.player.height / 2
        );
        
        // 检查游戏结束
        if (this.game.player.health <= 0) {
            this.game.stateManager.gameOver();
        }
    }

    /**
     * 检查玩家与道具的碰撞
     */
    checkPlayerPowerUpCollisions() {
        for (let i = this.game.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.game.powerUps[i];
            
            if (powerUp.collidesWith(this.game.player)) {
                this.handlePlayerCollectPowerUp(powerUp, i);
            }
        }
    }

    /**
     * 处理玩家收集道具
     * @param {PowerUp} powerUp 
     * @param {number} powerUpIndex 
     */
    handlePlayerCollectPowerUp(powerUp, powerUpIndex) {
        // 应用道具效果
        this.game.player.applyPowerUp(powerUp.type);
        
        // 特效和音效
        this.game.particleSystem.createPickupEffect(
            powerUp.x + powerUp.width / 2,
            powerUp.y + powerUp.height / 2,
            powerUp.config.color
        );
        this.game.audioManager.play('powerUp');
        
        // 移除道具
        this.game.powerUps.splice(powerUpIndex, 1);
        
        console.log(`🎁 收集道具: ${powerUp.getName()}`);
    }

    /**
     * 检查两个对象是否碰撞（通用方法）
     * @param {Object} obj1 
     * @param {Object} obj2 
     * @returns {boolean}
     */
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    /**
     * 检查圆形碰撞
     * @param {Object} obj1 - {x, y, radius}
     * @param {Object} obj2 - {x, y, radius}
     * @returns {boolean}
     */
    checkCircleCollision(obj1, obj2) {
        const dx = (obj1.x + obj1.radius) - (obj2.x + obj2.radius);
        const dy = (obj1.y + obj1.radius) - (obj2.y + obj2.radius);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.radius + obj2.radius;
    }

    /**
     * 检查点与矩形的碰撞
     * @param {number} x 
     * @param {number} y 
     * @param {Object} rect - {x, y, width, height}
     * @returns {boolean}
     */
    checkPointRectCollision(x, y, rect) {
        return x >= rect.x && 
               x <= rect.x + rect.width && 
               y >= rect.y && 
               y <= rect.y + rect.height;
    }
}

export default CollisionManager; 