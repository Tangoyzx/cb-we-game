# ECS架构说明

## 什么是ECS？

ECS是Entity-Component-System（实体-组件-系统）的缩写，是一种非常适合游戏开发的架构模式。

### 通俗解释

把游戏开发想象成搭积木：

- **Entity（实体）**：一个空盒子，代表游戏中的一个对象
- **Component（组件）**：往盒子里放的"标签"，描述对象的属性
- **System（系统）**：工作人员，负责处理拥有特定标签的盒子

### 举个例子

创建一个会移动的红色圆形：

1. 创建一个实体（空盒子）
2. 给它贴上"位置"标签（告诉它在哪里）
3. 给它贴上"渲染"标签（告诉它长什么样）
4. 给它贴上"移动"标签（告诉它能移动）

然后系统会自动：
- 渲染系统：找到所有有"渲染"标签的实体，把它们画出来
- 移动系统：找到所有有"移动"标签的实体，更新它们的位置

## 核心概念

### Entity（实体）

实体是游戏中的对象，但它本身只是一个ID和组件的集合，不包含任何逻辑。

\`\`\`javascript
const player = world.createEntity();
\`\`\`

### Component（组件）

组件是纯数据的容器，描述实体的某个方面。

\`\`\`javascript
// 位置组件
class PositionComponent extends Component {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
}

// 添加组件到实体
player.addComponent(new PositionComponent(100, 200));
\`\`\`

### System（系统）

系统包含游戏逻辑，处理拥有特定组件的实体。

\`\`\`javascript
// 移动系统
class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = [PositionComponent, MovementComponent];
  }
  
  update(deltaTime, entities) {
    for (const entity of entities) {
      const pos = entity.getComponent(PositionComponent);
      const mov = entity.getComponent(MovementComponent);
      
      // 更新位置
      pos.x += mov.velocityX * deltaTime;
      pos.y += mov.velocityY * deltaTime;
    }
  }
}
\`\`\`

## ECS的优势

### 1. 灵活的组合

传统方式：
\`\`\`
玩家 继承自 移动对象 继承自 游戏对象
敌人 继承自 移动对象 继承自 游戏对象
\`\`\`

ECS方式：
\`\`\`
玩家 = 位置 + 渲染 + 移动 + 输入
敌人 = 位置 + 渲染 + 移动 + AI
障碍物 = 位置 + 渲染
\`\`\`

### 2. 代码复用

同一个组件可以用在不同的实体上：
- 位置组件：玩家用、敌人用、子弹也用
- 移动组件：玩家用、敌人用、NPC也用

### 3. 易于扩展

想添加新功能？只需要：
1. 创建新的组件类型
2. 创建新的系统处理这个组件
3. 把组件添加到需要的实体上

不需要修改已有的代码！

### 4. 性能优化

系统只处理需要的实体，避免不必要的计算。

## 本项目的ECS实现

### 核心类

#### Entity.js
- 管理组件的添加、删除、获取
- 提供唯一ID
- 支持激活/停用

#### Component.js
- 所有组件的基类
- 提供init()和destroy()生命周期方法
- 存储所属实体的ID

#### System.js
- 所有系统的基类
- 定义requiredComponents数组
- 实现update()方法处理实体

#### World.js
- 管理所有实体和系统
- 每帧调用所有系统的update()
- 提供创建/删除实体的方法

### 通用组件

| 组件 | 用途 |
|------|------|
| PositionComponent | 存储位置(x, y) |
| RenderComponent | 定义渲染属性（颜色、大小等） |
| MovementComponent | 存储移动速度和目标 |
| InputComponent | 标记可接收输入事件 |

### 通用系统

| 系统 | 用途 |
|------|------|
| RenderSystem | 绘制所有需要渲染的实体 |
| MovementSystem | 更新所有移动实体的位置 |
| InputSystem | 处理触摸事件并分发给实体 |

## 实战示例

### 创建一个完整的游戏对象

\`\`\`javascript
// 1. 创建世界
const world = new World();

// 2. 注册系统
world.registerSystem(new MovementSystem());
world.registerSystem(new RenderSystem(renderer));

// 3. 创建实体并添加组件
const player = world.createEntity();

player.addComponent(new PositionComponent(100, 100));

player.addComponent(new RenderComponent('circle', {
  radius: 16,
  color: '#FF0000'
}));

player.addComponent(new MovementComponent(200));

// 4. 设置移动目标
const movement = player.getComponent(MovementComponent);
movement.setTarget(300, 300);

// 5. 游戏循环
function gameLoop() {
  // 更新所有系统
  world.update();
  
  // 继续循环
  requestAnimationFrame(gameLoop);
}

gameLoop();
\`\`\`

## 扩展ECS

### 添加自定义组件

\`\`\`javascript
// 创建一个健康值组件
class HealthComponent extends Component {
  constructor(maxHealth) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }
  
  takeDamage(damage) {
    this.currentHealth -= damage;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
  }
  
  heal(amount) {
    this.currentHealth += amount;
    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth;
    }
  }
  
  isDead() {
    return this.currentHealth <= 0;
  }
}
\`\`\`

### 添加自定义系统

\`\`\`javascript
// 创建一个战斗系统
class CombatSystem extends System {
  constructor() {
    super();
    this.requiredComponents = [PositionComponent, HealthComponent];
  }
  
  update(deltaTime, entities) {
    // 检测碰撞和处理伤害
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        if (this.checkCollision(entityA, entityB)) {
          this.handleCollision(entityA, entityB);
        }
      }
    }
    
    // 移除死亡的实体
    for (const entity of entities) {
      const health = entity.getComponent(HealthComponent);
      if (health.isDead()) {
        world.removeEntity(entity);
      }
    }
  }
  
  checkCollision(entityA, entityB) {
    // 碰撞检测逻辑
    return false;
  }
  
  handleCollision(entityA, entityB) {
    // 处理碰撞
  }
}
\`\`\`

## 最佳实践

### 1. 组件只存数据，不写逻辑

❌ 错误：
\`\`\`javascript
class MovementComponent extends Component {
  update(deltaTime) {
    this.x += this.velocityX * deltaTime;  // 不要在组件里写逻辑！
  }
}
\`\`\`

✅ 正确：
\`\`\`javascript
class MovementComponent extends Component {
  constructor() {
    super();
    this.velocityX = 0;
    this.velocityY = 0;  // 只存数据
  }
}
\`\`\`

### 2. 系统只写逻辑，不存数据

❌ 错误：
\`\`\`javascript
class MovementSystem extends System {
  constructor() {
    super();
    this.playerPosition = { x: 0, y: 0 };  // 不要在系统里存数据！
  }
}
\`\`\`

✅ 正确：
\`\`\`javascript
class MovementSystem extends System {
  update(deltaTime, entities) {
    // 从组件读取数据，处理逻辑
    for (const entity of entities) {
      const pos = entity.getComponent(PositionComponent);
      // ...
    }
  }
}
\`\`\`

### 3. 小而专的组件

一个组件只负责一个方面的数据。

❌ 太大：
\`\`\`javascript
class GameObjectComponent {
  x, y, width, height, color, velocityX, velocityY, health, ...
}
\`\`\`

✅ 拆分：
\`\`\`javascript
class PositionComponent { x, y }
class SizeComponent { width, height }
class RenderComponent { color }
class MovementComponent { velocityX, velocityY }
class HealthComponent { health, maxHealth }
\`\`\`

### 4. 系统的更新顺序

注意系统的注册顺序，有些系统需要在其他系统之前或之后执行：

\`\`\`javascript
// 正确的顺序
world.registerSystem(new InputSystem());      // 1. 先处理输入
world.registerSystem(new MovementSystem());   // 2. 然后更新移动
world.registerSystem(new CollisionSystem());  // 3. 检测碰撞
world.registerSystem(new RenderSystem());     // 4. 最后渲染
\`\`\`

## 调试技巧

### 1. 打印实体信息

\`\`\`javascript
console.log('实体组件:', entity.components);
\`\`\`

### 2. 统计实体数量

\`\`\`javascript
console.log('当前实体数:', world.entities.length);
\`\`\`

### 3. 检查系统执行

在系统的update方法中添加日志：

\`\`\`javascript
update(deltaTime, entities) {
  console.log(\`\${this.constructor.name} 处理了 \${entities.length} 个实体\`);
  // ...
}
\`\`\`

## 总结

ECS架构的核心思想：
- **组合优于继承**：通过组合组件来定义实体
- **数据与逻辑分离**：组件存数据，系统写逻辑
- **高度解耦**：各个部分独立，易于维护和扩展

掌握了ECS，你就能轻松构建复杂的游戏系统！🎮
