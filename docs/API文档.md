# API文档

本文档介绍太阳鸟游戏框架的核心API。

## 目录

- [微信小游戏环境](#微信小游戏环境)
- [ECS核心](#ecs核心)
- [组件](#组件)
- [系统](#系统)
- [管理器](#管理器)

---

## 微信小游戏环境

### 全局对象

在微信小游戏环境中，使用 `GameGlobal` 作为全局对象（不是 `global` 或 `window`）。

#### 设置全局变量

```javascript
GameGlobal.canvas = canvas;
GameGlobal.context = context;
GameGlobal.configManager = configManager;
```

#### 读取全局变量

```javascript
const canvas = GameGlobal.canvas;
const config = GameGlobal.configManager;
```

⚠️ **注意**: 微信小游戏环境不支持 Node.js 的 `global` 对象，请使用 `GameGlobal`。

---

## ECS核心

### Entity（实体）

实体是游戏对象的容器。

#### 创建实体

\`\`\`javascript
const entity = world.createEntity();
\`\`\`

#### 添加组件

\`\`\`javascript
entity.addComponent(new PositionComponent(100, 200));
\`\`\`

#### 获取组件

\`\`\`javascript
const position = entity.getComponent(PositionComponent);
\`\`\`

#### 检查组件

\`\`\`javascript
if (entity.hasComponent(PositionComponent)) {
  // ...
}
\`\`\`

#### 移除组件

\`\`\`javascript
entity.removeComponent(PositionComponent);
\`\`\`

#### 销毁实体

\`\`\`javascript
entity.destroy();
\`\`\`

---

### World（世界）

管理所有实体和系统。

#### 创建世界

\`\`\`javascript
const world = new World();
\`\`\`

#### 创建实体

\`\`\`javascript
const entity = world.createEntity();
\`\`\`

#### 注册系统

\`\`\`javascript
world.registerSystem(new MovementSystem());
\`\`\`

#### 更新世界

\`\`\`javascript
world.update();  // 在游戏循环中调用
\`\`\`

#### 查找实体

\`\`\`javascript
// 通过ID查找
const entity = world.getEntityById(123);

// 查找拥有特定组件的实体
const entities = world.getEntitiesWithComponent(PositionComponent);
\`\`\`

#### 清空世界

\`\`\`javascript
world.clear();  // 移除所有实体和系统
\`\`\`

---

## 组件

### PositionComponent（位置组件）

存储实体的位置。

#### 构造函数

\`\`\`javascript
new PositionComponent(x, y)
\`\`\`

#### 属性

- \`x\`: number - X坐标
- \`y\`: number - Y坐标

#### 方法

\`\`\`javascript
// 设置位置
position.setPosition(100, 200);

// 移动
position.move(10, -5);  // 相对移动
\`\`\`

---

### RenderComponent（渲染组件）

定义实体的渲染属性。

#### 构造函数

\`\`\`javascript
new RenderComponent(type, options)
\`\`\`

#### 参数

- \`type\`: string - 渲染类型
  - \`'rect'\`: 矩形
  - \`'circle'\`: 圆形
  - \`'image'\`: 图片
  - \`'text'\`: 文本

- \`options\`: object - 渲染选项
  - \`color\`: string - 颜色（默认'#FFFFFF'）
  - \`width\`: number - 宽度（矩形）
  - \`height\`: number - 高度（矩形）
  - \`radius\`: number - 半径（圆形）
  - \`image\`: Image - 图片对象
  - \`text\`: string - 文本内容
  - \`fontSize\`: number - 字体大小
  - \`alpha\`: number - 透明度 0-1
  - \`visible\`: boolean - 是否可见
  - \`zIndex\`: number - 层级

#### 示例

\`\`\`javascript
// 矩形
new RenderComponent('rect', {
  width: 50,
  height: 50,
  color: '#FF0000'
});

// 圆形
new RenderComponent('circle', {
  radius: 20,
  color: '#00FF00'
});

// 文本
new RenderComponent('text', {
  text: 'Hello',
  fontSize: 24,
  color: '#FFFFFF'
});
\`\`\`

---

### MovementComponent（移动组件）

存储移动相关的数据。

#### 构造函数

\`\`\`javascript
new MovementComponent(speed)
\`\`\`

#### 属性

- \`speed\`: number - 移动速度（像素/秒）
- \`velocityX\`: number - X方向速度
- \`velocityY\`: number - Y方向速度
- \`targetX\`: number - 目标X坐标
- \`targetY\`: number - 目标Y坐标
- \`moving\`: boolean - 是否正在移动

#### 方法

\`\`\`javascript
// 设置速度
movement.setSpeed(200);

// 设置方向（弧度）
movement.setDirection(Math.PI / 4);

// 设置速度向量
movement.setVelocity(100, 50);

// 设置目标位置
movement.setTarget(300, 400);

// 清除目标
movement.clearTarget();

// 停止移动
movement.stop();
\`\`\`

---

### InputComponent（输入组件）

标记实体可接收输入事件。

#### 构造函数

\`\`\`javascript
new InputComponent(options)
\`\`\`

#### 选项

- \`touchable\`: boolean - 是否可触摸
- \`draggable\`: boolean - 是否可拖拽
- \`onTouchStart\`: Function - 触摸开始回调
- \`onTouchMove\`: Function - 触摸移动回调
- \`onTouchEnd\`: Function - 触摸结束回调

#### 示例

\`\`\`javascript
const input = new InputComponent({
  touchable: true,
  onTouchEnd: (x, y, entity) => {
    console.log('点击了实体', entity.id);
  }
});
\`\`\`

---

## 系统

### RenderSystem（渲染系统）

绘制所有需要渲染的实体。

#### 构造函数

\`\`\`javascript
new RenderSystem(renderer)
\`\`\`

#### 参数

- \`renderer\`: Renderer - 渲染器实例

---

### MovementSystem（移动系统）

更新实体的位置。

#### 构造函数

\`\`\`javascript
new MovementSystem()
\`\`\`

---

### InputSystem（输入系统）

处理触摸事件并分发给实体。

#### 构造函数

\`\`\`javascript
new InputSystem(inputManager)
\`\`\`

#### 参数

- \`inputManager\`: InputManager - 输入管理器实例

---

## 管理器

### GameManager（游戏管理器）

管理所有子游戏的生命周期。

#### 构造函数

\`\`\`javascript
const gameManager = new GameManager(canvas, context);
\`\`\`

#### 注册游戏

\`\`\`javascript
gameManager.registerGame('GameName', GameClass);
\`\`\`

#### 切换游戏

\`\`\`javascript
await gameManager.switchGame('GameName');
\`\`\`

#### 获取所有游戏

\`\`\`javascript
const games = gameManager.getAllGames();
// 返回: [{ name, displayName, preview }, ...]
\`\`\`

---

### Renderer（渲染管理器）

封装Canvas绘图操作。

#### 构造函数

\`\`\`javascript
const renderer = new Renderer(canvas, context);
\`\`\`

#### 方法

\`\`\`javascript
// 清空画布
renderer.clear('#000000');

// 绘制矩形
renderer.drawRect(x, y, width, height, color);

// 绘制矩形边框
renderer.drawRectStroke(x, y, width, height, color, lineWidth);

// 绘制圆形
renderer.drawCircle(x, y, radius, color);

// 绘制圆形边框
renderer.drawCircleStroke(x, y, radius, color, lineWidth);

// 绘制文本
renderer.drawText(text, x, y, color, size, align);

// 绘制图片
renderer.drawImage(image, x, y, width, height);

// 绘制线条
renderer.drawLine(x1, y1, x2, y2, color, lineWidth);

// 保存/恢复绘图状态
renderer.save();
renderer.restore();

// 设置透明度
renderer.setAlpha(0.5);
\`\`\`

---

### InputManager（输入管理器）

处理触摸事件。

#### 构造函数

\`\`\`javascript
const inputManager = new InputManager(canvas);
\`\`\`

#### 属性

- \`touching\`: boolean - 是否正在触摸
- \`touchX\`: number - 当前触摸X坐标
- \`touchY\`: number - 当前触摸Y坐标
- \`deltaX\`: number - 触摸移动X增量
- \`deltaY\`: number - 触摸移动Y增量

#### 回调函数

\`\`\`javascript
// 触摸开始
inputManager.onTouchStart = (x, y) => {
  console.log('触摸开始', x, y);
};

// 触摸移动
inputManager.onTouchMove = (x, y, dx, dy) => {
  console.log('触摸移动', x, y, dx, dy);
};

// 触摸结束
inputManager.onTouchEnd = (x, y) => {
  console.log('触摸结束', x, y);
};
\`\`\`

#### 工具方法

\`\`\`javascript
// 获取触摸偏移
const offset = inputManager.getTouchOffset();
// 返回: { x, y }

// 检查区域是否被触摸
const touched = inputManager.isAreaTouched(x, y, width, height);

// 检查圆形是否被触摸
const touched = inputManager.isCircleTouched(x, y, radius);
\`\`\`

---

### ConfigManager（配置管理器）

管理游戏配置。

#### 构造函数

\`\`\`javascript
const configManager = new ConfigManager();
\`\`\`

#### 加载配置

\`\`\`javascript
await configManager.loadConfig('config/gameConfig.json');
\`\`\`

#### 获取配置

\`\`\`javascript
// 获取整个配置对象
const config = configManager.getConfig('gameConfig');

// 获取特定值（支持路径）
const gridSize = configManager.get('gameConfig', 'grid.size', 40);
//                                  配置名      路径        默认值
\`\`\`

#### 设置配置

\`\`\`javascript
configManager.set('gameConfig', 'grid.size', 50);
\`\`\`

#### 检查配置

\`\`\`javascript
if (configManager.hasConfig('gameConfig')) {
  // 配置存在
}
\`\`\`

---

## 游戏基类接口

每个子游戏需要实现以下接口：

\`\`\`javascript
class MyGame {
  constructor(canvas, context, gameManager) {
    // 初始化
  }
  
  // 静态方法：返回显示名称
  static getDisplayName() {
    return '游戏名称';
  }
  
  // 静态方法：返回预览图
  static getPreviewImage() {
    return 'assets/images/MyGame/preview.png';
  }
  
  // 初始化游戏
  async init() {
    // 初始化逻辑
  }
  
  // 更新游戏逻辑（每帧调用）
  update() {
    // 更新逻辑
  }
  
  // 渲染游戏画面（每帧调用）
  render() {
    // 渲染逻辑
  }
  
  // 释放游戏资源
  release() {
    // 清理逻辑
  }
}
\`\`\`

---

## 完整示例

### 创建一个简单的游戏

\`\`\`javascript
import { World } from './core/ecs/World.js';
import { Renderer } from './core/Renderer.js';
import { InputManager } from './core/InputManager.js';
import { RenderSystem } from './core/systems/RenderSystem.js';
import { MovementSystem } from './core/systems/MovementSystem.js';
import { InputSystem } from './core/systems/InputSystem.js';
import { PositionComponent } from './core/components/PositionComponent.js';
import { RenderComponent } from './core/components/RenderComponent.js';
import { MovementComponent } from './core/components/MovementComponent.js';
import { InputComponent } from './core/components/InputComponent.js';

export class SimpleGame {
  constructor(canvas, context, gameManager) {
    this.canvas = canvas;
    this.context = context;
    this.gameManager = gameManager;
    
    this.world = new World();
    this.renderer = new Renderer(canvas, context);
    this.inputManager = new InputManager(canvas);
  }
  
  static getDisplayName() {
    return '简单游戏';
  }
  
  static getPreviewImage() {
    return null;
  }
  
  async init() {
    // 注册系统
    this.world.registerSystem(new MovementSystem());
    this.world.registerSystem(new InputSystem(this.inputManager));
    this.world.registerSystem(new RenderSystem(this.renderer));
    
    // 创建实体
    const ball = this.world.createEntity();
    
    ball.addComponent(new PositionComponent(
      this.canvas.width / 2,
      this.canvas.height / 2
    ));
    
    ball.addComponent(new RenderComponent('circle', {
      radius: 30,
      color: '#FF6B6B'
    }));
    
    ball.addComponent(new MovementComponent(200));
    
    ball.addComponent(new InputComponent({
      touchable: true,
      draggable: true
    }));
  }
  
  update() {
    this.world.update();
  }
  
  render() {
    this.renderer.clear('#1a1a2e');
  }
  
  release() {
    this.world.destroy();
    this.inputManager.destroy();
  }
}
\`\`\`

---

## 注意事项

1. **组件只存数据**：不要在组件中写游戏逻辑
2. **系统只写逻辑**：不要在系统中存储游戏状态
3. **生命周期**：记得在release()中清理资源
4. **坐标系统**：Canvas的(0,0)在左上角
5. **时间单位**：速度用像素/秒，deltaTime是毫秒

---

## 更多资源

- [ECS架构说明](./ECS架构说明.md)
- [项目README](./README.md)

有问题？欢迎查看源代码或提出Issue！
