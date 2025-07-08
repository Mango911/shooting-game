# 🚀 太空射击游戏 v2.0

一个功能丰富的HTML5太空射击游戏，采用现代前端工程化架构开发。

## ✨ 特性

### 🎮 游戏特性
- **多种敌机类型**：普通、快速、重型、之字形、Boss敌机
- **丰富道具系统**：生命恢复、护盾保护、武器升级、快速射击
- **动态关卡系统**：随着分数增长，难度自动调整
- **粒子特效系统**：爆炸、闪光、尾迹等视觉效果
- **音频系统**：Web Audio API合成音效和背景音乐
- **本地存储**：自动保存最高分记录

### 🔧 技术特性
- **ES6模块化架构**：清晰的代码组织和依赖管理
- **面向对象设计**：每个游戏对象都有独立的类
- **配置驱动**：游戏参数集中管理，易于调整
- **事件系统**：解耦的组件通信
- **响应式设计**：支持不同设备和屏幕尺寸
- **无障碍支持**：键盘导航和减少动画选项

## 🎯 游戏玩法

### 基本操作
- `WASD` 或 `方向键` - 移动飞机
- `空格键` - 射击
- `Enter` - 开始游戏/重新开始
- `ESC` - 暂停/继续游戏

### 敌机类型
| 类型 | 生命值 | 分数 | 特殊能力 |
|------|--------|------|----------|
| 普通敌机 | 1 | 10 | 直线移动 |
| 快速敌机 | 1 | 15 | 高速移动 |
| 重型敌机 | 3 | 30 | 双管射击 |
| 之字敌机 | 2 | 25 | 之字形移动 |
| Boss敌机 | 15 | 200 | 多管齐射+特殊攻击 |

### 道具系统
| 道具 | 效果 | 持续时间 |
|------|------|----------|
| ❤ 生命恢复 | 恢复1点生命值 | 即时 |
| 🛡 护盾保护 | 免疫一次伤害 | 8秒 |
| ⚡ 快速射击 | 射击速度翻倍 | 7秒 |
| ×× 双重射击 | 发射两发子弹 | 10秒 |
| ◊◊◊ 三重射击 | 发射三发子弹 | 12秒 |

## 🏗️ 项目结构

```
打飞机游戏/
├── package.json              # 项目配置和脚本
├── README.md                 # 项目文档
├── .gitignore               # Git忽略文件
├── public/                  # 静态资源
│   ├── index.html          # 主页面
│   └── style.css          # 样式文件
├── src/                    # 源代码
│   ├── main.js            # 应用入口
│   ├── Game.js            # 主游戏类
│   ├── config/            # 配置文件
│   │   └── gameConfig.js  # 游戏配置
│   ├── managers/          # 管理器
│   │   └── AudioManager.js # 音频管理
│   ├── classes/           # 游戏对象类
│   │   ├── Player.js      # 玩家类
│   │   ├── Enemy.js       # 敌机类
│   │   ├── Bullet.js      # 子弹类
│   │   ├── PowerUp.js     # 道具类
│   │   ├── Particle.js    # 粒子系统
│   │   └── Background.js  # 背景系统
│   └── utils/             # 工具函数
│       └── helpers.js     # 辅助函数
└── assets/                # 游戏资源（预留）
    ├── images/
    └── sounds/
```

## 🚀 快速开始

### 环境要求
- 现代浏览器（支持ES6模块和Web Audio API）
- 本地Web服务器（开发环境）

### 开发环境设置

1. **克隆项目**
```bash
git clone https://github.com/Mango911/shooting-game.git
cd shooting-game
```

2. **安装依赖**（可选）
```bash
npm install
```

3. **启动开发服务器**
```bash
# 使用Python（推荐）
npm run dev
# 或者
python3 -m http.server 8000

# 使用Node.js（需要安装http-server）
npm install -g http-server
http-server -p 8000
```

4. **访问游戏**
打开浏览器访问 `http://localhost:8000/public/`

### 生产环境部署

1. **构建项目**（如果需要）
```bash
npm run build
```

2. **部署到Web服务器**
- 将 `public/` 目录和 `src/` 目录上传到Web服务器
- 确保服务器支持ES6模块的MIME类型

## 🛠️ 开发指南

### 代码结构说明

#### 核心类层次
- **Game**: 主游戏控制器，协调所有系统
- **Player**: 玩家飞机，处理移动、射击、道具效果
- **Enemy**: 敌机基类，包含各种敌机子类
- **Bullet**: 子弹类，处理飞行和碰撞
- **PowerUp**: 道具类，提供各种增益效果
- **ParticleSystem**: 粒子系统，创建视觉特效
- **Background**: 背景系统，动态星空效果
- **AudioManager**: 音频管理，Web Audio API音效

#### 配置系统
游戏的所有参数都在 `src/config/gameConfig.js` 中集中管理：
- 画布尺寸和渲染设置
- 玩家属性（速度、生命值、武器冷却）
- 敌机配置（血量、分数、移动速度）
- 道具效果持续时间
- 关卡和难度设置

#### 工具函数
`src/utils/helpers.js` 提供了通用的工具函数：
- 数学计算（随机数、插值、碰撞检测）
- 本地存储管理
- 事件系统
- 屏幕震动效果
- 格式化函数

### 添加新功能

#### 添加新敌机类型
1. 在 `src/classes/Enemy.js` 中创建新的敌机子类
2. 在 `src/config/gameConfig.js` 中添加配置
3. 在 `Game.js` 的 `spawnEnemy()` 方法中添加生成逻辑

#### 添加新道具
1. 在 `src/config/gameConfig.js` 中定义道具类型
2. 在 `src/classes/PowerUp.js` 中添加渲染逻辑
3. 在 `src/classes/Player.js` 的 `applyPowerUp()` 中添加效果

#### 自定义音效
修改 `src/managers/AudioManager.js` 中的音效生成函数，或集成外部音频文件。

## 🎨 自定义和配置

### 游戏平衡调整
编辑 `src/config/gameConfig.js` 来调整游戏难度：
- 修改敌机生命值和分数
- 调整道具持续时间
- 改变关卡进度速度

### 视觉效果定制
- 修改 `src/classes/Background.js` 改变背景效果
- 调整 `src/classes/Particle.js` 中的粒子参数
- 在各个类的 `render()` 方法中修改绘制效果

### 样式主题
编辑 `public/style.css` 中的CSS变量来改变UI主题：
```css
:root {
    --primary-color: #4ecdc4;    /* 主色调 */
    --accent-color: #feca57;     /* 强调色 */
    --danger-color: #ff6b6b;     /* 危险色 */
    /* ... 其他颜色变量 */
}
```

## 🧪 测试

### 浏览器兼容性测试
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### 性能测试
游戏在以下配置下测试稳定运行：
- 1920x1080 分辨率 60fps
- 同时显示 50+ 游戏对象
- 200+ 粒子特效

## 📊 性能优化

### 已实现的优化
- 对象池复用减少内存分配
- 离屏渲染优化绘制性能
- 智能碰撞检测减少计算量
- 粒子系统生命周期管理

### 进一步优化建议
- 使用OffscreenCanvas进行后台渲染
- 实现LOD（细节层次）系统
- 添加性能监控和自适应质量

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范
- 使用ES6+语法
- 遵循JSDoc注释规范
- 保持函数单一职责
- 使用有意义的变量和函数名

## 📝 更新日志

### v2.0.0 (当前版本)
- 🎉 完全重构为模块化架构
- ✨ 新增粒子特效系统
- 🎵 集成Web Audio API音频系统
- 🎨 全新UI设计和响应式布局
- 🛡️ 增强的道具系统
- 🏆 本地存储高分记录
- 📱 移动设备支持

### v1.0.0
- 🎮 基础游戏功能
- 👾 多种敌机类型
- 🎁 道具系统
- 💯 分数系统

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👏 致谢

- Canvas 2D API 文档和示例
- Web Audio API 社区教程
- 现代JavaScript最佳实践指南

## 📞 联系方式

- 作者：Mango
- GitHub：[@Mango911](https://github.com/Mango911)
- 项目链接：[shooting-game](https://github.com/Mango911/shooting-game)
- 在线演示：[GitHub Pages](https://mango911.github.io/shooting-game/)

---

⭐ 如果这个项目对你有帮助，请给个星星支持一下！ 