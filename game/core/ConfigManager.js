/**
 * ConfigManager 配置管理器
 * 负责加载和管理游戏配置文件
 * 
 * 什么是ConfigManager？
 * 就像一个"配置中心"，存储游戏的各种设置
 * 比如：网格大小、角色速度、屏幕尺寸等等
 */

// 导入配置文件 (使用 ES6 模块语法)
import gameConfig from '../config/gameConfig.js';
import resourceConfig from '../config/resourceConfig.js';

export class ConfigManager {
  constructor() {
    // 存储所有配置数据
    this.configs = new Map();
    
    // 预加载配置文件 (使用 require 直接导入 JS 模块)
    this._initConfigs();
  }
  
  /**
   * 初始化配置文件
   * 直接使用导入的配置模块
   * 在微信小游戏中必须用 import/export，不能用 require/module.exports！
   * @private
   */
  _initConfigs() {
    try {
      // 加载游戏配置
      this.configs.set('gameConfig', gameConfig);
      console.log('[ConfigManager] 游戏配置加载成功');
      
      // 加载资源配置
      this.configs.set('resourceConfig', resourceConfig);
      console.log('[ConfigManager] 资源配置加载成功');
      
    } catch (error) {
      console.error('[ConfigManager] 配置加载失败:', error);
    }
  }
  
  /**
   * 加载配置文件 (保留这个方法以兼容旧代码)
   * 但现在配置已经在构造函数中加载了
   * @param {string} path - 配置文件路径
   * @returns {Promise}
   */
  async loadConfig(path) {
    // 提取文件名作为配置的key
    const fileName = path.split('/').pop().replace('.json', '').replace('.js', '');
    const config = this.configs.get(fileName);
    
    if (config) {
      console.log(`配置文件 "${fileName}" 已经加载`);
      return Promise.resolve(config);
    } else {
      return Promise.reject(new Error(`配置文件不存在: ${path}`));
    }
  }
  
  /**
   * 获取配置数据
   * @param {string} key - 配置名称（不含.json后缀）
   * @returns {Object|null}
   */
  getConfig(key) {
    return this.configs.get(key) || null;
  }
  
  /**
   * 获取配置中的某个值
   * 支持通过点号分隔的路径访问嵌套属性
   * 例如：get('gameConfig', 'grid.size') 会返回 gameConfig.grid.size 的值
   * 
   * @param {string} configName - 配置文件名
   * @param {string} path - 属性路径
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(configName, path, defaultValue = null) {
    const config = this.configs.get(configName);
    if (!config) return defaultValue;
    
    // 如果没有提供path，返回整个配置
    if (!path) return config;
    
    // 通过路径访问嵌套属性
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }
  
  /**
   * 设置配置值
   * @param {string} configName - 配置文件名
   * @param {string} path - 属性路径
   * @param {*} value - 要设置的值
   */
  set(configName, path, value) {
    let config = this.configs.get(configName);
    
    // 如果配置不存在，创建一个新的
    if (!config) {
      config = {};
      this.configs.set(configName, config);
    }
    
    // 通过路径设置嵌套属性
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = config;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
  
  /**
   * 检查配置是否存在
   * @param {string} configName - 配置文件名
   * @returns {boolean}
   */
  hasConfig(configName) {
    return this.configs.has(configName);
  }
  
  /**
   * 清空所有配置
   */
  clear() {
    this.configs.clear();
  }
}
