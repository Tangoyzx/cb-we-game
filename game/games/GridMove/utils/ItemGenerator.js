import { Entity } from '../../../core/ecs/Entity.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { ItemComponent } from '../components/ItemComponent.js';

/**
 * ItemGenerator 物品生成器
 * 负责在地图上随机生成各种物品
 * 
 * 什么是ItemGenerator？
 * 就像游戏中的"宝箱生成器"！它会在地图的各个地方
 * 随机放置金币、种子等物品，让玩家去探索和收集！
 */
export class ItemGenerator {
  constructor(gridSize, cellSize) {
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    
    // 物品生成配置
    this.config = {
      // 金币生成配置
      coin: {
        count: 8,           // 生成数量
        probability: 0.8,   // 生成概率
        color: '#FFD700',   // 金色
        size: 0.5,          // 相对格子的大小
        shape: 'circle'     // 圆形
      },
      
      // 种子生成配置
      seed: {
        count: 6,           // 生成数量
        probability: 0.7,   // 生成概率
        color: '#8B4513',   // 棕色
        size: 0.4,          // 相对格子的大小
        shape: 'diamond'    // 菱形
      }
    };
    
    // 已占用的网格位置（避免重复生成）
    this.occupiedPositions = new Set();
    
    // 禁止生成的区域（比如玩家起始位置周围）
    this.forbiddenAreas = [];
  }
  
  /**
   * 设置禁止生成的区域
   * @param {Array} areas - 禁止区域数组，每个元素包含 {x, y, radius}
   */
  setForbiddenAreas(areas) {
    this.forbiddenAreas = areas || [];
  }
  
  /**
   * 设置地形组件引用（用于检查可行走区域）
   * @param {TerrainComponent} terrainComponent - 地形组件
   */
  setTerrainComponent(terrainComponent) {
    this.terrainComponent = terrainComponent;
  }
  
  /**
   * 生成所有类型的物品
   * @param {World} world - ECS世界对象
   * @returns {Array} 生成的物品实体数组
   */
  generateAllItems(world) {
    const generatedItems = [];
    
    // 清空已占用位置记录
    this.occupiedPositions.clear();
    
    // 生成金币
    const coins = this.generateItemType('coin', world);
    generatedItems.push(...coins);
    
    // 生成种子
    const seeds = this.generateItemType('seed', world);
    generatedItems.push(...seeds);
    
    console.log(`🎮 物品生成完成: 金币 ${coins.length} 个, 种子 ${seeds.length} 个`);
    return generatedItems;
  }
  
  /**
   * 生成指定类型的物品
   * @param {string} itemType - 物品类型
   * @param {World} world - ECS世界对象
   * @returns {Array} 生成的物品实体数组
   */
  generateItemType(itemType, world) {
    const config = this.config[itemType];
    if (!config) {
      console.warn(`未知的物品类型: ${itemType}`);
      return [];
    }
    
    const items = [];
    const targetCount = config.count;
    let attempts = 0;
    const maxAttempts = targetCount * 10; // 防止无限循环
    
    while (items.length < targetCount && attempts < maxAttempts) {
      attempts++;
      
      // 随机选择一个位置
      const position = this._getRandomValidPosition();
      if (!position) continue;
      
      // 检查概率
      if (Math.random() > config.probability) continue;
      
      // 创建物品实体
      const itemEntity = this._createItemEntity(itemType, position.x, position.y, config);
      if (itemEntity) {
        world.addEntity(itemEntity);
        items.push(itemEntity);
        
        // 标记位置为已占用
        this.occupiedPositions.add(`${position.x},${position.y}`);
        
        console.log(`✨ 生成 ${itemType} 在位置 (${position.x}, ${position.y})`);
      }
    }
    
    if (items.length < targetCount) {
      console.warn(`${itemType} 生成数量不足: 目标 ${targetCount}, 实际 ${items.length}`);
    }
    
    return items;
  }
  
  /**
   * 获取一个随机的有效位置
   * @returns {Object|null} 位置对象 {x, y} 或 null
   */
  _getRandomValidPosition() {
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // 随机生成网格坐标
      const gridX = Math.floor(Math.random() * this.gridSize);
      const gridY = Math.floor(Math.random() * this.gridSize);
      
      // 检查位置是否有效
      if (this._isValidPosition(gridX, gridY)) {
        return { x: gridX, y: gridY };
      }
    }
    
    console.warn('无法找到有效的生成位置');
    return null;
  }
  
  /**
   * 检查位置是否有效
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @returns {boolean} 是否有效
   */
  _isValidPosition(gridX, gridY) {
    // 检查边界
    if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
      return false;
    }
    
    // 检查是否已被占用
    const positionKey = `${gridX},${gridY}`;
    if (this.occupiedPositions.has(positionKey)) {
      return false;
    }
    
    // 检查是否在禁止区域内
    if (this._isInForbiddenArea(gridX, gridY)) {
      return false;
    }
    
    // 检查地形是否可行走（如果有地形组件）
    if (this.terrainComponent && !this.terrainComponent.isWalkable(gridX, gridY)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查位置是否在禁止区域内
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @returns {boolean} 是否在禁止区域
   */
  _isInForbiddenArea(gridX, gridY) {
    for (const area of this.forbiddenAreas) {
      const distance = Math.sqrt(
        Math.pow(gridX - area.x, 2) + Math.pow(gridY - area.y, 2)
      );
      
      if (distance <= area.radius) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 创建物品实体
   * @param {string} itemType - 物品类型
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {Object} config - 物品配置
   * @returns {Entity} 物品实体
   */
  _createItemEntity(itemType, gridX, gridY, config) {
    try {
      // 创建实体
      const entity = new Entity();
      
      // 添加位置组件
      const pixelX = gridX * this.cellSize + this.cellSize / 2;
      const pixelY = gridY * this.cellSize + this.cellSize / 2;
      entity.addComponent(new PositionComponent(pixelX, pixelY));
      
      // 添加物品组件
      const itemComponent = new ItemComponent(itemType, gridX, gridY, {
        color: config.color,
        size: config.size,
        shape: config.shape,
        collectable: true,
        blocking: false
      });
      entity.addComponent(itemComponent);
      
      return entity;
    } catch (error) {
      console.error(`创建物品实体失败: ${itemType}`, error);
      return null;
    }
  }
  
  /**
   * 在指定位置生成单个物品
   * @param {string} itemType - 物品类型
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {World} world - ECS世界对象
   * @returns {Entity|null} 生成的物品实体
   */
  generateItemAt(itemType, gridX, gridY, world) {
    if (!this._isValidPosition(gridX, gridY)) {
      console.warn(`位置 (${gridX}, ${gridY}) 无效，无法生成 ${itemType}`);
      return null;
    }
    
    const config = this.config[itemType];
    if (!config) {
      console.warn(`未知的物品类型: ${itemType}`);
      return null;
    }
    
    const itemEntity = this._createItemEntity(itemType, gridX, gridY, config);
    if (itemEntity) {
      world.addEntity(itemEntity);
      this.occupiedPositions.add(`${gridX},${gridY}`);
      console.log(`✨ 手动生成 ${itemType} 在位置 (${gridX}, ${gridY})`);
    }
    
    return itemEntity;
  }
  
  /**
   * 清除所有已占用位置记录
   */
  clearOccupiedPositions() {
    this.occupiedPositions.clear();
  }
  
  /**
   * 获取生成统计信息
   * @returns {Object} 统计信息
   */
  getGenerationStats() {
    return {
      totalOccupiedPositions: this.occupiedPositions.size,
      forbiddenAreas: this.forbiddenAreas.length,
      config: { ...this.config }
    };
  }
  
  /**
   * 更新物品生成配置
   * @param {string} itemType - 物品类型
   * @param {Object} newConfig - 新配置
   */
  updateItemConfig(itemType, newConfig) {
    if (this.config[itemType]) {
      this.config[itemType] = { ...this.config[itemType], ...newConfig };
      console.log(`更新 ${itemType} 配置:`, this.config[itemType]);
    } else {
      console.warn(`未知的物品类型: ${itemType}`);
    }
  }
}