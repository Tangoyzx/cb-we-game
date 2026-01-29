import { System } from '../../../core/ecs/System.js';
import { TerrainComponent } from '../components/TerrainComponent.js';
import { getTerrainColor, TERRAIN_TYPES } from '../utils/TerrainTypes.js';

/**
 * TerrainSystem 地形系统
 * 
 * 这个系统就像一个专业的画家，负责把地形画到屏幕上！
 * 小朋友，想象一下你在用不同颜色的画笔给地图上色！
 */
export class TerrainSystem extends System {
  /**
   * 构造函数
   * @param {Renderer} renderer - 渲染器
   * @param {number} gridSize - 网格大小
   * @param {number} cellSize - 单元格大小
   */
  constructor(renderer, gridSize, cellSize) {
    super();
    
    this.renderer = renderer;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    
    // 这个系统需要地形组件
    this.requiredComponents = [TerrainComponent];
    
    // 离屏Canvas用于优化渲染性能
    this.offscreenCanvas = null;
    this.offscreenContext = null;
    this.terrainCacheValid = false;
    
    // 初始化离屏Canvas
    this._initOffscreenCanvas();
    
    console.log('地形系统初始化完成');
  }
  
  /**
   * 初始化离屏Canvas
   * 用于预渲染地形，提高性能
   * @private
   */
  _initOffscreenCanvas() {
    try {
      // 在微信小游戏环境中创建离屏Canvas
      if (typeof wx !== 'undefined' && wx.createCanvas) {
        this.offscreenCanvas = wx.createCanvas();
      } else if (typeof document !== 'undefined') {
        // 在浏览器环境中创建离屏Canvas
        this.offscreenCanvas = document.createElement('canvas');
      }
      
      if (this.offscreenCanvas) {
        const worldWidth = this.gridSize * this.cellSize;
        const worldHeight = this.gridSize * this.cellSize;
        
        this.offscreenCanvas.width = worldWidth;
        this.offscreenCanvas.height = worldHeight;
        this.offscreenContext = this.offscreenCanvas.getContext('2d');
        
        console.log(`离屏Canvas创建成功: ${worldWidth}x${worldHeight}`);
      } else {
        console.warn('无法创建离屏Canvas，将使用实时渲染');
      }
    } catch (error) {
      console.warn('离屏Canvas初始化失败:', error);
      this.offscreenCanvas = null;
      this.offscreenContext = null;
    }
  }
  
  /**
   * 更新系统（每帧调用）
   * @param {number} deltaTime - 时间间隔
   * @param {Entity[]} entities - 拥有所需组件的实体列表
   */
  update(deltaTime, entities) {
    // 地形系统主要负责渲染，不需要在update中做太多事情
    // 但我们可以在这里检查地形数据是否发生变化
    
    for (const entity of entities) {
      const terrainComponent = entity.getComponent(TerrainComponent);
      
      // 如果地形数据发生变化，标记缓存无效
      if (terrainComponent && !this.terrainCacheValid) {
        this._prerenderTerrain(terrainComponent);
        this.terrainCacheValid = true;
      }
    }
  }
  
  /**
   * 渲染地形
   * 这个方法会被RenderSystem调用
   * @param {Entity[]} entities - 拥有地形组件的实体列表
   */
  render(entities) {
    for (const entity of entities) {
      const terrainComponent = entity.getComponent(TerrainComponent);
      
      if (terrainComponent) {
        if (this.offscreenCanvas && this.terrainCacheValid) {
          // 使用预渲染的地形
          this._renderCachedTerrain();
        } else {
          // 实时渲染地形
          this._renderTerrainRealtime(terrainComponent);
        }
      }
    }
  }
  
  /**
   * 预渲染地形到离屏Canvas
   * @param {TerrainComponent} terrainComponent - 地形组件
   * @private
   */
  _prerenderTerrain(terrainComponent) {
    if (!this.offscreenContext) {
      return;
    }
    
    console.log('预渲染地形到离屏Canvas...');
    
    // 清空离屏Canvas
    this.offscreenContext.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    
    // 渲染每个地形格子
    for (let gridX = 0; gridX < this.gridSize; gridX++) {
      for (let gridY = 0; gridY < this.gridSize; gridY++) {
        const terrainType = terrainComponent.getTerrainAt(gridX, gridY);
        const color = getTerrainColor(terrainType);
        
        // 计算屏幕坐标
        const screenX = gridX * this.cellSize;
        const screenY = gridY * this.cellSize;
        
        // 绘制地形格子
        this.offscreenContext.fillStyle = color;
        this.offscreenContext.fillRect(screenX, screenY, this.cellSize, this.cellSize);
        
        // 添加细微的边框效果，让格子更清晰
        this._drawTerrainBorder(this.offscreenContext, screenX, screenY, terrainType);
      }
    }
    
    console.log('地形预渲染完成');
  }
  
  /**
   * 渲染缓存的地形
   * @private
   */
  _renderCachedTerrain() {
    if (!this.offscreenCanvas) {
      return;
    }
    
    // 直接将离屏Canvas绘制到主Canvas上
    this.renderer.context.drawImage(this.offscreenCanvas, 0, 0);
  }
  
  /**
   * 实时渲染地形
   * @param {TerrainComponent} terrainComponent - 地形组件
   * @private
   */
  _renderTerrainRealtime(terrainComponent) {
    // 渲染每个地形格子
    for (let gridX = 0; gridX < this.gridSize; gridX++) {
      for (let gridY = 0; gridY < this.gridSize; gridY++) {
        const terrainType = terrainComponent.getTerrainAt(gridX, gridY);
        const color = getTerrainColor(terrainType);
        
        // 计算屏幕坐标（格子的中心点）
        const centerX = gridX * this.cellSize + this.cellSize / 2;
        const centerY = gridY * this.cellSize + this.cellSize / 2;
        
        // 绘制地形格子（使用Renderer的方法）
        this.renderer.drawRect(
          centerX, 
          centerY, 
          this.cellSize, 
          this.cellSize, 
          color
        );
        
        // 添加地形边框效果
        this._drawTerrainBorderWithRenderer(centerX, centerY, terrainType);
      }
    }
  }
  
  /**
   * 绘制地形边框（使用原生Canvas API）
   * @param {CanvasRenderingContext2D} context - Canvas上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} terrainType - 地形类型
   * @private
   */
  _drawTerrainBorder(context, x, y, terrainType) {
    // 根据地形类型选择边框颜色
    let borderColor;
    if (terrainType === TERRAIN_TYPES.WATER) {
      borderColor = '#2E5BBA'; // 深蓝色边框
    } else {
      borderColor = '#6B5B47'; // 深棕色边框
    }
    
    context.strokeStyle = borderColor;
    context.lineWidth = 0.5;
    context.strokeRect(x, y, this.cellSize, this.cellSize);
  }
  
  /**
   * 绘制地形边框（使用Renderer）
   * @param {number} centerX - 中心X坐标
   * @param {number} centerY - 中心Y坐标
   * @param {number} terrainType - 地形类型
   * @private
   */
  _drawTerrainBorderWithRenderer(centerX, centerY, terrainType) {
    // 根据地形类型选择边框颜色
    let borderColor;
    if (terrainType === TERRAIN_TYPES.WATER) {
      borderColor = '#2E5BBA'; // 深蓝色边框
    } else {
      borderColor = '#6B5B47'; // 深棕色边框
    }
    
    this.renderer.drawRectStroke(
      centerX, 
      centerY, 
      this.cellSize, 
      this.cellSize, 
      borderColor, 
      0.5
    );
  }
  
  /**
   * 标记地形缓存无效
   * 当地形数据发生变化时调用
   */
  invalidateTerrainCache() {
    this.terrainCacheValid = false;
    console.log('地形缓存已标记为无效，将在下次渲染时重新生成');
  }
  
  /**
   * 检查指定位置是否可行走
   * 提供给其他系统使用的便捷方法
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {Entity[]} entities - 实体列表
   * @returns {boolean} 是否可行走
   */
  isWalkableAt(gridX, gridY, entities) {
    for (const entity of entities) {
      const terrainComponent = entity.getComponent(TerrainComponent);
      if (terrainComponent) {
        return terrainComponent.isWalkable(gridX, gridY);
      }
    }
    return true; // 如果没有地形组件，默认可行走
  }
  
  /**
   * 获取地形统计信息
   * @param {Entity[]} entities - 实体列表
   * @returns {object|null} 地形统计信息
   */
  getTerrainStats(entities) {
    for (const entity of entities) {
      const terrainComponent = entity.getComponent(TerrainComponent);
      if (terrainComponent) {
        return terrainComponent.getTerrainStats();
      }
    }
    return null;
  }
  
  /**
   * 销毁系统时清理资源
   */
  destroy() {
    if (this.offscreenCanvas) {
      // 清理离屏Canvas
      this.offscreenCanvas = null;
      this.offscreenContext = null;
    }
    
    console.log('地形系统已销毁');
  }
}