/**
 * ImageLoader 图片加载工具类
 * 提供图片预加载、缓存管理和批量加载功能
 * 
 * 这个工具帮助我们管理游戏中的所有图片资源，让游戏运行更流畅！
 */
export class ImageLoader {
  constructor() {
    // 图片缓存，用Map存储已加载的图片
    this.imageCache = new Map();
    
    // 加载状态跟踪
    this.loadingPromises = new Map();
    
    // 加载统计
    this.stats = {
      loaded: 0,
      failed: 0,
      cached: 0
    };
  }

  /**
   * 加载单张图片
   * @param {string} url - 图片URL或路径
   * @param {string} key - 缓存键名（可选，默认使用URL）
   * @returns {Promise<Image>} 加载完成的图片对象
   */
  async loadImage(url, key = null) {
    const cacheKey = key || url;
    
    // 如果已经缓存，直接返回
    if (this.imageCache.has(cacheKey)) {
      this.stats.cached++;
      return this.imageCache.get(cacheKey);
    }
    
    // 如果正在加载，返回现有的Promise
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    // 创建加载Promise
    const loadPromise = this._createLoadPromise(url, cacheKey);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const image = await loadPromise;
      
      // 加载成功，存入缓存
      this.imageCache.set(cacheKey, image);
      this.stats.loaded++;
      
      return image;
    } catch (error) {
      this.stats.failed++;
      throw error;
    } finally {
      // 清理加载Promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * 创建图片加载Promise
   * @param {string} url - 图片URL
   * @param {string} cacheKey - 缓存键
   * @returns {Promise<Image>} 加载Promise
   * @private
   */
  _createLoadPromise(url, cacheKey) {
    return new Promise((resolve, reject) => {
      let image;
      
      // 根据环境创建Image对象
      if (typeof wx !== 'undefined' && wx.createImage) {
        // 微信小游戏环境
        image = wx.createImage();
      } else {
        // 浏览器环境
        image = new Image();
      }
      
      // 设置加载成功回调
      image.onload = () => {
        console.log(`✅ 图片加载成功: ${cacheKey}`);
        resolve(image);
      };
      
      // 设置加载失败回调
      image.onerror = (error) => {
        console.error(`❌ 图片加载失败: ${cacheKey}`, error);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // 开始加载
      image.src = url;
    });
  }

  /**
   * 批量加载图片
   * @param {Array<Object>} imageConfigs - 图片配置数组 [{url, key}, ...]
   * @param {Function} onProgress - 进度回调函数 (loaded, total) => {}
   * @returns {Promise<Map>} 加载完成的图片Map
   */
  async loadImages(imageConfigs, onProgress = null) {
    console.log(`🔄 开始批量加载 ${imageConfigs.length} 张图片...`);
    
    const total = imageConfigs.length;
    let loaded = 0;
    const results = new Map();
    
    // 创建所有加载Promise
    const loadPromises = imageConfigs.map(async (config) => {
      try {
        const image = await this.loadImage(config.url, config.key);
        results.set(config.key || config.url, image);
        
        loaded++;
        if (onProgress) {
          onProgress(loaded, total);
        }
        
        return { success: true, key: config.key || config.url, image };
      } catch (error) {
        console.error(`图片加载失败: ${config.key || config.url}`, error);
        loaded++;
        if (onProgress) {
          onProgress(loaded, total);
        }
        
        return { success: false, key: config.key || config.url, error };
      }
    });
    
    // 等待所有图片加载完成
    const loadResults = await Promise.all(loadPromises);
    
    // 统计结果
    const successful = loadResults.filter(r => r.success).length;
    const failed = loadResults.filter(r => !r.success).length;
    
    console.log(`📊 批量加载完成: 成功 ${successful}，失败 ${failed}`);
    
    return results;
  }

  /**
   * 预加载动画资源
   * @param {Object} animations - 动画配置对象
   * @returns {Promise<Object>} 加载完成的动画对象
   */
  async preloadAnimations(animations) {
    console.log('🎬 开始预加载动画资源...');
    
    const imageConfigs = [];
    
    // 遍历所有动画类型和方向
    for (const [animationType, directions] of Object.entries(animations)) {
      for (const [direction, frames] of Object.entries(directions)) {
        frames.forEach((frameData, index) => {
          if (frameData.url) {
            // 如果是URL路径
            imageConfigs.push({
              url: frameData.url,
              key: `${animationType}_${direction}_${index}`
            });
          } else if (frameData instanceof Image || frameData.src) {
            // 如果已经是Image对象，直接缓存
            const key = `${animationType}_${direction}_${index}`;
            this.imageCache.set(key, frameData);
          }
        });
      }
    }
    
    // 批量加载图片
    const loadedImages = await this.loadImages(imageConfigs, (loaded, total) => {
      console.log(`📈 动画资源加载进度: ${loaded}/${total} (${Math.round(loaded/total*100)}%)`);
    });
    
    // 重新组织为动画结构
    const loadedAnimations = {};
    
    for (const [animationType, directions] of Object.entries(animations)) {
      loadedAnimations[animationType] = {};
      
      for (const [direction, frames] of Object.entries(directions)) {
        loadedAnimations[animationType][direction] = [];
        
        frames.forEach((frameData, index) => {
          const key = `${animationType}_${direction}_${index}`;
          const image = this.imageCache.get(key);
          
          if (image) {
            loadedAnimations[animationType][direction].push(image);
          } else {
            console.warn(`⚠️ 动画帧未找到: ${key}`);
          }
        });
      }
    }
    
    console.log('✅ 动画资源预加载完成！');
    return loadedAnimations;
  }

  /**
   * 获取缓存的图片
   * @param {string} key - 缓存键
   * @returns {Image|null} 图片对象或null
   */
  getImage(key) {
    return this.imageCache.get(key) || null;
  }

  /**
   * 检查图片是否已缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否已缓存
   */
  hasImage(key) {
    return this.imageCache.has(key);
  }

  /**
   * 清除指定图片缓存
   * @param {string} key - 缓存键
   * @returns {boolean} 是否成功清除
   */
  clearImage(key) {
    return this.imageCache.delete(key);
  }

  /**
   * 清除所有图片缓存
   */
  clearAll() {
    this.imageCache.clear();
    this.loadingPromises.clear();
    this.stats = { loaded: 0, failed: 0, cached: 0 };
    console.log('🗑️ 已清除所有图片缓存');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.imageCache.size,
      loading: this.loadingPromises.size
    };
  }

  /**
   * 预热缓存（预加载常用图片）
   * @param {Array<string>} urls - 图片URL数组
   * @returns {Promise<void>}
   */
  async warmupCache(urls) {
    console.log(`🔥 开始预热缓存，加载 ${urls.length} 张常用图片...`);
    
    const configs = urls.map(url => ({ url, key: url }));
    await this.loadImages(configs);
    
    console.log('✅ 缓存预热完成！');
  }

  /**
   * 获取内存使用估算
   * @returns {Object} 内存使用信息
   */
  getMemoryUsage() {
    let estimatedBytes = 0;
    
    // 粗略估算：假设每张48x48的图片约9KB
    const avgImageSize = 48 * 48 * 4; // RGBA
    estimatedBytes = this.imageCache.size * avgImageSize;
    
    return {
      imageCount: this.imageCache.size,
      estimatedBytes,
      estimatedMB: (estimatedBytes / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * 销毁ImageLoader，清理所有资源
   */
  destroy() {
    this.clearAll();
    console.log('💥 ImageLoader已销毁');
  }
}