import { World } from '../../core/ecs/World.js';
import { Renderer } from '../../core/Renderer.js';
import { InputManager } from '../../core/InputManager.js';
import { ConfigManager } from '../../core/ConfigManager.js';
import { RenderSystem } from '../../core/systems/RenderSystem.js';
import { MovementSystem } from '../../core/systems/MovementSystem.js';
import { GridSystem } from './systems/GridSystem.js';
import { DragSystem } from './systems/DragSystem.js';
import { PositionComponent } from '../../core/components/PositionComponent.js';
import { RenderComponent } from '../../core/components/RenderComponent.js';
import { MovementComponent } from '../../core/components/MovementComponent.js';
import { GridComponent } from './components/GridComponent.js';
import { PlayerComponent } from './components/PlayerComponent.js';

/**
 * GridMoveGame 俯视角网格移动游戏
 * 玩家可以通过拖拽控制角色在网格中移动
 * 
 * 这是第一个实际的小游戏！
 */
export class GridMoveGame {
  constructor(canvas, context, gameManager) {
    this.canvas = canvas;
    this.context = context;
    this.gameManager = gameManager;
    
    // 创建ECS世界
    this.world = new World();
    
    // 创建渲染器和输入管理器
    this.renderer = new Renderer(canvas, context);
    this.inputManager = new InputManager(canvas);
    
    // 配置管理器
    this.configManager = new ConfigManager();
    
    // 网格配置
    this.gridSize = 40;
    this.cellSize = 18;
    this.playerSpeed = 200;
    
    // 玩家实体
    this.player = null;
  }
  
  /**
   * 获取游戏显示名称（静态方法）
   */
  static getDisplayName() {
    return '网格移动';
  }
  
  /**
   * 获取游戏预览图（静态方法）
   */
  static getPreviewImage() {
    return 'assets/images/GridMove/preview.png';
  }
  
  /**
   * 初始化游戏
   */
  async init() {
    console.log('网格移动游戏初始化...');
    
    // 加载配置
    this._loadConfig();
    
    // 注册系统
    this.world.registerSystem(new MovementSystem());
    this.world.registerSystem(new GridSystem(this.gridSize, this.cellSize));
    this.world.registerSystem(new DragSystem(this.inputManager, this.gridSize, this.cellSize));
    this.world.registerSystem(new RenderSystem(this.renderer));
    
    // 创建游戏元素
    this._createGrid();
    this._createPlayer();
    this._createBackButton();
    
    console.log('网格移动游戏初始化完成');
  }
  
  /**
   * 加载配置
   * @private
   */
  _loadConfig() {
    // 尝试从配置文件读取
    const config = global.configManager || new ConfigManager();
    
    this.gridSize = config.get('gameConfig', 'grid.size', 40);
    this.cellSize = config.get('gameConfig', 'grid.cellSize', 18);
    this.playerSpeed = config.get('gameConfig', 'player.speed', 200);
    
    console.log(`网格配置: ${this.gridSize}x${this.gridSize}, 单元格大小: ${this.cellSize}`);
  }
  
  /**
   * 创建网格
   * @private
   */
  _createGrid() {
    // 绘制网格线
    for (let i = 0; i <= this.gridSize; i++) {
      // 垂直线
      const vLineEntity = this.world.createEntity();
      const x = i * this.cellSize;
      vLineEntity.addComponent(new PositionComponent(x, 0));
      vLineEntity.addComponent(new RenderComponent('rect', {
        width: 1,
        height: this.gridSize * this.cellSize,
        color: '#333333',
        zIndex: 0
      }));
      
      // 水平线
      const hLineEntity = this.world.createEntity();
      const y = i * this.cellSize;
      hLineEntity.addComponent(new PositionComponent(0, y));
      hLineEntity.addComponent(new RenderComponent('rect', {
        width: this.gridSize * this.cellSize,
        height: 1,
        color: '#333333',
        zIndex: 0
      }));
    }
  }
  
  /**
   * 创建玩家
   * @private
   */
  _createPlayer() {
    this.player = this.world.createEntity();
    
    // 初始位置在网格中心
    const startGridX = Math.floor(this.gridSize / 2);
    const startGridY = Math.floor(this.gridSize / 2);
    const startX = startGridX * this.cellSize + this.cellSize / 2;
    const startY = startGridY * this.cellSize + this.cellSize / 2;
    
    this.player.addComponent(new PositionComponent(startX, startY));
    
    this.player.addComponent(new RenderComponent('circle', {
      radius: 8,
      color: '#FF6B6B',
      zIndex: 10
    }));
    
    this.player.addComponent(new MovementComponent(this.playerSpeed));
    
    this.player.addComponent(new GridComponent(
      startGridX,
      startGridY,
      this.gridSize,
      this.cellSize
    ));
    
    this.player.addComponent(new PlayerComponent());
  }
  
  /**
   * 创建返回按钮
   * @private
   */
  _createBackButton() {
    const buttonEntity = this.world.createEntity();
    
    buttonEntity.addComponent(new PositionComponent(60, 30));
    
    buttonEntity.addComponent(new RenderComponent('rect', {
      width: 100,
      height: 40,
      color: '#4CAF50',
      zIndex: 20
    }));
    
    // 按钮文本
    const textEntity = this.world.createEntity();
    textEntity.addComponent(new PositionComponent(60, 30));
    textEntity.addComponent(new RenderComponent('text', {
      text: '返回',
      fontSize: 20,
      color: '#FFFFFF',
      textAlign: 'center',
      zIndex: 21
    }));
    
    // 添加输入组件（使用核心的InputComponent）
    const InputComponent = require('../../core/components/InputComponent.js').InputComponent;
    buttonEntity.addComponent(new InputComponent({ touchable: true }));
    
    const input = buttonEntity.getComponent(InputComponent);
    input.onTouchEnd = () => {
      console.log('返回主菜单');
      this.gameManager.switchGame('MainMenu');
    };
  }
  
  /**
   * 更新游戏逻辑
   */
  update() {
    this.world.update();
  }
  
  /**
   * 渲染游戏画面
   */
  render() {
    // 清空画布
    this.renderer.clear('#0a0a0a');
  }
  
  /**
   * 释放游戏资源
   */
  release() {
    console.log('网格移动游戏释放资源...');
    this.world.destroy();
    this.inputManager.destroy();
  }
}
