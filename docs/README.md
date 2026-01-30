# 太阳鸟游戏 - 微信小游戏合集

一个基于ECS架构的微信小游戏框架，支持多个子游戏的开发和管理。

## 项目简介

太阳鸟游戏是一个微信小游戏平台，包含：
- 🎮 **主菜单界面**：展示"太阳鸟游戏"标题，提供子游戏选择功能
- 🕹️ **网格移动游戏**：俯视角网格游戏，支持拖拽控制角色移动
- 🏗️ **ECS架构框架**：易于扩展的游戏架构，方便添加更多子游戏

## 技术特点

- **ECS架构**：Entity-Component-System设计模式，代码解耦，易于维护
- **模块化设计**：每个子游戏独立文件夹，互不干扰
- **通用组件系统**：核心组件和系统可复用，子游戏可自定义扩展
- **配置驱动**：游戏参数通过JSON配置文件管理
- **触摸控制**：完善的触摸事件处理系统
- **🎬 角色动画系统**：支持多帧精灵动画，状态驱动的动画切换

## 目录结构

\`\`\`
game/
├── game.js                 # 游戏入口
├── game.json              # 微信小游戏配置
├── project.config.json    # 项目配置
├── core/                  # 核心框架
│   ├── ecs/              # ECS框架核心
│   ├── components/       # 通用组件
│   │   └── AnimationComponent.js  # 🎬 动画组件
│   ├── systems/          # 通用系统
│   │   └── AnimationSystem.js     # 🎬 动画系统
│   ├── utils/            # 工具类
│   │   ├── SpriteGenerator.js     # 🎨 精灵图生成器
│   │   ├── ImageLoader.js         # 🖼️ 图片加载器
│   │   └── AnimationTester.js     # 🧪 动画测试器
│   ├── GameManager.js    # 游戏管理器
│   ├── Renderer.js       # 渲染管理器
│   ├── InputManager.js   # 输入管理器
│   └── ConfigManager.js  # 配置管理器
├── games/                # 子游戏
│   ├── MainMenu/         # 主菜单游戏
│   └── GridMove/         # 网格移动游戏
├── config/               # 配置文件
├── assets/               # 资源文件
└── docs/                 # 文档
\`\`\`

## 快速开始

### 1. 环境准备

- 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 克隆或下载本项目

### 2. 打开项目

1. 启动微信开发者工具
2. 选择"小游戏"项目类型
3. 导入项目，选择 \`game\` 文件夹
4. 使用测试号或自己的AppID

### 3. 运行游戏

- 点击"编译"按钮即可运行
- 在模拟器中查看效果

## 游戏操作

### 主菜单
- 点击游戏按钮进入对应的子游戏
- 支持翻页浏览更多游戏（当游戏数量超过3个时）

### 网格移动游戏
- **拖拽手指**：控制角色移动方向
- 拖拽时会显示一条金色的方向线，帮助你看清楚方向
- 角色会沿着拖拽方向连续移动
- 摄像机会跟随角色移动，让角色始终在屏幕中心（除非到达边缘）
- 最终会自动对齐到网格点上
- 点击左上角的"返回"按钮回到主菜单

## 添加新游戏

### 步骤1：创建游戏文件夹

在 \`games/\` 目录下创建新游戏的文件夹，例如 \`MyGame/\`

### 步骤2：创建游戏主类

\`\`\`javascript
// games/MyGame/MyGame.js
export class MyGame {
  constructor(canvas, context, gameManager) {
    this.canvas = canvas;
    this.context = context;
    this.gameManager = gameManager;
  }
  
  // 静态方法：返回游戏显示名称
  static getDisplayName() {
    return '我的游戏';
  }
  
  // 静态方法：返回预览图路径
  static getPreviewImage() {
    return 'assets/images/MyGame/preview.png';
  }
  
  // 初始化游戏
  async init() {
    // 初始化代码
  }
  
  // 更新游戏逻辑
  update() {
    // 更新代码
  }
  
  // 渲染游戏画面
  render() {
    // 渲染代码
  }
  
  // 释放资源
  release() {
    // 清理代码
  }
}
\`\`\`

### 步骤3：注册游戏

在 \`game.js\` 中注册新游戏：

\`\`\`javascript
import { MyGame } from './games/MyGame/MyGame.js';

// 在init函数中注册
gameManager.registerGame('MyGame', MyGame);
\`\`\`

## 配置说明

### gameConfig.js

游戏参数配置(使用 JavaScript 格式):

\`\`\`javascript
const gameConfig = {
  screen: {
    width: 750,
    height: 1334
  },
  grid: {
    size: 40,          // 网格大小
    cellSize: 18       // 单元格像素大小
  },
  player: {
    speed: 200         // 玩家移动速度(毫秒)
  }
};

module.exports = gameConfig;
\`\`\`

### resourceConfig.js

资源文件配置(使用 JavaScript 格式):

\`\`\`javascript
const resourceConfig = {
  images: {
    myGame: {
      sprite: "assets/images/MyGame/sprite.png"
    }
  }
};

module.exports = resourceConfig;
\`\`\`

**为什么使用 .js 而不是 .json?**
- 微信小游戏中读取 JSON 文件可能会有兼容性问题
- JavaScript 格式使用 \`require\` 直接导入,更快更稳定
- 可以在配置文件中添加注释,更易维护

## ECS架构说明

详见 [ECS架构说明文档](./ECS架构说明.md)

## API文档

详见 [API文档](./API文档.md)

## 开发建议

1. **保持核心稳定**：不要轻易修改 \`core/\` 中的通用组件和系统
2. **游戏独立开发**：每个游戏在自己的文件夹中实现特有功能
3. **配置驱动**：尽量使用配置文件管理参数，避免硬编码
4. **及时更新文档**：添加新功能后更新相关文档

## 常见问题

### Q: 真机上一片空白，开发工具正常？
A: 这可能是代码压缩导致的类名问题。确保使用**类引用**而不是**类名字符串**作为Map的key：

```javascript
// ❌ 错误：使用类名字符串（真机压缩后会变）
this.components.set(component.constructor.name, component);
this.components.get(ComponentClass.name);

// ✅ 正确：使用类引用本身（不受压缩影响）
this.components.set(component.constructor, component);
this.components.get(ComponentClass);
```

**原因**: 微信小游戏真机环境会压缩代码，类名会变成单字母（如`a`、`b`），导致用字符串查找失败。

### Q: 配置文件加载失败？
A: 微信小游戏只支持ES6模块语法，不支持Node.js的`require`/`module.exports`：

```javascript
// ❌ 错误：Node.js语法（微信小游戏不支持）
const config = require('./config.js');
module.exports = config;

// ✅ 正确：ES6模块语法
import config from './config.js';
export default config;
```

### Q: 主界面一片空白怎么办？
A: 确保在每个游戏的 `render()` 方法中调用了 `world.render()`：

```javascript
render() {
  // 1. 清空画布
  this.renderer.clear('#1a1a2e');
  
  // 2. 调用世界渲染（这一步很重要！）
  this.world.render();
}
```

### Q: 微信小游戏报错 "global is not defined"？
A: 微信小游戏环境不支持 `global` 对象，应该使用 `GameGlobal`：

```javascript
// 错误写法
global.canvas = canvas;

// 正确写法
GameGlobal.canvas = canvas;
```

### Q: 如何修改网格大小？
A: 编辑 `config/gameConfig.js` 中的 `grid.size` 和 `grid.cellSize` 参数。

### Q: 如何添加图片资源？
A: 将图片放入 `assets/images/` 对应游戏的文件夹，然后在 `resourceConfig.js` 中配置路径。

### Q: 如何调试？
A: 在微信开发者工具中打开"调试器"，可以查看 console.log 输出和错误信息。

## 更新日志

详细的更新日志请查看 [CHANGELOG.md](./CHANGELOG.md)

## 后续计划

- [ ] 添加音效系统
- [ ] 添加更多示例游戏
- [ ] 完善资源加载管理
- [ ] 添加游戏数据存储
- [ ] 优化性能和渲染

## 贡献

欢迎提交问题和改进建议！

## 许可

MIT License
