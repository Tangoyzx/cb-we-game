/**
 * 资源配置文件
 * 这里存放游戏中所有图片、音频等资源的路径
 */

const resourceConfig = {
  // 图片资源
  images: {
    // 通用图片
    common: {
      button: "assets/images/common/button.png"
    },
    
    // 主菜单图片
    mainMenu: {
      titleLogo: "assets/images/MainMenu/title-logo.png"
    },
    
    // 网格移动游戏图片
    gridMove: {
      player: "assets/images/GridMove/player.png",
      gridBg: "assets/images/GridMove/grid-bg.png",
      preview: "assets/images/GridMove/preview.png"
    }
  },
  
  // 音频资源
  audio: {
    // 通用音频
    common: {
      click: "assets/audio/common/click.mp3"
    },
    
    // 主菜单音频
    mainMenu: {
      bgm: "assets/audio/MainMenu/bgm.mp3"
    },
    
    // 网格移动游戏音频
    gridMove: {
      move: "assets/audio/GridMove/move.mp3"
    }
  }
};

// 导出配置对象 (使用 ES6 模块语法)
export default resourceConfig;
