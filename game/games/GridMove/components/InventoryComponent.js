import { Component } from '../../../core/ecs/Component.js';

/**
 * InventoryComponent 物品栏组件
 * 管理玩家收集到的所有物品数量
 * 
 * 什么是InventoryComponent？
 * 就像你的背包，记录你有多少金币、多少种子等等！
 * 每次捡到东西就会自动增加数量
 */
export class InventoryComponent extends Component {
  constructor() {
    super();
    
    // 使用数组存储物品，按收集顺序排列
    // 每个元素是 {type, count, timestamp}
    this.items = [];
    
    // 物品栏容量限制（物品种类数量限制，-1表示无限制）
    this.capacity = -1;
    
    // 变化标记，用于UI更新优化
    this.dirty = false;
    
    // 物品信息配置（用于显示）
    this.itemInfo = {
      'coin': { name: '金币', icon: '🪙' },
      'seed': { name: '种子', icon: '🌱' },
      'block': { name: '石块', icon: '🪨' },
      'terrain': { name: '土块', icon: '🟫' }
    };
  }
  
  /**
   * 添加物品到物品栏
   * @param {string} type - 物品类型
   * @param {number} count - 添加数量，默认为1
   * @returns {boolean} 是否成功添加
   */
  addItem(type, count = 1) {
    if (count <= 0) return false;
    
    // 查找是否已存在该类型的物品
    const existingItem = this.items.find(item => item.type === type);
    
    if (existingItem) {
      // 如果已存在，增加数量
      existingItem.count += count;
      console.log(`添加物品: ${type} +${count} (总计: ${existingItem.count})`);
    } else {
      // 检查容量限制（物品种类数量）
      if (this.capacity > 0 && this.items.length >= this.capacity) {
        console.warn(`物品栏已满，无法添加新类型的物品: ${type}`);
        return false;
      }
      
      // 如果不存在，添加新物品（按收集顺序）
      this.items.push({
        type: type,
        count: count,
        timestamp: Date.now()  // 记录收集时间
      });
      
      console.log(`首次收集物品: ${type} x${count}`);
    }
    
    this.dirty = true;
    return true;
  }
  
  /**
   * 移除物品从物品栏
   * @param {string} type - 物品类型
   * @param {number} count - 移除数量，默认为1
   * @returns {boolean} 是否成功移除
   */
  removeItem(type, count = 1) {
    if (count <= 0) return false;
    
    const itemIndex = this.items.findIndex(item => item.type === type);
    if (itemIndex === -1) {
      console.warn(`物品不存在，无法移除: ${type}`);
      return false;
    }
    
    const item = this.items[itemIndex];
    if (item.count < count) {
      console.warn(`物品数量不足，无法移除 ${count} 个 ${type} (当前: ${item.count})`);
      return false;
    }
    
    item.count -= count;
    
    // 如果数量变为0，从物品栏中移除
    if (item.count === 0) {
      this.items.splice(itemIndex, 1);
      console.log(`移除物品: ${type} -${count} (已清空)`);
    } else {
      console.log(`移除物品: ${type} -${count} (剩余: ${item.count})`);
    }
    
    this.dirty = true;
    return true;
  }
  
  /**
   * 获取指定类型物品的数量
   * @param {string} type - 物品类型
   * @returns {number} 物品数量
   */
  getItemCount(type) {
    const item = this.items.find(item => item.type === type);
    return item ? item.count : 0;
  }
  
  /**
   * 检查是否拥有足够数量的物品
   * @param {string} type - 物品类型
   * @param {number} count - 需要的数量，默认为1
   * @returns {boolean} 是否拥有足够数量
   */
  hasItem(type, count = 1) {
    return this.getItemCount(type) >= count;
  }
  
  /**
   * 获取所有物品类型列表
   * @returns {Array<string>} 物品类型数组
   */
  getItemTypes() {
    return this.items.map(item => item.type);
  }
  
  /**
   * 获取物品栏的总物品数量
   * @returns {number} 总数量
   */
  getTotalItemCount() {
    return this.items.reduce((total, item) => total + item.count, 0);
  }
  
  /**
   * 获取物品栏的详细信息（用于UI显示）
   * 🎒 按照收集的先后顺序返回！
   * @returns {Array<Object>} 物品信息数组
   */
  getInventoryData() {
    // 直接按照items数组的顺序返回（即收集顺序）
    return this.items.map(item => {
      const info = this.itemInfo[item.type] || { name: item.type, icon: '❓' };
      
      return {
        type: item.type,
        name: info.name,
        icon: info.icon,
        count: item.count,
        timestamp: item.timestamp,
        empty: false  // 实际存在的物品不为空
      };
    });
  }
  
  /**
   * 清空物品栏
   */
  clear() {
    this.items = [];
    this.dirty = true;
    console.log('物品栏已清空');
  }
  
  /**
   * 检查物品栏是否为空
   * @returns {boolean} 是否为空
   */
  isEmpty() {
    return this.items.length === 0;
  }
  
  /**
   * 重置变化标记
   */
  clearDirty() {
    this.dirty = false;
  }
  
  /**
   * 检查是否有变化
   * @returns {boolean} 是否有变化
   */
  isDirty() {
    return this.dirty;
  }
  
  /**
   * 获取物品栏状态的字符串表示（用于调试）
   * @returns {string} 状态字符串
   */
  toString() {
    if (this.isEmpty()) {
      return '物品栏: 空';
    }
    
    const itemStrings = this.items.map(item => `${item.type}: ${item.count}`);
    return `物品栏: ${itemStrings.join(', ')} (总计: ${this.getTotalItemCount()})`;
  }
}