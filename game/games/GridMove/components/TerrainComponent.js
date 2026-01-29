import { Component } from '../../../core/ecs/Component.js';
import { TERRAIN_TYPES, getTerrainConfig, isTerrainWalkable } from '../utils/TerrainTypes.js';

/**
 * TerrainComponent 地形组件
 * 
 * 这个组件就像一个巨大的地图，记录着每个格子是什么地形
 * 小朋友，想象一下你在画一张藏宝图，每个格子都要标记是水还是陆地！
 */
export class TerrainComponent extends Component {
  /**
   * 构造函数
   * @param {number} gridSize - 网格大小（比如30表示30x30的地图）
   */
  constructor(gridSize) {
    super();
    
    this.gridSize = gridSize;
    
    // 创建二维数组来存储地形数据
    // 就像一个巨大的表格，每个格子都记录着地形类型
    this.terrainMap = [];
    
    // 初始化地形地图 - 默认全部都是陆地
    this._initializeTerrainMap();
    
    console.log(`地形组件初始化完成，地图大小: ${gridSize}x${gridSize}`);
  }
  
  /**
   * 初始化地形地图
   * 创建一个全是陆地的地图作为起始状态
   * @private
   */
  _initializeTerrainMap() {
    for (let x = 0; x < this.gridSize; x++) {
      this.terrainMap[x] = [];
      for (let y = 0; y < this.gridSize; y++) {
        // 默认所有格子都是陆地
        this.terrainMap[x][y] = TERRAIN_TYPES.LAND;
      }
    }
  }
  
  /**
   * 获取指定位置的地形类型
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @returns {number} 地形类型ID
   */
  getTerrainAt(gridX, gridY) {
    // 检查坐标是否在地图范围内
    if (!this._isValidCoordinate(gridX, gridY)) {
      console.warn(`坐标越界: (${gridX}, ${gridY}), 地图大小: ${this.gridSize}x${this.gridSize}`);
      return TERRAIN_TYPES.WATER; // 地图外面默认是水
    }
    
    return this.terrainMap[gridX][gridY];
  }
  
  /**
   * 设置指定位置的地形类型
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {number} terrainType - 地形类型ID
   */
  setTerrainAt(gridX, gridY, terrainType) {
    // 检查坐标是否在地图范围内
    if (!this._isValidCoordinate(gridX, gridY)) {
      console.warn(`无法设置地形，坐标越界: (${gridX}, ${gridY})`);
      return;
    }
    
    // 检查地形类型是否有效
    const config = getTerrainConfig(terrainType);
    if (!config) {
      console.warn(`无效的地形类型: ${terrainType}`);
      return;
    }
    
    this.terrainMap[gridX][gridY] = terrainType;
  }
  
  /**
   * 核心方法：检查指定位置是否可行走
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @returns {boolean} 是否可行走
   */
  isWalkable(gridX, gridY) {
    const terrainType = this.getTerrainAt(gridX, gridY);
    return isTerrainWalkable(terrainType);
  }
  
  /**
   * 获取地形类型的完整配置信息
   * @param {number} terrainType - 地形类型ID
   * @returns {object} 地形配置对象
   */
  getTerrainConfig(terrainType) {
    return getTerrainConfig(terrainType);
  }
  
  /**
   * 预判断移动是否可行
   * 这是一个超级重要的方法！在角色移动前就检查能不能走
   * @param {number} fromGridX - 起始X坐标
   * @param {number} fromGridY - 起始Y坐标
   * @param {number} toGridX - 目标X坐标
   * @param {number} toGridY - 目标Y坐标
   * @returns {boolean} 是否可以移动到目标位置
   */
  canMoveTo(fromGridX, fromGridY, toGridX, toGridY) {
    // 检查目标位置是否在地图范围内
    if (!this._isValidCoordinate(toGridX, toGridY)) {
      return false; // 不能移动到地图外面
    }
    
    // 检查目标位置是否可行走
    if (!this.isWalkable(toGridX, toGridY)) {
      return false; // 不能移动到水里或其他不可行走的地形
    }
    
    // 可以添加更多检查，比如：
    // - 检查路径上是否有障碍物
    // - 检查移动距离是否合理（比如一次只能移动一格）
    
    // 检查移动距离（确保一次只移动一格）
    const deltaX = Math.abs(toGridX - fromGridX);
    const deltaY = Math.abs(toGridY - fromGridY);
    
    // 只允许移动到相邻的格子（上下左右，不包括斜角）
    if ((deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1)) {
      return true;
    }
    
    return false; // 移动距离太远或者是斜角移动
  }
  
  /**
   * 设置整个地形地图
   * 用于从地图生成器接收生成的地图数据
   * @param {number[][]} terrainMap - 二维地形数组
   */
  setTerrainMap(terrainMap) {
    if (!terrainMap || terrainMap.length !== this.gridSize) {
      console.error('无效的地形地图数据');
      return;
    }
    
    // 验证地图数据的完整性
    for (let x = 0; x < this.gridSize; x++) {
      if (!terrainMap[x] || terrainMap[x].length !== this.gridSize) {
        console.error(`地形地图数据不完整，行 ${x}`);
        return;
      }
    }
    
    // 复制地图数据
    this.terrainMap = terrainMap.map(row => [...row]);
    console.log('地形地图更新完成');
  }
  
  /**
   * 获取整个地形地图的副本
   * @returns {number[][]} 地形地图的副本
   */
  getTerrainMap() {
    return this.terrainMap.map(row => [...row]);
  }
  
  /**
   * 检查坐标是否在有效范围内
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @returns {boolean} 坐标是否有效
   * @private
   */
  _isValidCoordinate(gridX, gridY) {
    return gridX >= 0 && gridX < this.gridSize && 
           gridY >= 0 && gridY < this.gridSize;
  }
  
  /**
   * 获取地形统计信息（用于调试和展示）
   * @returns {object} 包含各种地形数量的统计信息
   */
  getTerrainStats() {
    const stats = {};
    
    // 初始化统计数据
    Object.keys(TERRAIN_TYPES).forEach(key => {
      const terrainType = TERRAIN_TYPES[key];
      const config = getTerrainConfig(terrainType);
      stats[config.name] = 0;
    });
    
    // 统计每种地形的数量
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const terrainType = this.terrainMap[x][y];
        const config = getTerrainConfig(terrainType);
        stats[config.name]++;
      }
    }
    
    return stats;
  }
}