/**
 * 游戏配置文件
 * 这里存放游戏的各种参数设置
 */

const gameConfig = {
  // 屏幕设置
  screen: {
    width: 750,      // 屏幕宽度
    height: 1334     // 屏幕高度
  },
  
  // 网格设置
  grid: {
    size: 30,        // 网格大小 (30x30)
    cellSize: 50     // 每个格子的像素大小
  },
  
  // 玩家设置
  player: {
    speed: 250,      // 移动速度 (毫秒)
    size: 23         // 玩家大小
  },
  
  // 地形设置
  terrain: {
    landRatio: 0.65,              // 陆地占比 (65%)
    centerRadius: 0.35,            // 中心陆地半径
    edgeWaterRange: 3,             // 边缘水域范围
    maxRetries: 5,                 // 最大重试次数
    enableRandomGeneration: true,  // 启用随机生成
    visualizeInConsole: true       // 在控制台显示地图
  },
  
  // UI设置
  ui: {
    titleSize: 48,       // 标题字体大小
    buttonWidth: 200,    // 按钮宽度
    buttonHeight: 150,   // 按钮高度
    buttonSpacing: 20,   // 按钮间距
    buttonsPerPage: 3    // 每页按钮数量
  }
};

// 导出配置对象 (使用 ES6 模块语法)
export default gameConfig;
