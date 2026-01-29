import { World } from '../../core/ecs/World.js';
import { Renderer } from '../../core/Renderer.js';
import { InputManager } from '../../core/InputManager.js';
import { ConfigManager } from '../../core/ConfigManager.js';
import { RenderSystem } from '../../core/systems/RenderSystem.js';
import { MovementSystem } from '../../core/systems/MovementSystem.js';
import { AnimationSystem } from '../../core/systems/AnimationSystem.js';
import { GridSystem } from './systems/GridSystem.js';
import { DragSystem } from './systems/DragSystem.js';
import { TerrainSystem } from './systems/TerrainSystem.js';
import { CollectionSystem } from './systems/CollectionSystem.js';
import { PositionComponent } from '../../core/components/PositionComponent.js';
import { RenderComponent } from '../../core/components/RenderComponent.js';
import { MovementComponent } from '../../core/components/MovementComponent.js';
import { AnimationComponent } from '../../core/components/AnimationComponent.js';
import { GridComponent } from './components/GridComponent.js';
import { PlayerComponent } from './components/PlayerComponent.js';
import { TerrainComponent } from './components/TerrainComponent.js';
import { InventoryComponent } from './components/InventoryComponent.js';
import { UIManager } from './ui/UIManager.js';
import { MapGenerator } from './utils/MapGenerator.js';
import { ItemGenerator } from './utils/ItemGenerator.js';
import { SpriteGenerator } from '../../core/utils/SpriteGenerator.js';
import { ImageLoader } from '../../core/utils/ImageLoader.js';
import { AnimationTester } from '../../core/utils/AnimationTester.js';

/**
 * GridMoveGame 俯视角网格移动游戏
 * 玩家可以通过拖拽控制角色在网格中移动
 * 
 * 🎬 现在支持角色动画系统！角色会根据移动状态播放走路和站立动画！
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
    
    // 🎨 动画系统相关
    this.spriteGenerator = new SpriteGenerator();
    this.imageLoader = new ImageLoader();
    this.characterAnimations = null;
    this.animationSystem = null;
    this.animationTester = new AnimationTester(); // 🧪 动画测试器
    
    // 网格配置
    this.gridSize = 30;  // 30x30网格，更大的探索世界
    this.cellSize = 50;  // 单元格大小50像素（屏幕宽750，可以显示15个格子）
    this.playerSpeed = 250;  // 速度250像素/秒
    
    // 游戏区域配置（网格显示区域）
    this.gameAreaTop = 100;  // 游戏区域距离顶部100像素
    this.gameAreaBottom = 300;  // 游戏区域距离底部300像素（留给UI）
    
    // 摄像机偏移
    this.cameraX = 0;
    this.cameraY = 0;
    
    // UI管理器
    this.uiManager = new UIManager(canvas, this.renderer, this.gameAreaBottom);
    
    // 当前移动方向（用于调试显示）
    this.currentDirection = '无';
    
    // 玩家实体
    this.player = null;
    
    // 地形实体和地图生成器
    this.terrainEntity = null;
    this.mapGenerator = null;
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
    console.log('🎮 网格移动游戏初始化...');
    
    // 加载配置
    this._loadConfig();
    
    // 🎨 生成角色动画（这是新功能！）
    await this._generateCharacterAnimations();
    
    // 注册系统（按正确的顺序）
    this.world.registerSystem(new MovementSystem());
    this.world.registerSystem(new GridSystem(this.gridSize, this.cellSize));
    // 🌊 添加地形系统（在渲染系统之前）
    this.world.registerSystem(new TerrainSystem(this.renderer, this.gridSize, this.cellSize));
    // 🎁 添加收集系统（在地形系统之后）
    this.world.registerSystem(new CollectionSystem(this.gridSize, this.cellSize));
    // 🎬 添加动画系统（在移动系统之后，渲染系统之前）
    this.animationSystem = new AnimationSystem();
    this.world.registerSystem(this.animationSystem);
    // 传递游戏区域偏移信息给DragSystem
    const dragSystem = new DragSystem(this.inputManager, this.gridSize, this.cellSize, this);
    dragSystem.gameAreaTop = this.gameAreaTop;  // 设置游戏区域顶部偏移
    this.world.registerSystem(dragSystem);
    this.world.registerSystem(new RenderSystem(this.renderer, this.cellSize));  // 🎁 传递cellSize以支持物品渲染
    
    // 创建游戏元素
    this._createTerrain();  // 🌊 首先创建地形
    this._createGrid();
    this._createPlayer();
    this._setupUIListener();
    
    // 🧪 运行动画系统测试
    await this._runAnimationTests();
    
    console.log('✅ 网格移动游戏初始化完成！');
  }
  
  /**
   * 加载配置
   * @private
   */
  _loadConfig() {
    // 尝试从配置文件读取
    const config = GameGlobal.configManager || new ConfigManager();
    
    this.gridSize = config.get('gameConfig', 'grid.size', 30);  // 默认值改为30
    this.cellSize = config.get('gameConfig', 'grid.cellSize', 50);  // 默认值改为50
    this.playerSpeed = config.get('gameConfig', 'player.speed', 250);  // 默认值改为250
    
    console.log(`📐 网格配置: ${this.gridSize}x${this.gridSize}, 单元格大小: ${this.cellSize}`);
  }

  /**
   * 生成角色动画
   * 🎨 这是新增的动画功能！
   * @private
   */
  async _generateCharacterAnimations() {
    console.log('🎨 开始生成角色动画...');
    
    try {
      // 使用精灵生成器创建动画帧
      this.characterAnimations = await this.spriteGenerator.generateCharacterAnimations();
      
      console.log('✅ 角色动画生成完成！');
      console.log('📊 动画统计:');
      console.log('  - 站立动画: 4个方向 × 3帧 = 12张图片');
      console.log('  - 走路动画: 4个方向 × 4帧 = 16张图片');
      console.log('  - 总计: 28张动画图片');
      
      return this.characterAnimations;
    } catch (error) {
      console.error('❌ 角色动画生成失败:', error);
      
      // 如果动画生成失败，使用备用方案（保持原来的圆形渲染）
      console.log('🔄 使用备用渲染方案...');
      this.characterAnimations = null;
    }
  }
  
  /**
   * 创建地形系统
   * 🌊 这是新增的地形功能！
   * @private
   */
  _createTerrain() {
    console.log('🌊 开始创建地形系统...');
    
    // 创建地形实体
    this.terrainEntity = this.world.createEntity();
    
    // 创建地形组件
    const terrainComponent = new TerrainComponent(this.gridSize);
    
    // 创建地图生成器（从配置文件读取参数）
    const config = GameGlobal.configManager || new ConfigManager();
    this.mapGenerator = new MapGenerator(this.gridSize, {
      landRatio: config.get('gameConfig', 'terrain.landRatio', 0.65),
      centerRadius: config.get('gameConfig', 'terrain.centerRadius', 0.35),
      edgeWaterRange: config.get('gameConfig', 'terrain.edgeWaterRange', 3),
      maxRetries: config.get('gameConfig', 'terrain.maxRetries', 5)
    });
    
    // 生成随机地图
    console.log('🎲 正在生成随机地图...');
    const terrainMap = this.mapGenerator.generateMap();
    
    // 设置地形数据
    terrainComponent.setTerrainMap(terrainMap);
    
    // 将地形组件添加到实体
    this.terrainEntity.addComponent(terrainComponent);
    
    // 打印地形统计信息
    const stats = terrainComponent.getTerrainStats();
    console.log('🌊 地形统计:', stats);
    
    // 可选：在控制台显示地图（从配置读取是否启用）
    const visualizeInConsole = config.get('gameConfig', 'terrain.visualizeInConsole', true);
    if (visualizeInConsole && console.log) {
      this.mapGenerator.visualizeMap(terrainMap);
    }
    
    console.log('✅ 地形系统创建完成！');
  }
  
  /**
   * 创建网格
   * @private
   */
  _createGrid() {
    // 绘制网格线
    for (let i = 0; i <= this.gridSize; i++) {
      // 垂直线 - 位置要调整，因为矩形是以中心绘制的
      const vLineEntity = this.world.createEntity();
      const x = i * this.cellSize;
      const gridHeight = this.gridSize * this.cellSize;
      vLineEntity.addComponent(new PositionComponent(x, gridHeight / 2));
      vLineEntity.addComponent(new RenderComponent('rect', {
        width: 1,
        height: gridHeight,
        color: '#333333',
        zIndex: 0
      }));
      
      // 水平线 - 位置要调整，因为矩形是以中心绘制的
      const hLineEntity = this.world.createEntity();
      const y = i * this.cellSize;
      const gridWidth = this.gridSize * this.cellSize;
      hLineEntity.addComponent(new PositionComponent(gridWidth / 2, y));
      hLineEntity.addComponent(new RenderComponent('rect', {
        width: gridWidth,
        height: 1,
        color: '#333333',
        zIndex: 0
      }));
    }
  }
  
  /**
   * 创建玩家
   * 🎮 现在会智能地选择一个可行走的位置作为起始点！
   * 🎬 新增：支持角色动画系统！
   * @private
   */
  _createPlayer() {
    this.player = this.world.createEntity();
    
    // 🌊 智能选择起始位置：找到一个可行走的位置
    let startGridX = Math.floor(this.gridSize / 2);
    let startGridY = Math.floor(this.gridSize / 2);
    
    // 获取地形组件
    const terrainComponent = this.terrainEntity?.getComponent(TerrainComponent);
    
    if (terrainComponent) {
      // 如果中心位置不可行走，寻找附近的可行走位置
      if (!terrainComponent.isWalkable(startGridX, startGridY)) {
        console.log('🔍 中心位置不可行走，正在寻找合适的起始位置...');
        
        // 螺旋搜索算法，从中心向外寻找可行走的位置
        let found = false;
        for (let radius = 1; radius < this.gridSize / 2 && !found; radius++) {
          for (let dx = -radius; dx <= radius && !found; dx++) {
            for (let dy = -radius; dy <= radius && !found; dy++) {
              // 只检查螺旋边缘的点
              if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                const testX = startGridX + dx;
                const testY = startGridY + dy;
                
                if (testX >= 0 && testX < this.gridSize && 
                    testY >= 0 && testY < this.gridSize &&
                    terrainComponent.isWalkable(testX, testY)) {
                  startGridX = testX;
                  startGridY = testY;
                  found = true;
                  console.log(`✅ 找到合适的起始位置: (${startGridX}, ${startGridY})`);
                }
              }
            }
          }
        }
        
        if (!found) {
          console.warn('⚠️ 无法找到合适的起始位置，使用默认位置');
        }
      } else {
        console.log(`✅ 中心位置可行走: (${startGridX}, ${startGridY})`);
      }
    }
    
    const startX = startGridX * this.cellSize + this.cellSize / 2;
    const startY = startGridY * this.cellSize + this.cellSize / 2;
    
    // 添加位置组件
    this.player.addComponent(new PositionComponent(startX, startY));
    
    // 🎬 根据是否有动画来设置渲染组件
    if (this.characterAnimations) {
      // 有动画：使用图片渲染，初始设置为透明（动画系统会更新）
      this.player.addComponent(new RenderComponent('image', {
        width: 48,
        height: 48,
        zIndex: 10,
        visible: true
      }));
      
      // 添加动画组件
      const animationComp = new AnimationComponent();
      animationComp.addAnimations(this.characterAnimations);
      animationComp.setDebug(true); // 启用调试模式
      this.player.addComponent(animationComp);
      
      // 设置动画系统处理这个实体
      if (this.animationSystem) {
        this.animationSystem.setupEntityAnimations(this.player, this.characterAnimations);
      }
      
      console.log('🎭 玩家角色动画系统已启用！');
    } else {
      // 没有动画：使用原来的圆形渲染
      this.player.addComponent(new RenderComponent('circle', {
        radius: this.cellSize / 2 - 2,  // 角色半径为单元格的一半减去2像素边距
        color: '#00FF00',  // 绿色
        zIndex: 10
      }));
      
      console.log('🔄 使用备用圆形渲染');
    }
    
    // 添加其他组件
    this.player.addComponent(new MovementComponent(this.playerSpeed));
    
    this.player.addComponent(new GridComponent(
      startGridX,
      startGridY,
      this.gridSize,
      this.cellSize
    ));
    
    this.player.addComponent(new PlayerComponent());
    this.player.addComponent(new InventoryComponent()); // 添加物品栏组件
    
    console.log('👤 玩家角色创建完成！');
    
    // 设置UI管理器的物品栏组件引用
    const inventoryComponent = this.player.getComponent(InventoryComponent);
    this.uiManager.setInventoryComponent(inventoryComponent);
    
    // 玩家创建完成后，初始化物品生成
    this._initializeItemGeneration();
  }

  /**
   * 运行动画系统测试
   * 🧪 这是新增的测试功能！
   * @private
   */
  async _runAnimationTests() {
    console.log('🧪 开始动画系统测试...');
    
    try {
      const testResults = await this.animationTester.runAllTests(this);
      
      if (testResults.success) {
        console.log('🎉 动画系统测试全部通过！');
        
        // 如果测试通过且有动画系统，可以运行手动测试（可选）
        // 注释掉以避免自动播放，需要时可以手动启用
        // setTimeout(() => {
        //   this.animationTester.manualAnimationTest(this);
        // }, 3000);
      } else {
        console.log(`⚠️ 动画系统测试部分失败: ${testResults.failed}/${testResults.total}`);
      }
    } catch (error) {
      console.error('❌ 动画系统测试出错:', error);
    }
  }
  
  /**
   * 设置UI监听
   * @private
   */
  _setupUIListener() {
    // 保存原始的touchEnd回调
    const originalOnTouchEnd = this.inputManager.onTouchEnd;
    
    // 添加自定义的touchEnd处理
    this.inputManager.onTouchEnd = (x, y) => {
      // 先检查UI点击
      const uiResult = this.uiManager.handleClick(x, y);
      
      if (uiResult === 'back') {
        console.log('返回主菜单');
        this.gameManager.switchGame('MainMenu');
        return;
      } else if (uiResult === 'tab') {
        console.log('切换Tab:', this.uiManager.activeTab);
        return;
      } else if (uiResult === 'item') {
        console.log('选中物品');
        return;
      }
      
      // 如果没有点击UI，调用原始回调（DragSystem的回调）
      if (originalOnTouchEnd && typeof originalOnTouchEnd === 'function') {
        originalOnTouchEnd(x, y);
      }
    };
  }
  
  /**
   * 更新游戏逻辑
   */
  update() {
    this.world.update();
    
    // 更新摄像机位置（跟随玩家）
    this._updateCamera();
  }
  
  /**
   * 渲染游戏画面
   */
  render() {
    // 清空画布
    this.renderer.clear('#0a0a0a');
    
    // 计算游戏区域的尺寸
    const gameAreaWidth = this.canvas.width;
    const gameAreaHeight = this.canvas.height - this.gameAreaTop - this.gameAreaBottom;
    
    // 保存当前状态
    this.renderer.save();
    
    // 设置裁剪区域（只在游戏区域内显示）
    this.renderer.context.beginPath();
    this.renderer.context.rect(0, this.gameAreaTop, gameAreaWidth, gameAreaHeight);
    this.renderer.context.clip();
    
    // 应用游戏区域偏移和摄像机偏移
    this.renderer.context.translate(0, this.gameAreaTop);
    this.renderer.context.translate(-this.cameraX, -this.cameraY);
    
    // 渲染世界中的所有实体
    this.world.render();
    
    this.renderer.restore();
    
    // 绘制游戏区域边框（可选，用于调试）
    this.renderer.context.strokeStyle = '#333333';
    this.renderer.context.lineWidth = 2;
    this.renderer.context.strokeRect(0, this.gameAreaTop, gameAreaWidth, gameAreaHeight);
    
    // 绘制拖拽线（在屏幕坐标系中，但需要考虑游戏区域偏移）
    const dragSystem = this.world.systems.find(s => s instanceof DragSystem);
    if (dragSystem && dragSystem.showDragLine) {
      this.renderer.drawLine(
        dragSystem.dragStartX,
        dragSystem.dragStartY,
        dragSystem.currentTouchX,
        dragSystem.currentTouchY,
        '#FFD700',
        3
      );
    }
    
    // 绘制UI（不受摄像机影响）
    this._renderUI();
  }
  
  /**
   * 渲染UI
   * @private
   */
  _renderUI() {
    // 获取角色网格信息
    let gridInfo = {
      gridX: '-',
      gridY: '-',
      x: '-',
      y: '-',
      direction: this.currentDirection,
      moving: false,
      animation: '无动画' // 🎬 新增动画信息
    };
    
    if (this.player) {
      const gridComp = this.player.getComponent(GridComponent);
      const posComp = this.player.getComponent(PositionComponent);
      const moveComp = this.player.getComponent(MovementComponent);
      const animComp = this.player.getComponent(AnimationComponent); // 🎬 获取动画组件
      
      if (gridComp && posComp && moveComp) {
        gridInfo = {
          gridX: gridComp.gridX,
          gridY: gridComp.gridY,
          x: Math.round(posComp.x),
          y: Math.round(posComp.y),
          direction: this.currentDirection,
          moving: moveComp.moving,
          animation: '圆形渲染' // 默认值
        };
        
        // 🎬 如果有动画组件，显示动画信息
        if (animComp) {
          const animInfo = animComp.getAnimationInfo();
          if (animInfo) {
            gridInfo.animation = `${animInfo.name}-${animInfo.direction} (${animInfo.currentFrame + 1}/${animInfo.totalFrames})`;
          } else {
            gridInfo.animation = '动画未播放';
          }
        }
      }
    }
    
    // 使用UIManager渲染所有UI
    this.uiManager.render(gridInfo);
  }
  
  /**
   * 更新摄像机位置
   * @private
   */
  _updateCamera() {
    if (!this.player) return;
    
    const position = this.player.getComponent(PositionComponent);
    if (!position) return;
    
    // 计算游戏区域的尺寸（扣除顶部和底部的UI空间）
    const gameAreaWidth = this.canvas.width;
    const gameAreaHeight = this.canvas.height - this.gameAreaTop - this.gameAreaBottom;
    
    // 计算游戏区域的中心
    const screenCenterX = gameAreaWidth / 2;
    const screenCenterY = gameAreaHeight / 2;
    
    // 计算世界边界
    const worldWidth = this.gridSize * this.cellSize;
    const worldHeight = this.gridSize * this.cellSize;
    
    // 目标摄像机位置（让玩家在游戏区域居中）
    let targetCameraX = position.x - screenCenterX;
    let targetCameraY = position.y - screenCenterY;
    
    // 限制摄像机不超出世界边界
    targetCameraX = Math.max(0, Math.min(targetCameraX, worldWidth - gameAreaWidth));
    targetCameraY = Math.max(0, Math.min(targetCameraY, worldHeight - gameAreaHeight));
    
    // 如果世界比游戏区域小，摄像机居中世界
    if (worldWidth < gameAreaWidth) {
      targetCameraX = (worldWidth - gameAreaWidth) / 2;
    }
    if (worldHeight < gameAreaHeight) {
      targetCameraY = (worldHeight - gameAreaHeight) / 2;
    }
    
    // 平滑移动摄像机（可选，让摄像机移动更流畅）
    this.cameraX = targetCameraX;
    this.cameraY = targetCameraY;
  }
  
  /**
   * 初始化物品生成系统
   */
  _initializeItemGeneration() {
    console.log('🎁 开始初始化物品生成系统...');
    
    // 创建物品生成器
    this.itemGenerator = new ItemGenerator(this.gridSize, this.cellSize);
    
    // 设置地形组件引用，确保物品只生成在可行走区域
    const terrainComponent = this.terrainEntity?.getComponent(TerrainComponent);
    if (terrainComponent) {
      this.itemGenerator.setTerrainComponent(terrainComponent);
    }
    
    // 设置禁止生成区域（玩家起始位置周围3格范围内）
    const playerGrid = this.player.getComponent(GridComponent);
    if (playerGrid) {
      this.itemGenerator.setForbiddenAreas([
        {
          x: playerGrid.gridX,
          y: playerGrid.gridY,
          radius: 3  // 3格半径内不生成物品
        }
      ]);
    }
    
    // 生成所有物品
    const generatedItems = this.itemGenerator.generateAllItems(this.world);
    
    console.log(`🎁 物品生成完成！总共生成了 ${generatedItems.length} 个物品`);
    console.log('🪙 金币和种子已散布在地图各处，快去收集吧！');
    
    // 输出生成统计
    const stats = this.itemGenerator.getGenerationStats();
    console.log('📊 生成统计:', stats);
  }

  /**
   * 释放游戏资源
   */
  release() {
    console.log('🗑️ 网格移动游戏释放资源...');
    
    // 清理动画资源
    if (this.imageLoader) {
      this.imageLoader.destroy();
    }
    
    if (this.spriteGenerator) {
      this.spriteGenerator = null;
    }
    
    this.characterAnimations = null;
    this.animationSystem = null;
    
    // 清理ECS世界和输入管理器
    this.world.destroy();
    this.inputManager.destroy();
    
    console.log('✅ 资源释放完成');
  }
}
