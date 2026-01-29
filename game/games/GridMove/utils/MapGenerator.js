import { TERRAIN_TYPES } from './TerrainTypes.js';

/**
 * MapGenerator 地图生成器
 * 
 * 这个类就像一个魔法师，能够创造出美丽的岛屿地图！
 * 小朋友，想象一下你在用画笔画一个圆形的岛屿，周围都是蓝蓝的海水！
 */
export class MapGenerator {
  /**
   * 构造函数
   * @param {number} gridSize - 网格大小
   * @param {object} config - 生成配置
   */
  constructor(gridSize, config = {}) {
    this.gridSize = gridSize;
    
    // 默认配置
    this.config = {
      landRatio: 0.6,           // 陆地比例（60%的格子是陆地）
      centerRadius: 0.3,        // 中心陆地半径（相对于地图大小）
      edgeWaterRange: 3,        // 边缘水域范围（2-5格）
      maxRetries: 5,            // 最大重试次数
      randomSeed: Date.now(),   // 随机种子
      ...config
    };
    
    console.log('地图生成器初始化完成', this.config);
  }
  
  /**
   * 生成随机地图
   * 这是主要的魔法方法！
   * @returns {number[][]} 生成的地形地图
   */
  generateMap() {
    console.log('开始生成随机地图...');
    
    let attempts = 0;
    let terrainMap = null;
    
    // 尝试生成地图，直到成功或达到最大重试次数
    while (attempts < this.config.maxRetries) {
      attempts++;
      console.log(`地图生成尝试 ${attempts}/${this.config.maxRetries}`);
      
      // 创建基础地图
      terrainMap = this._createBaseMap();
      
      // 从中心扩展陆地
      terrainMap = this._expandFromCenter(terrainMap);
      
      // 添加边缘水域
      terrainMap = this._addEdgeWater(terrainMap);
      
      // 检查连通性
      if (this._isConnected(terrainMap)) {
        console.log('地图生成成功！');
        break;
      } else {
        console.log('地图不连通，重新生成...');
        terrainMap = null;
      }
    }
    
    // 如果所有尝试都失败了，生成一个简单的默认地图
    if (!terrainMap) {
      console.warn('无法生成连通地图，使用默认地图');
      terrainMap = this._createDefaultMap();
    }
    
    // 打印地图统计信息
    this._printMapStats(terrainMap);
    
    return terrainMap;
  }
  
  /**
   * 创建基础地图（全部是水）
   * @returns {number[][]} 基础地图
   * @private
   */
  _createBaseMap() {
    const map = [];
    for (let x = 0; x < this.gridSize; x++) {
      map[x] = [];
      for (let y = 0; y < this.gridSize; y++) {
        map[x][y] = TERRAIN_TYPES.WATER; // 开始时全部是水
      }
    }
    return map;
  }
  
  /**
   * 从中心向外扩展陆地
   * 创建一个大致圆形的陆地区域
   * @param {number[][]} terrainMap - 地形地图
   * @returns {number[][]} 更新后的地图
   * @private
   */
  _expandFromCenter(terrainMap) {
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);
    const maxRadius = this.gridSize * this.config.centerRadius;
    
    console.log(`从中心 (${centerX}, ${centerY}) 扩展陆地，最大半径: ${maxRadius}`);
    
    // 计算需要的陆地格子数量
    const totalCells = this.gridSize * this.gridSize;
    const targetLandCells = Math.floor(totalCells * this.config.landRatio);
    let currentLandCells = 0;
    
    // 创建一个距离权重数组，越靠近中心权重越高
    const weights = [];
    for (let x = 0; x < this.gridSize; x++) {
      weights[x] = [];
      for (let y = 0; y < this.gridSize; y++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        // 使用反比例函数，距离越近权重越高
        weights[x][y] = Math.max(0, maxRadius - distance);
      }
    }
    
    // 按权重排序所有格子
    const cells = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (weights[x][y] > 0) {
          cells.push({ x, y, weight: weights[x][y] });
        }
      }
    }
    
    // 按权重降序排序
    cells.sort((a, b) => b.weight - a.weight);
    
    // 选择前N个格子作为陆地，添加一些随机性
    for (let i = 0; i < cells.length && currentLandCells < targetLandCells; i++) {
      const cell = cells[i];
      
      // 添加随机性：权重越高的格子被选中的概率越大
      const probability = Math.min(1, cell.weight / maxRadius + 0.3);
      if (Math.random() < probability) {
        terrainMap[cell.x][cell.y] = TERRAIN_TYPES.LAND;
        currentLandCells++;
      }
    }
    
    console.log(`生成了 ${currentLandCells} 个陆地格子`);
    return terrainMap;
  }
  
  /**
   * 添加边缘水域
   * 确保地图边缘有足够的水域
   * @param {number[][]} terrainMap - 地形地图
   * @returns {number[][]} 更新后的地图
   * @private
   */
  _addEdgeWater(terrainMap) {
    const edgeRange = this.config.edgeWaterRange;
    
    console.log(`添加边缘水域，范围: ${edgeRange} 格`);
    
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        // 检查是否在边缘范围内
        const distanceToEdge = Math.min(x, y, this.gridSize - 1 - x, this.gridSize - 1 - y);
        
        if (distanceToEdge < edgeRange) {
          // 在边缘范围内，有一定概率变成水
          const probability = 1 - (distanceToEdge / edgeRange); // 越靠近边缘概率越高
          if (Math.random() < probability * 0.8) { // 80%的基础概率
            terrainMap[x][y] = TERRAIN_TYPES.WATER;
          }
        }
      }
    }
    
    return terrainMap;
  }
  
  /**
   * 检查地图连通性
   * 使用洪水填充算法检查所有陆地是否相连
   * @param {number[][]} terrainMap - 地形地图
   * @returns {boolean} 是否连通
   * @private
   */
  _isConnected(terrainMap) {
    // 找到第一个陆地格子作为起点
    let startX = -1, startY = -1;
    
    for (let x = 0; x < this.gridSize && startX === -1; x++) {
      for (let y = 0; y < this.gridSize && startY === -1; y++) {
        if (terrainMap[x][y] === TERRAIN_TYPES.LAND) {
          startX = x;
          startY = y;
        }
      }
    }
    
    // 如果没有陆地，认为是连通的（虽然这种情况不太可能）
    if (startX === -1) {
      return true;
    }
    
    // 使用BFS（广度优先搜索）检查连通性
    const visited = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
    const queue = [{ x: startX, y: startY }];
    visited[startX][startY] = true;
    let visitedLandCount = 1;
    
    // 四个方向：上、下、左、右
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 }   // 右
    ];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      // 检查四个方向的相邻格子
      for (const dir of directions) {
        const newX = current.x + dir.dx;
        const newY = current.y + dir.dy;
        
        // 检查边界
        if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
          // 如果是未访问的陆地
          if (!visited[newX][newY] && terrainMap[newX][newY] === TERRAIN_TYPES.LAND) {
            visited[newX][newY] = true;
            queue.push({ x: newX, y: newY });
            visitedLandCount++;
          }
        }
      }
    }
    
    // 计算总陆地数量
    let totalLandCount = 0;
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (terrainMap[x][y] === TERRAIN_TYPES.LAND) {
          totalLandCount++;
        }
      }
    }
    
    console.log(`连通性检查: 访问了 ${visitedLandCount}/${totalLandCount} 个陆地格子`);
    
    // 如果访问的陆地数量等于总陆地数量，说明全部连通
    return visitedLandCount === totalLandCount;
  }
  
  /**
   * 创建默认地图（简单的圆形岛屿）
   * 当随机生成失败时使用
   * @returns {number[][]} 默认地图
   * @private
   */
  _createDefaultMap() {
    console.log('创建默认圆形岛屿地图');
    
    const map = this._createBaseMap();
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);
    const radius = Math.floor(this.gridSize * 0.35); // 35%半径的圆形岛屿
    
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          map[x][y] = TERRAIN_TYPES.LAND;
        }
      }
    }
    
    return map;
  }
  
  /**
   * 打印地图统计信息
   * @param {number[][]} terrainMap - 地形地图
   * @private
   */
  _printMapStats(terrainMap) {
    let landCount = 0;
    let waterCount = 0;
    
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (terrainMap[x][y] === TERRAIN_TYPES.LAND) {
          landCount++;
        } else {
          waterCount++;
        }
      }
    }
    
    const totalCells = this.gridSize * this.gridSize;
    const landPercentage = ((landCount / totalCells) * 100).toFixed(1);
    const waterPercentage = ((waterCount / totalCells) * 100).toFixed(1);
    
    console.log('=== 地图生成统计 ===');
    console.log(`地图大小: ${this.gridSize}x${this.gridSize} (${totalCells} 格)`);
    console.log(`陆地: ${landCount} 格 (${landPercentage}%)`);
    console.log(`水域: ${waterCount} 格 (${waterPercentage}%)`);
    console.log('==================');
  }
  
  /**
   * 可视化地图（在控制台打印，用于调试）
   * @param {number[][]} terrainMap - 地形地图
   */
  visualizeMap(terrainMap) {
    console.log('=== 地图可视化 ===');
    let mapString = '';
    
    for (let y = 0; y < this.gridSize; y++) {
      let row = '';
      for (let x = 0; x < this.gridSize; x++) {
        if (terrainMap[x][y] === TERRAIN_TYPES.LAND) {
          row += '🟫'; // 土地用棕色方块
        } else {
          row += '🟦'; // 水用蓝色方块
        }
      }
      mapString += row + '\n';
    }
    
    console.log(mapString);
    console.log('================');
  }
}