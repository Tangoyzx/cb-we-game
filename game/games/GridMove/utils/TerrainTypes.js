/**
 * 地形类型定义
 * 这里定义了游戏中所有的地形类型和它们的属性
 * 
 * 小朋友，这就像给每种地形贴上标签，告诉游戏它们的特点！
 */

/**
 * 地形类型枚举
 * 每种地形都有一个唯一的数字ID
 */
export const TERRAIN_TYPES = {
  WATER: 0,  // 水格子 - 蓝蓝的水，不能走
  LAND: 1    // 土格子 - 棕色的土地，可以走
  // 未来可以添加更多地形类型：
  // MOUNTAIN: 2,  // 山地 - 高高的山，不能走
  // FOREST: 3,    // 森林 - 绿色的树林，可以走但可能慢一些
  // DESERT: 4     // 沙漠 - 黄色的沙子，可以走
};

/**
 * 地形配置信息
 * 每种地形的详细属性，包括颜色、是否可行走等
 */
export const TERRAIN_CONFIG = {
  [TERRAIN_TYPES.WATER]: { 
    color: '#4A90E2',     // 蓝色 - 像真正的水一样
    walkable: false,      // 核心属性：不能走！会掉到水里
    name: '水域',
    description: '深蓝色的水域，角色无法通过'
  },
  [TERRAIN_TYPES.LAND]: { 
    color: '#8B7355',     // 棕色 - 像泥土一样
    walkable: true,       // 核心属性：可以走！
    name: '陆地',
    description: '棕色的陆地，角色可以自由行走'
  }
  // 未来扩展示例（注释掉，以后可以取消注释使用）：
  // [TERRAIN_TYPES.MOUNTAIN]: { 
  //   color: '#8B4513', 
  //   walkable: false, 
  //   name: '山地',
  //   description: '高耸的山峰，无法攀登'
  // },
  // [TERRAIN_TYPES.FOREST]: { 
  //   color: '#228B22', 
  //   walkable: true, 
  //   name: '森林',
  //   description: '茂密的森林，可以通过但移动较慢',
  //   speedModifier: 0.7  // 移动速度修正（70%速度）
  // }
};

/**
 * 获取地形配置信息
 * @param {number} terrainType - 地形类型ID
 * @returns {object} 地形配置对象
 */
export function getTerrainConfig(terrainType) {
  return TERRAIN_CONFIG[terrainType] || TERRAIN_CONFIG[TERRAIN_TYPES.LAND];
}

/**
 * 检查地形是否可行走
 * @param {number} terrainType - 地形类型ID
 * @returns {boolean} 是否可行走
 */
export function isTerrainWalkable(terrainType) {
  const config = getTerrainConfig(terrainType);
  return config.walkable;
}

/**
 * 获取地形颜色
 * @param {number} terrainType - 地形类型ID
 * @returns {string} 颜色值
 */
export function getTerrainColor(terrainType) {
  const config = getTerrainConfig(terrainType);
  return config.color;
}

/**
 * 获取所有可行走的地形类型
 * @returns {number[]} 可行走地形类型数组
 */
export function getWalkableTerrainTypes() {
  return Object.keys(TERRAIN_CONFIG)
    .map(key => parseInt(key))
    .filter(terrainType => isTerrainWalkable(terrainType));
}

/**
 * 获取所有不可行走的地形类型
 * @returns {number[]} 不可行走地形类型数组
 */
export function getNonWalkableTerrainTypes() {
  return Object.keys(TERRAIN_CONFIG)
    .map(key => parseInt(key))
    .filter(terrainType => !isTerrainWalkable(terrainType));
}