/**
 * ConfigManager 配置管理器
 * 负责加载和管理游戏配置文件
 * 
 * 什么是ConfigManager？
 * 就像一个"配置中心"，存储游戏的各种设置
 * 比如：网格大小、角色速度、屏幕尺寸等等
 */
export class ConfigManager {
  constructor() {
    // 存储所有配置数据
    this.configs = new Map();
  }
  
  /**
   * 加载配置文件
   * @param {string} path - 配置文件路径
   * @returns {Promise}
   */
  async loadConfig(path) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: path,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            // 提取文件名作为配置的key
            const fileName = path.split('/').pop().replace('.json', '');
            this.configs.set(fileName, res.data);
            console.log(`配置文件 "${fileName}" 加载成功`);
            resolve(res.data);
          } else {
            reject(new Error(`配置文件加载失败: ${path}`));
          }
        },
        fail: (error) => {
          // 如果是本地文件系统，尝试使用 FileSystemManager
          this._loadLocalConfig(path)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }
  
  /**
   * 从本地文件系统加载配置
   * @param {string} path - 配置文件路径
   * @returns {Promise}
   * @private
   */
  async _loadLocalConfig(path) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      try {
        const data = fs.readFileSync(path, 'utf8');
        const config = JSON.parse(data);
        const fileName = path.split('/').pop().replace('.json', '');
        this.configs.set(fileName, config);
        console.log(`配置文件 "${fileName}" 从本地加载成功`);
        resolve(config);
      } catch (error) {
        console.error(`本地配置文件加载失败: ${path}`, error);
        reject(error);
      }
    });
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
