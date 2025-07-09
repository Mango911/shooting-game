/**
 * 生成管理器
 * 处理敌机、道具和其他游戏对象的生成逻辑
 */

import {  GAME_CONFIG  } from '../config/gameConfig.js';
import Enemy from '../classes/Enemy.js';
import PowerUp from '../classes/PowerUp.js';

export class SpawnManager {
    public game: any;
    public lastEnemySpawn: number;
    public lastPowerUpSpawn: number;
    public lastBossSpawn: number;
    public enemySpawnRate: number;
    public bossSpawnRate: number;
    public powerUpSpawnRate: number;

    constructor(game: any) {
        this.game = game;
        this.lastEnemySpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.lastBossSpawn = 0;
        
        // 计算初始生成间隔
        this.calculateSpawnRates();
        
        console.log('🌟 生成管理器初始化完成');
    }

    /**
     * 计算生成频率
     */
    calculateSpawnRates(): void {
        const level = this.game.level;
        
        // 敌机生成间隔随关卡递减
        this.enemySpawnRate = Math.max(
            GAME_CONFIG.ENEMY.MIN_SPAWN_RATE,
            GAME_CONFIG.ENEMY.SPAWN_RATE - (level - 1) * 200
        );
        
        // Boss生成间隔
        this.bossSpawnRate = GAME_CONFIG.ENEMY.BOSS_SPAWN_RATE;
        
        // 道具生成间隔
        this.powerUpSpawnRate = GAME_CONFIG.POWER_UP.SPAWN_RATE;
        
        console.log(`🌟 生成频率更新 - 敌机: ${this.enemySpawnRate}ms, Boss: ${this.bossSpawnRate}ms, 道具: ${this.powerUpSpawnRate}ms`);
    }

    /**
     * 更新生成逻辑
     * @param {number} currentTime 
     */
    update(currentTime: number): void {
        this.spawnEnemies(currentTime);
        this.spawnPowerUps(currentTime);
        this.spawnBoss(currentTime);
    }

    /**
     * 生成敌机
     * @param {number} currentTime 
     */
    spawnEnemies(currentTime: number): void {
        if (currentTime - this.lastEnemySpawn > this.enemySpawnRate) {
            this.createRandomEnemy();
            this.lastEnemySpawn = currentTime;
        }
    }

    /**
     * 创建随机敌机
     */
    createRandomEnemy(): void {
        const types = ['normal', 'fast', 'heavy', 'zigzag'];
        const weights = this.getEnemyTypeWeights();
        const selectedType = this.weightedRandomSelect(types, weights);
        
        const enemy = this.createEnemyByType(selectedType);
        this.game.enemies.push(enemy);
        
        console.log(`👾 生成敌机: ${selectedType}`);
    }

    /**
     * 获取敌机类型权重
     * @returns {Array<number>}
     */
    getEnemyTypeWeights(): number[] {
        const level = this.game.level;
        
        // 基础权重
        let weights = [40, 30, 20, 10]; // normal, fast, heavy, zigzag
        
        // 随着关卡提升，增强型敌机比例增加
        if (level >= 3) {
            weights = [30, 35, 25, 15];
        }
        if (level >= 5) {
            weights = [20, 30, 30, 20];
        }
        if (level >= 8) {
            weights = [15, 25, 35, 25];
        }
        
        return weights;
    }

    /**
     * 根据权重随机选择
     * @param {Array} items 
     * @param {Array<number>} weights 
     * @returns {*}
     */
    weightedRandomSelect(items: any[], weights: number[]): any {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[0]; // 兜底
    }

    /**
     * 根据类型创建敌机
     * @param {string} type 
     * @returns {Enemy}
     */
    createEnemyByType(type: string): Enemy {
        const x = Math.random() * (this.game.canvas.width - 50);
        const y = -50;
        
        return new Enemy(x, y, type);
    }

    /**
     * 生成Boss
     * @param {number} currentTime 
     */
    spawnBoss(currentTime: number): void {
        // Boss生成条件：击杀足够敌机且时间间隔足够
        const shouldSpawnBoss = 
            this.game.enemiesKilled >= this.game.level * 10 &&
            currentTime - this.lastBossSpawn > this.bossSpawnRate &&
            this.game.enemies.filter(e => e.type === 'boss').length === 0;
            
        if (shouldSpawnBoss) {
            this.createBoss();
            this.lastBossSpawn = currentTime;
        }
    }

    /**
     * 创建Boss
     */
    createBoss(): void {
        const x = this.game.canvas.width / 2 - 75;
        const y = -100;
        
        const boss = new Enemy(x, y, 'boss');
        this.game.enemies.push(boss);
        
        // Boss出现特效
        this.game.particleSystem.createBossEntrance(
            x + boss.width / 2,
            y + boss.height / 2
        );
        
        this.game.audioManager.play('powerUp'); // 使用道具音效表示Boss出现
        
        console.log('👹 Boss出现！');
    }

    /**
     * 生成道具
     * @param {number} currentTime 
     */
    spawnPowerUps(currentTime: number): void {
        if (currentTime - this.lastPowerUpSpawn > this.powerUpSpawnRate) {
            if (this.shouldSpawnPowerUp()) {
                this.createRandomPowerUp();
                this.lastPowerUpSpawn = currentTime;
            }
        }
    }

    /**
     * 判断是否应该生成道具
     * @returns {boolean}
     */
    shouldSpawnPowerUp(): boolean {
        // 基础概率
        let chance = GAME_CONFIG.POWER_UP.SPAWN_CHANCE;
        
        // 玩家血量低时增加生命道具概率
        if (this.game.player.health <= 2) {
            chance += 0.3;
        }
        
        // 限制道具数量
        if (this.game.powerUps.length >= 3) {
            chance *= 0.3;
        }
        
        return Math.random() < chance;
    }

    /**
     * 创建随机道具
     */
    createRandomPowerUp(): void {
        const types = ['health', 'shield', 'rapidFire', 'doubleShot', 'multiShot'];
        const weights = this.getPowerUpTypeWeights();
        const selectedType = this.weightedRandomSelect(types, weights);
        
        const powerUp = this.createPowerUpByType(selectedType);
        this.game.powerUps.push(powerUp);
        
        console.log(`🎁 生成道具: ${selectedType}`);
    }

    /**
     * 获取道具类型权重
     * @returns {Array<number>}
     */
    getPowerUpTypeWeights(): number[] {
        const player = this.game.player;
        let weights = [20, 20, 20, 20, 20]; // health, shield, rapidFire, doubleShot, multiShot
        
        // 根据玩家状态调整权重
        if (player.health <= 2) {
            weights[0] = 40; // 增加生命道具权重
        }
        
        if (player.health >= player.maxHealth) {
            weights[0] = 5; // 减少生命道具权重
        }
        
        if (player.shield) {
            weights[1] = 5; // 减少护盾道具权重
        }
        
        if (player.rapidFireEnd > Date.now()) {
            weights[2] = 5; // 减少连射道具权重
        }
        
        if (player.doubleShotEnd > Date.now()) {
            weights[3] = 5; // 减少双发道具权重
        }
        
        if (player.multiShotEnd > Date.now()) {
            weights[4] = 5; // 减少多发道具权重
        }
        
        return weights;
    }

    /**
     * 根据类型创建道具
     * @param {string} type 
     * @returns {PowerUp}
     */
    createPowerUpByType(type: string): PowerUp {
        const x = Math.random() * (this.game.canvas.width - 30);
        const y = -30;
        
        return new PowerUp(x, y, type);
    }

    /**
     * 立即生成指定类型的敌机（调试用）
     * @param {string} type 
     */
    forceSpawnEnemy(type: string): void {
        const enemy = this.createEnemyByType(type);
        this.game.enemies.push(enemy);
        console.log(`🔧 强制生成敌机: ${type}`);
    }

    /**
     * 立即生成指定类型的道具（调试用）
     * @param {string} type 
     */
    forceSpawnPowerUp(type: string): void {
        const powerUp = this.createPowerUpByType(type);
        this.game.powerUps.push(powerUp);
        console.log(`🔧 强制生成道具: ${type}`);
    }

    /**
     * 立即生成Boss（调试用）
     */
    forceSpawnBoss(): void {
        this.createBoss();
        console.log('🔧 强制生成Boss');
    }

    /**
     * 清空所有生成物
     */
    clearAll(): void {
        this.game.enemies.length = 0;
        this.game.powerUps.length = 0;
        this.game.bullets.length = 0;
        this.game.enemyBullets.length = 0;
        console.log('🧹 清空所有生成物');
    }

    /**
     * 重置生成时间
     */
    resetSpawnTimers(): void {
        const currentTime = Date.now();
        this.lastEnemySpawn = currentTime;
        this.lastPowerUpSpawn = currentTime;
        this.lastBossSpawn = currentTime;
        console.log('⏰ 重置生成计时器');
    }

    /**
     * 更新关卡相关的生成参数
     * @param {number} newLevel 
     */
    updateLevel(newLevel: number): void {
        this.game.level = newLevel;
        this.calculateSpawnRates();
        console.log(`📈 关卡更新为: ${newLevel}`);
    }

    /**
     * 获取当前生成状态信息
     * @returns {Object}
     */
    getSpawnStatus(): object {
        const currentTime = Date.now();
        return {
            enemySpawnRate: this.enemySpawnRate,
            timeSinceLastEnemy: currentTime - this.lastEnemySpawn,
            timeSinceLastPowerUp: currentTime - this.lastPowerUpSpawn,
            timeSinceLastBoss: currentTime - this.lastBossSpawn,
            enemyCount: this.game.enemies.length,
            powerUpCount: this.game.powerUps.length,
            bossCount: this.game.enemies.filter(e => e.type === 'boss').length
        };
    }
}

export default SpawnManager; 