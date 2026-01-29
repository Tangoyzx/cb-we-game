import { Component } from '../../../core/ecs/Component.js';

/**
 * ItemComponent 物品组件
 * 定义游戏中各种物品的基本属性和状态
 * 
 * 什么是ItemComponent？
 * 就像给每个物品贴一个标签，记录它是什么、在哪里、什么样子！
 * 比如一个金币就有：类型=金币、位置=(5,3)、颜色=金色等信息
 */
export class ItemComponent extends Component {
  constructor(type, gridX, gridY, config = {}) {
    super();
    
    // 物品类型：'coin'(金币), 'seed'(种子), 'block'(阻挡物), 'terrain'(地形物品)
    this.type = type;
    
    // 网格坐标
    this.gridX = gridX;
    this.gridY = gridY;
    
    // 是否已被收集
    this.collected = false;
    
    // 物品配置信息
    this.config = {
      // 显示名称
      name: config.name || this._getDefaultName(type),
      
      // 渲染颜色
      color: config.color || this._getDefaultColor(type),
      
      // 物品大小（相对于格子的比例）
      size: config.size || 0.6,
      
      // 是否可收集
      collectable: config.collectable !== undefined ? config.collectable : this._isDefaultCollectable(type),
      
      // 是否阻挡移动
      blocking: config.blocking !== undefined ? config.blocking : this._isDefaultBlocking(type),
      
      // 渲染形状：'circle'(圆形), 'square'(方形), 'diamond'(菱形)
      shape: config.shape || this._getDefaultShape(type),
      
      // 额外的自定义属性
      ...config
    };
  }
  
  /**
   * 获取默认物品名称
   */
  _getDefaultName(type) {
    const names = {
      'coin': '金币',
      'seed': '种子',
      'block': '石块',
      'terrain': '土块'
    };
    return names[type] || '未知物品';
  }
  
  /**
   * 获取默认物品颜色
   */
  _getDefaultColor(type) {
    const colors = {
      'coin': '#FFD700',    // 金色
      'seed': '#8B4513',    // 棕色
      'block': '#696969',   // 灰色
      'terrain': '#8B4513'  // 棕色
    };
    return colors[type] || '#FFFFFF';
  }
  
  /**
   * 获取默认是否可收集
   */
  _isDefaultCollectable(type) {
    const collectable = {
      'coin': true,
      'seed': true,
      'block': false,
      'terrain': true
    };
    return collectable[type] || false;
  }
  
  /**
   * 获取默认是否阻挡移动
   */
  _isDefaultBlocking(type) {
    const blocking = {
      'coin': false,
      'seed': false,
      'block': true,
      'terrain': false
    };
    return blocking[type] || false;
  }
  
  /**
   * 获取默认渲染形状
   */
  _getDefaultShape(type) {
    const shapes = {
      'coin': 'circle',     // 金币是圆形
      'seed': 'diamond',    // 种子是菱形
      'block': 'square',    // 石块是方形
      'terrain': 'square'   // 土块是方形
    };
    return shapes[type] || 'circle';
  }
  
  /**
   * 检查物品是否可以被收集
   */
  canBeCollected() {
    return !this.collected && this.config.collectable;
  }
  
  /**
   * 检查物品是否会阻挡移动
   */
  isBlocking() {
    return !this.collected && this.config.blocking;
  }
  
  /**
   * 标记物品为已收集
   */
  collect() {
    if (this.canBeCollected()) {
      this.collected = true;
      return true;
    }
    return false;
  }
  
  /**
   * 获取物品在像素坐标系中的位置
   */
  getPixelPosition(cellSize) {
    return {
      x: this.gridX * cellSize + cellSize / 2,
      y: this.gridY * cellSize + cellSize / 2
    };
  }
  
  /**
   * 获取物品的渲染半径
   */
  getRenderRadius(cellSize) {
    return (cellSize * this.config.size) / 2;
  }
}