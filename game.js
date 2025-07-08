class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.muted = false;
        this.volume = 0.3;
        this.initializeSounds();
    }

    initializeSounds() {
        // 使用Web Audio API创建合成音效
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
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

    createShootSound() {
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

    createExplosionSound() {
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

    createPowerUpSound() {
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

    createHitSound() {
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

    createBackgroundMusic() {
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
                    gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
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

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    startBackgroundMusic() {
        this.backgroundMusic = true;
        this.sounds.backgroundMusic();
    }

    stopBackgroundMusic() {
        this.backgroundMusic = false;
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBackgroundMusic();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.audioManager = new AudioManager();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 80);
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.keys = {};
        this.lastEnemySpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.enemySpawnRate = 2000; // 毫秒
        this.powerUpSpawnRate = 15000; // 15秒
        this.backgroundStars = [];
        this.bossSpawned = false;
        this.enemiesKilled = 0;
        
        // 视觉效果
        this.screenShake = 0;
        this.flashEffect = 0;
        
        // 最高分记录
        this.highScore = this.loadHighScore();
        
        this.initializeStars();
        this.setupEventListeners();
        this.gameLoop();
    }

    initializeStars() {
        for (let i = 0; i < 100; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.player.shoot(this.bullets);
                    this.audioManager.play('shoot');
                }
            }
            if (e.key.toLowerCase() === 'p' && this.gameState === 'playing') {
                this.gameState = 'paused';
            } else if (e.key.toLowerCase() === 'p' && this.gameState === 'paused') {
                this.gameState = 'playing';
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        // 音频控制
        document.getElementById('muteBtn').addEventListener('click', () => {
            this.audioManager.toggleMute();
            const btn = document.getElementById('muteBtn');
            btn.textContent = this.audioManager.muted ? '🔇' : '🔊';
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.audioManager.setVolume(e.target.value / 100);
        });
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('gameStart').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        this.audioManager.startBackgroundMusic();
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemiesKilled = 0;
        this.bossSpawned = false;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 80);
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.enemySpawnRate = 2000;
        this.powerUpSpawnRate = 15000;
        this.lastPowerUpSpawn = 0;
        this.updateUI();
        this.startGame();
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastEnemySpawn > this.enemySpawnRate) {
            let enemyType = 'normal';
            let x = Math.random() * (this.canvas.width - 40);
            let speed = Math.random() * 2 + 1;
            
            // 每20个敌机生成一个Boss
            if (this.enemiesKilled > 0 && this.enemiesKilled % 20 === 0 && !this.bossSpawned) {
                enemyType = 'boss';
                x = this.canvas.width / 2 - 40; // Boss居中
                this.bossSpawned = true;
            } else {
                // 根据关卡决定敌机类型
                const rand = Math.random();
                
                if (this.level >= 8) {
                    // 高级关卡 - 更多高级敌机
                    if (rand < 0.4) enemyType = 'fast';
                    else if (rand < 0.65) enemyType = 'heavy';
                    else if (rand < 0.8) enemyType = 'zigzag';
                    else enemyType = 'normal';
                } else if (this.level >= 5) {
                    // 中级关卡
                    if (rand < 0.3) enemyType = 'fast';
                    else if (rand < 0.55) enemyType = 'heavy';
                    else if (rand < 0.7) enemyType = 'zigzag';
                    else enemyType = 'normal';
                } else if (this.level >= 3) {
                    // 初级关卡
                    if (rand < 0.25) enemyType = 'fast';
                    else if (rand < 0.45) enemyType = 'heavy';
                    else if (rand < 0.55) enemyType = 'zigzag';
                    else enemyType = 'normal';
                } else if (this.level >= 2) {
                    // 早期关卡
                    if (rand < 0.2) enemyType = 'fast';
                    else if (rand < 0.35) enemyType = 'heavy';
                    else enemyType = 'normal';
                } else {
                    // 第一关
                    if (rand < 0.15) enemyType = 'fast';
                    else enemyType = 'normal';
                }
                
                // 根据关卡调整敌机速度
                speed += (this.level - 1) * 0.3;
            }
            
            this.enemies.push(new Enemy(x, -40, speed, enemyType));
            this.lastEnemySpawn = now;
            
            // 随着时间增加难度
            this.enemySpawnRate = Math.max(600, this.enemySpawnRate - 3);
        }
    }

    spawnPowerUp() {
        const now = Date.now();
        if (now - this.lastPowerUpSpawn > this.powerUpSpawnRate) {
            const powerUpTypes = ['health', 'doubleShot', 'shield', 'rapidFire', 'multiShot'];
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            const x = Math.random() * (this.canvas.width - 25);
            
            this.powerUps.push(new PowerUp(x, -25, randomType));
            this.lastPowerUpSpawn = now;
            
            // 随着游戏进行，道具生成更频繁
            this.powerUpSpawnRate = Math.max(8000, this.powerUpSpawnRate - 100);
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        // 更新背景星星
        this.backgroundStars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        });

        // 更新玩家
        this.player.update(this.keys, this.canvas.width, this.canvas.height);

        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y > -10;
        });

        // 生成敌机
        this.spawnEnemy();

        // 生成道具
        this.spawnPowerUp();

        // 更新敌机
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.enemyBullets);
            return enemy.y < this.canvas.height + 50;
        });

        // 更新敌机子弹
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.y < this.canvas.height + 10;
        });

        // 更新道具
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            return powerUp.y < this.canvas.height + 30;
        });

        // 更新粒子效果
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // 碰撞检测
        this.checkCollisions();

        // 更新视觉效果
        this.updateVisualEffects();

        // 更新关卡
        this.updateLevel();

        // 检查游戏结束
        if (this.lives <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    checkCollisions() {
        // 玩家子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    // 创建爆炸效果
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.audioManager.play('explosion');
                    
                    // 移除子弹
                    this.bullets.splice(bulletIndex, 1);
                    
                    // 敌机受伤
                    if (enemy.takeDamage()) {
                        // 敌机死亡
                        this.enemies.splice(enemyIndex, 1);
                        this.score += enemy.score;
                        this.enemiesKilled++;
                        
                        // 视觉效果 - 根据敌机类型调整强度
                        let shakeIntensity = 3;
                        let flashIntensity = 20;
                        if (enemy.type === 'boss') {
                            shakeIntensity = 15;
                            flashIntensity = 50;
                        } else if (enemy.type === 'heavy') {
                            shakeIntensity = 8;
                            flashIntensity = 30;
                        }
                        this.addScreenShake(shakeIntensity);
                        this.addFlashEffect(flashIntensity);
                        
                        // Boss死亡后重置Boss标志
                        if (enemy.type === 'boss') {
                            this.bossSpawned = false;
                        }
                    } else {
                        // 敌机受伤但未死亡
                        this.audioManager.play('hit');
                        this.addScreenShake(2);
                    }
                }
            });
        });

        // 玩家与敌机碰撞
        this.enemies.forEach((enemy, enemyIndex) => {
            if (!this.player.invulnerable && this.isColliding(this.player, enemy)) {
                // 创建爆炸效果
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                this.audioManager.play('explosion');
                
                // 移除敌机
                this.enemies.splice(enemyIndex, 1);
                
                // 护盾保护
                if (!this.player.shield) {
                    // 减少生命
                    this.lives--;
                    this.audioManager.play('hit');
                    this.addScreenShake(10);
                    this.addFlashEffect(80);
                    
                    // 玩家无敌时间
                    this.player.invulnerable = true;
                    setTimeout(() => {
                        this.player.invulnerable = false;
                    }, 1500);
                }
            }
        });

        // 敌机子弹与玩家碰撞
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (!this.player.invulnerable && this.isColliding(this.player, bullet)) {
                // 创建爆炸效果
                this.createExplosion(bullet.x, bullet.y);
                
                // 移除子弹
                this.enemyBullets.splice(bulletIndex, 1);
                
                // 护盾保护
                if (!this.player.shield) {
                    // 减少生命
                    this.lives--;
                    this.audioManager.play('hit');
                    this.addScreenShake(8);
                    this.addFlashEffect(60);
                    
                    // 玩家无敌时间
                    this.player.invulnerable = true;
                    setTimeout(() => {
                        this.player.invulnerable = false;
                    }, 1500);
                }
            }
        });

        // 玩家与道具碰撞
        this.powerUps.forEach((powerUp, powerUpIndex) => {
            if (this.isColliding(this.player, powerUp)) {
                // 创建特效
                this.createExplosion(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.color);
                this.audioManager.play('powerUp');
                
                // 应用道具效果
                this.player.applyPowerUp(powerUp.type);
                
                // 移除道具
                this.powerUps.splice(powerUpIndex, 1);
                
                // 特殊处理生命道具
                if (powerUp.type === 'health') {
                    this.lives = Math.min(this.lives + 1, 5); // 最大5条命
                }
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y, color = '#ff6b6b') {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    addScreenShake(intensity) {
        this.screenShake = Math.max(this.screenShake, intensity);
    }

    addFlashEffect(intensity) {
        this.flashEffect = Math.max(this.flashEffect, intensity);
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('shootingGameHighScore')) || 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('shootingGameHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('无法保存最高分记录');
        }
    }

    checkNewHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            return true;
        }
        return false;
    }

    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        
        // 如果关卡提升
        if (newLevel > this.level) {
            this.level = newLevel;
            this.onLevelUp();
        }
    }

    onLevelUp() {
        // 关卡提升时的效果
        this.addScreenShake(8);
        this.addFlashEffect(40);
        
        // 调整游戏难度
        this.adjustDifficulty();
        
        // 可能生成奖励道具
        if (Math.random() < 0.7) { // 70%概率生成道具
            const powerUpTypes = ['health', 'doubleShot', 'shield', 'rapidFire', 'multiShot'];
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            const x = Math.random() * (this.canvas.width - 25);
            this.powerUps.push(new PowerUp(x, -25, randomType));
        }
    }

    adjustDifficulty() {
        // 根据关卡调整敌机生成速度
        const baseSpawnRate = 2000;
        const levelMultiplier = Math.max(0.3, 1 - (this.level - 1) * 0.1);
        this.enemySpawnRate = Math.max(400, baseSpawnRate * levelMultiplier);
        
        // 道具生成频率也随关卡调整
        const basePowerUpRate = 15000;
        this.powerUpSpawnRate = Math.max(6000, basePowerUpRate - (this.level - 1) * 500);
    }

    updateVisualEffects() {
        // 更新屏幕震动
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }

        // 更新闪光效果
        if (this.flashEffect > 0) {
            this.flashEffect -= 5;
            if (this.flashEffect < 0) this.flashEffect = 0;
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = Math.floor(this.score / 100) + 1;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        
        // 更新道具状态显示
        this.updatePowerUpStatus();
        
        // 显示或隐藏新高分消息
        const newHighScoreMsg = document.getElementById('newHighScoreMsg');
        if (this.score > 0 && this.score === this.highScore && this.gameState === 'gameOver') {
            newHighScoreMsg.classList.remove('hidden');
        } else {
            newHighScoreMsg.classList.add('hidden');
        }
    }

    updatePowerUpStatus() {
        const statusContainer = document.getElementById('powerUpStatus');
        statusContainer.innerHTML = '';
        
        if (this.gameState !== 'playing') return;
        
        const now = Date.now();
        
        // 护盾状态
        if (this.player.shield && now < this.player.shieldEnd) {
            const remaining = Math.ceil((this.player.shieldEnd - now) / 1000);
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator shield';
            indicator.innerHTML = `🛡 护盾 <span class="power-up-timer">${remaining}s</span>`;
            statusContainer.appendChild(indicator);
        }
        
        // 快速射击状态
        if (this.player.rapidFire && now < this.player.rapidFireEnd) {
            const remaining = Math.ceil((this.player.rapidFireEnd - now) / 1000);
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator rapidFire';
            indicator.innerHTML = `⚡ 快速射击 <span class="power-up-timer">${remaining}s</span>`;
            statusContainer.appendChild(indicator);
        }
        
        // 双重射击状态
        if (now < this.player.doubleShotEnd) {
            const remaining = Math.ceil((this.player.doubleShotEnd - now) / 1000);
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator doubleShot';
            indicator.innerHTML = `×2 双重射击 <span class="power-up-timer">${remaining}s</span>`;
            statusContainer.appendChild(indicator);
        }
        
        // 多重射击状态
        if (now < this.player.multiShotEnd) {
            const remaining = Math.ceil((this.player.multiShotEnd - now) / 1000);
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator multiShot';
            indicator.innerHTML = `◊ 多重射击 <span class="power-up-timer">${remaining}s</span>`;
            statusContainer.appendChild(indicator);
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // 检查是否创造新的最高分
        const isNewHighScore = this.checkNewHighScore();
        
        document.getElementById('gameOver').classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
        
        // 如果是新的最高分，添加特效
        if (isNewHighScore) {
            this.addScreenShake(20);
            this.addFlashEffect(100);
        }
    }

    render() {
        // 保存canvas状态
        this.ctx.save();
        
        // 应用屏幕震动
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // 清除画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景星星
        this.ctx.fillStyle = '#ffffff';
        this.backgroundStars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // 绘制玩家
            this.player.render(this.ctx);

            // 绘制子弹
            this.bullets.forEach(bullet => bullet.render(this.ctx));

            // 绘制敌机
            this.enemies.forEach(enemy => enemy.render(this.ctx));

            // 绘制敌机子弹
            this.enemyBullets.forEach(bullet => bullet.render(this.ctx));

            // 绘制道具
            this.powerUps.forEach(powerUp => powerUp.render(this.ctx));

            // 绘制粒子效果
            this.particles.forEach(particle => particle.render(this.ctx));

            // 绘制暂停信息
            if (this.gameState === 'paused') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.font = '24px Arial';
                this.ctx.fillText('按P键继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
            }
        }

        // 应用闪光效果
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect / 255})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 恢复canvas状态
        this.ctx.restore();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.invulnerable = false;
        this.lastShot = 0;
        this.shootCooldown = 200; // 毫秒
        this.maxHealth = 3;
        this.health = 3;
        
        // 道具效果
        this.weaponType = 'normal'; // normal, double, multi
        this.rapidFire = false;
        this.rapidFireEnd = 0;
        this.shield = false;
        this.shieldEnd = 0;
        this.doubleShotEnd = 0;
        this.multiShotEnd = 0;
    }

    update(keys, canvasWidth, canvasHeight) {
        // 移动控制
        if (keys['a'] || keys['arrowleft']) {
            this.x -= this.speed;
        }
        if (keys['d'] || keys['arrowright']) {
            this.x += this.speed;
        }
        if (keys['w'] || keys['arrowup']) {
            this.y -= this.speed;
        }
        if (keys['s'] || keys['arrowdown']) {
            this.y += this.speed;
        }

        // 边界检查
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
        
        // 更新道具效果
        this.updatePowerUpEffects();
    }

    updatePowerUpEffects() {
        const now = Date.now();
        
        // 检查快速射击效果是否过期
        if (this.rapidFire && now > this.rapidFireEnd) {
            this.rapidFire = false;
        }
        
        // 检查护盾效果是否过期
        if (this.shield && now > this.shieldEnd) {
            this.shield = false;
        }
    }

    applyPowerUp(type) {
        const now = Date.now();
        
        switch(type) {
            case 'health':
                if (this.health < this.maxHealth) {
                    this.health++;
                }
                break;
            case 'doubleShot':
                this.doubleShotEnd = now + 10000; // 10秒
                break;
            case 'shield':
                this.shield = true;
                this.shieldEnd = now + 8000; // 8秒
                break;
            case 'rapidFire':
                this.rapidFire = true;
                this.rapidFireEnd = now + 7000; // 7秒
                break;
            case 'multiShot':
                this.multiShotEnd = now + 12000; // 12秒
                break;
        }
    }

    shoot(bullets) {
        const now = Date.now();
        const cooldown = this.rapidFire ? this.shootCooldown / 2 : this.shootCooldown;
        
        if (now - this.lastShot > cooldown) {
            const centerX = this.x + this.width / 2;
            
            // 检查武器类型和道具效果
            if (now < this.multiShotEnd || this.weaponType === 'multi') {
                // 三连发
                bullets.push(new Bullet(centerX - 2, this.y, -8));
                bullets.push(new Bullet(centerX - 15, this.y + 5, -7));
                bullets.push(new Bullet(centerX + 11, this.y + 5, -7));
            } else if (now < this.doubleShotEnd || this.weaponType === 'double') {
                // 双连发
                bullets.push(new Bullet(centerX - 8, this.y, -8));
                bullets.push(new Bullet(centerX + 4, this.y, -8));
            } else {
                // 普通射击
                bullets.push(new Bullet(centerX - 2, this.y, -8));
            }
            
            this.lastShot = now;
        }
    }

    render(ctx) {
        // 护盾效果
        if (this.shield) {
            ctx.shadowColor = '#3742fa';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#3742fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 无敌状态闪烁效果
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // 绘制玩家飞机
        let shipColor = '#4ecdc4';
        if (this.rapidFire) shipColor = '#ff6348'; // 快速射击时变红
        
        ctx.fillStyle = shipColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制飞机细节
        ctx.fillStyle = this.rapidFire ? '#ff5533' : '#45b7b8';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // 绘制引擎火焰（强化效果时更大）
        const flameColor = this.rapidFire ? '#feca57' : '#ff6b6b';
        const flameHeight = this.rapidFire ? 15 : 10;
        ctx.fillStyle = flameColor;
        ctx.fillRect(this.x + 10, this.y + this.height, 5, flameHeight);
        ctx.fillRect(this.x + 25, this.y + this.height, 5, flameHeight);

        // 武器升级指示器
        if (Date.now() < this.doubleShotEnd || Date.now() < this.multiShotEnd) {
            ctx.fillStyle = '#feca57';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const weaponText = Date.now() < this.multiShotEnd ? '◊' : '×2';
            ctx.fillText(weaponText, this.x + this.width/2, this.y - 5);
        }

        ctx.globalAlpha = 1;
    }
}

class Enemy {
    constructor(x, y, speed, type = 'normal') {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.type = type;
        this.initialX = x;
        this.time = 0;
        
        // 根据类型设置属性
        switch(type) {
            case 'fast':
                this.width = 20;
                this.height = 20;
                this.hp = 1;
                this.score = 15;
                this.speed = speed * 1.5;
                this.color = '#ff9f43';
                break;
            case 'heavy':
                this.width = 45;
                this.height = 45;
                this.hp = 3;
                this.maxHp = 3;
                this.score = 30;
                this.speed = speed * 0.6;
                this.color = '#8c7ae6';
                break;
            case 'zigzag':
                this.width = 25;
                this.height = 25;
                this.hp = 2;
                this.maxHp = 2;
                this.score = 25;
                this.color = '#ff6348';
                break;
            case 'boss':
                this.width = 80;
                this.height = 60;
                this.hp = 15;
                this.maxHp = 15;
                this.score = 200;
                this.speed = speed * 0.3;
                this.color = '#ee5a24';
                this.shootTimer = 0;
                break;
            default: // normal
                this.width = 30;
                this.height = 30;
                this.hp = 1;
                this.score = 10;
                this.color = '#ff6b6b';
        }
    }

    update(bullets) {
        this.time += 0.1;
        
        // 不同类型的移动模式
        switch(this.type) {
            case 'zigzag':
                this.y += this.speed;
                this.x = this.initialX + Math.sin(this.time) * 50;
                break;
            case 'boss':
                this.y += this.speed;
                // Boss会左右移动
                if (this.y > 50) {
                    this.x += Math.sin(this.time * 0.5) * 2;
                }
                // Boss射击
                this.shootTimer++;
                if (this.shootTimer > 60 && bullets) { // 每60帧射击一次
                    this.shoot(bullets);
                    this.shootTimer = 0;
                }
                break;
            default:
                this.y += this.speed;
        }
    }

    shoot(bullets) {
        // Boss的射击模式
        if (this.type === 'boss') {
            bullets.push(new EnemyBullet(this.x + this.width/2 - 2, this.y + this.height, 3));
            bullets.push(new EnemyBullet(this.x + this.width/4, this.y + this.height, 3));
            bullets.push(new EnemyBullet(this.x + this.width*3/4, this.y + this.height, 3));
        }
    }

    takeDamage() {
        this.hp--;
        return this.hp <= 0;
    }

    render(ctx) {
        // 绘制敌机主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制敌机细节
        ctx.fillStyle = this.getDarkerColor();
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);
        
        // 为重型敌机和Boss显示血条
        if (this.type === 'heavy' || this.type === 'zigzag' || this.type === 'boss') {
            this.renderHealthBar(ctx);
        }
        
        // Boss特殊效果
        if (this.type === 'boss') {
            // 绘制Boss标识
            ctx.fillStyle = '#feca57';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS', this.x + this.width/2, this.y - 5);
        }
    }

    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;
        
        // 背景
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ed573' : healthPercent > 0.2 ? '#ffa502' : '#ff4757';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    getDarkerColor() {
        const colors = {
            '#ff6b6b': '#ff5252',
            '#ff9f43': '#ff8c42',
            '#8c7ae6': '#7c69e0',
            '#ff6348': '#ff5533',
            '#ee5a24': '#e94e1b'
        };
        return colors[this.color] || '#ff5252';
    }
}

class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
    }

    render(ctx) {
        ctx.fillStyle = '#feca57';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class EnemyBullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
    }

    render(ctx) {
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 2;
        this.type = type;
        this.pulseTime = 0;
        
        // 根据类型设置属性
        switch(type) {
            case 'health':
                this.color = '#2ed573';
                this.symbol = '+';
                break;
            case 'doubleShot':
                this.color = '#ffa502';
                this.symbol = '×2';
                break;
            case 'shield':
                this.color = '#3742fa';
                this.symbol = '🛡';
                break;
            case 'rapidFire':
                this.color = '#ff6348';
                this.symbol = '⚡';
                break;
            case 'multiShot':
                this.color = '#8c7ae6';
                this.symbol = '◊';
                break;
        }
    }

    update() {
        this.y += this.speed;
        this.pulseTime += 0.2;
    }

    render(ctx) {
        // 脉冲效果
        const pulse = Math.sin(this.pulseTime) * 0.1 + 1;
        const size = this.width * pulse;
        const x = this.x + (this.width - size) / 2;
        const y = this.y + (this.height - size) / 2;
        
        // 绘制发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        // 主体
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, size, size);
        
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        
        // 符号
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.symbol, this.x + this.width/2, this.y + this.height/2 + 4);
        
        // 重置阴影
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color = '#ff6b6b') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
    } catch (error) {
        console.error('游戏初始化失败:', error);
    }
});
