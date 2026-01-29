// 太阳鸟游戏 - 微信小游戏入口文件
import { GameManager } from './core/GameManager.js';
import { ConfigManager } from './core/ConfigManager.js';
import { MainMenuGame } from './games/MainMenu/MainMenuGame.js';
import { GridMoveGame } from './games/GridMove/GridMoveGame.js';

// 获取Canvas
const canvas = wx.createCanvas();
const context = canvas.getContext('2d');

// 全局配置
global.canvas = canvas;
global.context = context;

// 初始化配置管理器
const configManager = new ConfigManager();
global.configManager = configManager;

// 游戏管理器实例
let gameManager = null;

// 初始化游戏
async function init() {
  try {
    // 加载配置文件
    await configManager.loadConfig('config/gameConfig.json');
    await configManager.loadConfig('config/resourceConfig.json');
    
    console.log('配置加载完成');
    
    // 创建游戏管理器
    gameManager = new GameManager(canvas, context);
    
    // 注册所有子游戏
    gameManager.registerGame('MainMenu', MainMenuGame);
    gameManager.registerGame('GridMove', GridMoveGame);
    
    // 初始化游戏管理器
    await gameManager.init();
    
    // 启动主菜单
    await gameManager.switchGame('MainMenu');
    
    console.log('游戏初始化完成');
    
    // 启动游戏主循环
    gameLoop();
  } catch (error) {
    console.error('游戏初始化失败:', error);
  }
}

// 游戏主循环
function gameLoop() {
  if (gameManager) {
    // 更新游戏逻辑
    gameManager.update();
    
    // 渲染游戏画面
    gameManager.render();
  }
  
  // 继续下一帧
  requestAnimationFrame(gameLoop);
}

// 启动游戏
init();
