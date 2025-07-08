class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 80);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.keys = {};
        this.lastEnemySpawn = 0;
        this.enemySpawnRate = 2000; // 毫秒
        this.backgroundStars = [];
        
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
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('gameStart').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 80);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemySpawnRate = 2000;
        this.updateUI();
        this.startGame();
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastEnemySpawn > this.enemySpawnRate) {
            this.enemies.push(new Enemy(
                Math.random() * (this.canvas.width - 40),
                -40,
                Math.random() * 2 + 1
            ));
            this.lastEnemySpawn = now;
            // 随着时间增加难度
            this.enemySpawnRate = Math.max(800, this.enemySpawnRate - 5);
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

        // 更新敌机
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            return enemy.y < this.canvas.height + 50;
        });

        // 更新粒子效果
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // 碰撞检测
        this.checkCollisions();

        // 检查游戏结束
        if (this.lives <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    checkCollisions() {
        // 子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    // 创建爆炸效果
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // 移除子弹和敌机
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    
                    // 增加分数
                    this.score += 10;
                }
            });
        });

        // 玩家与敌机碰撞
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(this.player, enemy)) {
                // 创建爆炸效果
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                
                // 移除敌机
                this.enemies.splice(enemyIndex, 1);
                
                // 减少生命
                this.lives--;
                
                // 玩家无敌时间
                this.player.invulnerable = true;
                setTimeout(() => {
                    this.player.invulnerable = false;
                }, 1000);
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('finalScore').textContent = this.score;
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').classList.remove('hidden');
    }

    render() {
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
    }

    shoot(bullets) {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8));
            this.lastShot = now;
        }
    }

    render(ctx) {
        // 无敌状态闪烁效果
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }

        // 绘制玩家飞机
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制飞机细节
        ctx.fillStyle = '#45b7b8';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        
        // 绘制引擎火焰
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x + 10, this.y + this.height, 5, 10);
        ctx.fillRect(this.x + 25, this.y + this.height, 5, 10);

        ctx.globalAlpha = 1;
    }
}

class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = speed;
    }

    update() {
        this.y += this.speed;
    }

    render(ctx) {
        // 绘制敌机
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制敌机细节
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);
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

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
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
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
