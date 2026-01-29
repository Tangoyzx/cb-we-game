/**
 * GameManager 游戏管理器
 * 负责管理所有子游戏的生命周期和切换
 * 
 * 什么是GameManager？
 * 就像一个"导演"，决定现在该播放哪个游戏
 * 它会调用当前游戏的init（初始化）、update（更新）、render（渲染）、release（释放）方法
 */
export class GameManager {
  constructor(canvas, context) {
    // Canvas画布和绘图上下文
    this.canvas = canvas;
    this.context = context;
    
    // 所有已注册的子游戏类
    this.gameClasses = new Map();
    
    // 当前正在运行的游戏实例
    this.currentGame = null;
    
    // 当前游戏的名称
    this.currentGameName = null;
  }
  
  /**
   * 注册子游戏
   * @param {string} name - 游戏名称
   * @param {Function} GameClass - 游戏类
   */
  registerGame(name, GameClass) {
    this.gameClasses.set(name, GameClass);
    console.log(`游戏 "${name}" 已注册`);
    return this;
  }
  
  /**
   * 获取所有已注册的游戏信息
   * @returns {Array} 游戏信息数组
   */
  getAllGames() {
    const games = [];
    
    for (const [name, GameClass] of this.gameClasses.entries()) {
      // 调用游戏类的静态方法获取信息
      games.push({
        name: name,
        displayName: GameClass.getDisplayName ? GameClass.getDisplayName() : name,
        preview: GameClass.getPreviewImage ? GameClass.getPreviewImage() : null
      });
    }
    
    return games;
  }
  
  /**
   * 切换到指定的游戏
   * @param {string} gameName - 要切换到的游戏名称
   */
  async switchGame(gameName) {
    // 如果要切换的游戏就是当前游戏，不做任何操作
    if (this.currentGameName === gameName && this.currentGame) {
      return;
    }
    
    // 释放当前游戏
    if (this.currentGame) {
      console.log(`释放游戏 "${this.currentGameName}"`);
      this.currentGame.release();
      this.currentGame = null;
      this.currentGameName = null;
    }
    
    // 获取要切换到的游戏类
    const GameClass = this.gameClasses.get(gameName);
    
    if (!GameClass) {
      console.error(`游戏 "${gameName}" 未注册`);
      return;
    }
    
    // 创建新游戏实例
    console.log(`初始化游戏 "${gameName}"`);
    this.currentGame = new GameClass(this.canvas, this.context, this);
    this.currentGameName = gameName;
    
    // 初始化新游戏
    await this.currentGame.init();
    
    console.log(`游戏 "${gameName}" 已启动`);
  }
  
  /**
   * 初始化游戏管理器
   */
  async init() {
    // 这里可以做一些全局初始化工作
    console.log('GameManager 初始化完成');
  }
  
  /**
   * 更新当前游戏
   */
  update() {
    if (this.currentGame && this.currentGame.update) {
      this.currentGame.update();
    }
  }
  
  /**
   * 渲染当前游戏
   */
  render() {
    if (this.currentGame && this.currentGame.render) {
      this.currentGame.render();
    }
  }
  
  /**
   * 销毁游戏管理器
   */
  destroy() {
    if (this.currentGame) {
      this.currentGame.release();
      this.currentGame = null;
    }
    
    this.gameClasses.clear();
  }
}
