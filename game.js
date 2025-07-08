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
        for (let i = 0; i < 150; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 0.5,
                speed: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
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
            star.twinklePhase += star.twinkleSpeed;
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
        // 主要爆炸粒子
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
        
        // 额外的火花效果
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, '#feca57'));
        }
        
        // 白色闪光粒子
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, '#ffffff'));
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
        this.backgroundStars.forEach(star => {
            const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6;
            const alpha = star.brightness * twinkle;
            const currentSize = star.size * twinkle;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // 星星发光效果
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = currentSize * 2;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, currentSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 十字形光芒效果（对于较大的星星）
            if (star.size > 2) {
                this.ctx.globalAlpha = alpha * 0.6;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(star.x - currentSize * 2, star.y);
                this.ctx.lineTo(star.x + currentSize * 2, star.y);
                this.ctx.moveTo(star.x, star.y - currentSize * 2);
                this.ctx.lineTo(star.x, star.y + currentSize * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
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
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 护盾效果
        if (this.shield) {
            ctx.save();
            ctx.shadowColor = '#3742fa';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#3742fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width/2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 无敌状态闪烁效果
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // 绘制玩家战斗机
        ctx.save();
        
        // 主体颜色
        let primaryColor = '#4ecdc4';
        let secondaryColor = '#45b7b8';
        let accentColor = '#ffffff';
        
        if (this.rapidFire) {
            primaryColor = '#ff6348';
            secondaryColor = '#ff5533';
            accentColor = '#feca57';
        }
        
        // 绘制机身（三角形战斗机）
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y); // 机头
        ctx.lineTo(this.x + 8, this.y + this.height - 5); // 左后
        ctx.lineTo(centerX, this.y + this.height - 15); // 中后
        ctx.lineTo(this.x + this.width - 8, this.y + this.height - 5); // 右后
        ctx.closePath();
        ctx.fill();
        
        // 绘制机翼
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        // 左翼
        ctx.moveTo(this.x + 5, this.y + 15);
        ctx.lineTo(this.x, this.y + 25);
        ctx.lineTo(this.x + 10, this.y + 30);
        ctx.lineTo(this.x + 15, this.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 右翼
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 5, this.y + 15);
        ctx.lineTo(this.x + this.width, this.y + 25);
        ctx.lineTo(this.x + this.width - 10, this.y + 30);
        ctx.lineTo(this.x + this.width - 15, this.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 12, 4, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制引擎喷焰（动态效果）
        const time = Date.now() * 0.01;
        const flameLength = this.rapidFire ? 20 : 15;
        const flameWidth = this.rapidFire ? 6 : 4;
        
        for (let i = 0; i < 3; i++) {
            const flameX = this.x + 12 + i * 8;
            const flameY = this.y + this.height - 5;
            const waver = Math.sin(time + i) * 2;
            
            // 外层火焰（红/橙色）
            ctx.fillStyle = this.rapidFire ? '#ff4757' : '#ff6b6b';
            ctx.beginPath();
            ctx.moveTo(flameX, flameY);
            ctx.lineTo(flameX - flameWidth/2 + waver, flameY + flameLength);
            ctx.lineTo(flameX + flameWidth/2 + waver, flameY + flameLength);
            ctx.closePath();
            ctx.fill();
            
            // 内层火焰（黄色）
            ctx.fillStyle = this.rapidFire ? '#feca57' : '#ffa502';
            ctx.beginPath();
            ctx.moveTo(flameX, flameY + 2);
            ctx.lineTo(flameX - flameWidth/4 + waver, flameY + flameLength - 3);
            ctx.lineTo(flameX + flameWidth/4 + waver, flameY + flameLength - 3);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();

        // 武器升级指示器
        if (Date.now() < this.doubleShotEnd || Date.now() < this.multiShotEnd) {
            ctx.fillStyle = '#feca57';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            const weaponText = Date.now() < this.multiShotEnd ? '◊◊◊' : '××';
            ctx.strokeText(weaponText, centerX, this.y - 8);
            ctx.fillText(weaponText, centerX, this.y - 8);
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
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // 根据敌机类型绘制不同形状
        switch(this.type) {
            case 'fast':
                this.renderFastEnemy(ctx, centerX, centerY);
                break;
            case 'heavy':
                this.renderHeavyEnemy(ctx, centerX, centerY);
                break;
            case 'zigzag':
                this.renderZigzagEnemy(ctx, centerX, centerY);
                break;
            case 'boss':
                this.renderBossEnemy(ctx, centerX, centerY);
                break;
            default:
                this.renderNormalEnemy(ctx, centerX, centerY);
                break;
        }
        
        ctx.restore();
        
        // 为重型敌机和Boss显示血条
        if (this.type === 'heavy' || this.type === 'zigzag' || this.type === 'boss') {
            this.renderHealthBar(ctx);
        }
        
        // Boss特殊效果
        if (this.type === 'boss') {
            ctx.fillStyle = '#feca57';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText('BOSS', centerX, this.y - 8);
            ctx.fillText('BOSS', centerX, this.y - 8);
        }
    }

    renderNormalEnemy(ctx, centerX, centerY) {
        // 普通敌机 - 倒三角形
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height); // 底部尖端
        ctx.lineTo(this.x + 5, this.y); // 左上
        ctx.lineTo(this.x + this.width - 5, this.y); // 右上
        ctx.closePath();
        ctx.fill();
        
        // 细节
        ctx.fillStyle = this.getDarkerColor();
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height - 5);
        ctx.lineTo(this.x + 8, this.y + 5);
        ctx.lineTo(this.x + this.width - 8, this.y + 5);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 8, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    renderFastEnemy(ctx, centerX, centerY) {
        // 快速敌机 - 尖锐的菱形
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height); // 底部
        ctx.lineTo(this.x, centerY); // 左侧
        ctx.lineTo(centerX, this.y); // 顶部
        ctx.lineTo(this.x + this.width, centerY); // 右侧
        ctx.closePath();
        ctx.fill();
        
        // 内部细节
        ctx.fillStyle = this.getDarkerColor();
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height - 3);
        ctx.lineTo(this.x + 3, centerY);
        ctx.lineTo(centerX, this.y + 3);
        ctx.lineTo(this.x + this.width - 3, centerY);
        ctx.closePath();
        ctx.fill();
        
        // 引擎发光
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.height - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    renderHeavyEnemy(ctx, centerX, centerY) {
        // 重型敌机 - 厚重的矩形战舰
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 装甲板
        ctx.fillStyle = this.getDarkerColor();
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // 炮塔
        ctx.fillStyle = '#666666';
        const turretWidth = 8;
        ctx.fillRect(centerX - turretWidth/2, this.y - 3, turretWidth, 8);
        ctx.fillRect(this.x + 5, this.y + 10, 6, 6);
        ctx.fillRect(this.x + this.width - 11, this.y + 10, 6, 6);
        
        // 装甲条纹
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = this.y + 10 + i * 8;
            ctx.beginPath();
            ctx.moveTo(this.x + 8, y);
            ctx.lineTo(this.x + this.width - 8, y);
            ctx.stroke();
        }
        
        // 推进器发光
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x + 10, this.y + this.height - 2, 6, 4);
        ctx.fillRect(this.x + this.width - 16, this.y + this.height - 2, 6, 4);
    }

    renderZigzagEnemy(ctx, centerX, centerY) {
        // 锯齿敌机 - 不规则形状
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height);
        ctx.lineTo(this.x + 2, this.y + 15);
        ctx.lineTo(this.x + 8, this.y + 5);
        ctx.lineTo(this.x + 5, this.y);
        ctx.lineTo(this.x + this.width - 5, this.y);
        ctx.lineTo(this.x + this.width - 8, this.y + 5);
        ctx.lineTo(this.x + this.width - 2, this.y + 15);
        ctx.closePath();
        ctx.fill();
        
        // 锯齿边缘
        ctx.fillStyle = this.getDarkerColor();
        ctx.beginPath();
        ctx.moveTo(centerX, this.y + this.height - 3);
        ctx.lineTo(this.x + 5, this.y + 12);
        ctx.lineTo(this.x + 10, this.y + 8);
        ctx.lineTo(this.x + 8, this.y + 3);
        ctx.lineTo(this.x + this.width - 8, this.y + 3);
        ctx.lineTo(this.x + this.width - 10, this.y + 8);
        ctx.lineTo(this.x + this.width - 5, this.y + 12);
        ctx.closePath();
        ctx.fill();
        
        // 能量核心
        const pulse = Math.sin(this.time * 5) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 8, 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    renderBossEnemy(ctx, centerX, centerY) {
        // Boss敌机 - 复杂的战舰
        // 主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);
        
        // 指挥台
        ctx.fillRect(this.x + 15, this.y, this.width - 30, 20);
        
        // 装甲细节
        ctx.fillStyle = this.getDarkerColor();
        ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, this.height - 25);
        ctx.fillRect(this.x + 20, this.y + 3, this.width - 40, 14);
        
        // 炮塔
        ctx.fillStyle = '#666666';
        const turrets = [
            {x: this.x + 10, y: this.y + 5},
            {x: this.x + this.width - 18, y: this.y + 5},
            {x: this.x + 15, y: this.y + 25},
            {x: this.x + this.width - 23, y: this.y + 25}
        ];
        
        turrets.forEach(turret => {
            ctx.fillRect(turret.x, turret.y, 8, 8);
        });
        
        // 主炮
        ctx.fillStyle = '#444444';
        ctx.fillRect(centerX - 6, this.y - 5, 12, 10);
        
        // 推进器
        ctx.fillStyle = '#ff4757';
        const engineTime = Date.now() * 0.02;
        for (let i = 0; i < 4; i++) {
            const engineX = this.x + 15 + i * 12.5;
            const flicker = Math.sin(engineTime + i) * 0.3 + 0.7;
            ctx.globalAlpha = flicker;
            ctx.fillRect(engineX, this.y + this.height - 3, 6, 8);
        }
        ctx.globalAlpha = 1;
        
        // Boss发光效果
        const glowIntensity = Math.sin(this.time * 3) * 0.3 + 0.7;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * glowIntensity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);
        ctx.shadowBlur = 0;
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
        this.trail = []; // 轨迹点
    }

    update() {
        // 保存当前位置到轨迹
        this.trail.unshift({x: this.x + this.width/2, y: this.y + this.height/2});
        if (this.trail.length > 8) {
            this.trail.pop();
        }
        
        this.y += this.speed;
    }

    render(ctx) {
        ctx.save();
        
        // 绘制轨迹
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (this.trail.length - i) / this.trail.length * 0.6;
            const size = (this.trail.length - i) / this.trail.length * 3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#feca57';
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 主体子弹
        ctx.globalAlpha = 1;
        
        // 发光效果
        ctx.shadowColor = '#feca57';
        ctx.shadowBlur = 8;
        
        // 子弹形状（椭圆）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 内核
        ctx.fillStyle = '#feca57';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/3, this.height/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
}

class EnemyBullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.speed = speed;
        this.time = 0;
    }

    update() {
        this.y += this.speed;
        this.time += 0.2;
    }

    render(ctx) {
        ctx.save();
        
        // 敌机子弹的发光效果
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 6;
        
        // 脉冲效果
        const pulse = Math.sin(this.time) * 0.2 + 0.8;
        const size = pulse;
        
        // 外层红色
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/2 * size, 
            this.height/2 * size, 
            0, 0, 2 * Math.PI
        );
        ctx.fill();
        
        // 内层暗红色
        ctx.fillStyle = '#c44569';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/3 * size, 
            this.height/3 * size, 
            0, 0, 2 * Math.PI
        );
        ctx.fill();
        
        // 中心亮点
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
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
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.life = 40;
        this.maxLife = 40;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.type = Math.random() > 0.7 ? 'spark' : 'circle'; // 70%圆形，30%火花
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += 0.1; // 重力效果
        this.rotation += this.rotationSpeed;
        this.life--;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        const currentSize = this.size * (this.life / this.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        if (this.type === 'spark') {
            // 火花粒子
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // 创建渐变
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 2);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.adjustColorBrightness(this.color, 0.7));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-currentSize, -currentSize/4, currentSize * 2, currentSize/2);
        } else {
            // 圆形粒子
            // 外圈发光
            ctx.shadowColor = this.color;
            ctx.shadowBlur = currentSize * 2;
            
            // 创建径向渐变
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, currentSize
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, this.color);
            gradient.addColorStop(1, this.adjustColorBrightness(this.color, 0.3));
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    adjustColorBrightness(color, factor) {
        // 简单的颜色亮度调整
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            const newR = Math.floor(r * factor);
            const newG = Math.floor(g * factor);
            const newB = Math.floor(b * factor);
            
            return `rgb(${newR}, ${newG}, ${newB})`;
        }
        return color;
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
