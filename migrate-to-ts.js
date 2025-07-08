#!/usr/bin/env node

/**
 * JavaScript to TypeScript 迁移脚本
 * 自动化将JS文件转换为TS文件
 */

const fs = require('fs');
const path = require('path');

// 需要转换的文件列表
const filesToMigrate = [
    // 类文件
    'src/classes/Player.js',
    'src/classes/Enemy.js', 
    'src/classes/Weapon.js',
    'src/classes/PowerUp.js',
    'src/classes/Background.js',
    'src/classes/Particle.js',
    
    // 管理器文件
    'src/managers/InputManager.js',
    'src/managers/AudioManager.js',
    'src/managers/CollisionManager.js',
    'src/managers/SpawnManager.js',
    'src/managers/GameStateManager.js',
    'src/managers/UIManager.js',
    
    // 主文件
    'src/Game.js',
    'src/main.js'
];

// 类型映射
const typeMap = {
    'any': 'any',
    'Object': 'any',
    'Array': 'any[]',
    'Function': '(...args: any[]) => any',
    'boolean': 'boolean',
    'number': 'number',
    'string': 'string'
};

// 通用替换规则
const replacementRules = [
    // 导入语句
    {
        pattern: /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)\.js['"];?/g,
        replacement: "import { $1 } from '$2.js';"
    },
    {
        pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)\.js['"];?/g,
        replacement: "import $1 from '$2.js';"
    },
    
    // 类型注解
    {
        pattern: /constructor\s*\(([^)]*)\)\s*{/g,
        replacement: function(match, params) {
            // 这里需要手动添加类型，脚本只做基础替换
            return match;
        }
    },
    
    // JSDoc to TypeScript
    {
        pattern: /\/\*\*\s*\n\s*\*\s*@param\s*{\s*([^}]+)\s*}\s*(\w+)\s*-?\s*([^\n]*)\n/g,
        replacement: ''
    }
];

/**
 * 转换单个文件
 */
function migrateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 应用替换规则
    replacementRules.forEach(rule => {
        if (typeof rule.replacement === 'function') {
            content = content.replace(rule.pattern, rule.replacement);
        } else {
            content = content.replace(rule.pattern, rule.replacement);
        }
    });
    
    // 添加基本类型导入
    if (filePath.includes('classes/') || filePath.includes('managers/')) {
        const importLine = "import type { IGameObject, ICollidable } from '../types/global.js';\n";
        content = content.replace(/^(import.*\n)/, `$1${importLine}`);
    }
    
    // 写入TS文件
    const tsFilePath = filePath.replace('.js', '.ts');
    
    if (content !== originalContent) {
        fs.writeFileSync(tsFilePath, content);
        console.log(`✅ 转换完成: ${filePath} -> ${tsFilePath}`);
    } else {
        console.log(`ℹ️  无需更改: ${filePath}`);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 开始 JavaScript 到 TypeScript 的迁移...\n');
    
    filesToMigrate.forEach(filePath => {
        migrateFile(filePath);
    });
    
    console.log('\n📝 迁移完成！请手动完善以下内容：');
    console.log('1. 为函数参数添加类型注解');
    console.log('2. 为类属性添加类型声明');
    console.log('3. 实现接口（IGameObject, ICollidable等）');
    console.log('4. 处理any类型，添加具体类型');
    console.log('5. 更新HTML文件中的脚本引用');
    
    console.log('\n🔧 运行以下命令完成设置：');
    console.log('npm run build');
    console.log('npm run dev');
}

if (require.main === module) {
    main();
}

module.exports = { migrateFile, replacementRules }; 