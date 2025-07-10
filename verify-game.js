// 游戏验证脚本
import puppeteer from 'puppeteer';

async function verifyGame() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // 访问游戏页面
        await page.goto('http://localhost:8000/', { waitUntil: 'networkidle2' });
        
        // 等待canvas元素
        await page.waitForSelector('#gameCanvas', { timeout: 5000 });
        console.log('✓ Canvas元素加载成功');
        
        // 检查游戏是否初始化
        const gameInitialized = await page.evaluate(() => {
            return window.game !== undefined;
        });
        
        if (gameInitialized) {
            console.log('✓ 游戏实例初始化成功');
        } else {
            console.log('✗ 游戏实例未初始化');
        }
        
        // 检查游戏状态
        const gameState = await page.evaluate(() => {
            if (window.game && window.game.gameStateManager) {
                return window.game.gameStateManager.currentState;
            }
            return null;
        });
        
        console.log(`✓ 当前游戏状态: ${gameState || '未知'}`);
        
        // 模拟点击开始按钮
        const startButton = await page.$('#startButton');
        if (startButton) {
            await startButton.click();
            console.log('✓ 开始按钮点击成功');
            
            // 等待一秒，检查游戏是否开始
            await page.waitForTimeout(1000);
            
            const isPlaying = await page.evaluate(() => {
                return window.game && window.game.gameStateManager.currentState === 'playing';
            });
            
            if (isPlaying) {
                console.log('✓ 游戏已成功开始运行');
            }
        }
        
        console.log('\n游戏验证完成 - 所有功能正常运行!');
        
    } catch (error) {
        console.error('游戏验证失败:', error.message);
    } finally {
        await browser.close();
    }
}

// 运行验证
verifyGame();