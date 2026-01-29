import { World } from '../../core/ecs/World.js';
import { Renderer } from '../../core/Renderer.js';
import { InputManager } from '../../core/InputManager.js';
import { RenderSystem } from '../../core/systems/RenderSystem.js';
import { InputSystem } from '../../core/systems/InputSystem.js';
import { UISystem } from './systems/UISystem.js';
import { NavigationSystem } from './systems/NavigationSystem.js';
import { PositionComponent } from '../../core/components/PositionComponent.js';
import { RenderComponent } from '../../core/components/RenderComponent.js';
import { InputComponent } from '../../core/components/InputComponent.js';
import { ButtonComponent } from './components/ButtonComponent.js';
import { UIComponent } from './components/UIComponent.js';

/**
 * MainMenuGame 主菜单游戏
 * 显示"太阳鸟游戏"标题和子游戏选择界面
 * 
 * 这是玩家进入游戏后看到的第一个界面
 */
export class MainMenuGame {
  constructor(canvas, context, gameManager) {
    this.canvas = canvas;
    this.context = context;
    this.gameManager = gameManager;
    
    // 创建ECS世界
    this.world = new World();
    
    // 创建渲染器和输入管理器
    this.renderer = new Renderer(canvas, context);
    this.inputManager = new InputManager(canvas);
    
    // 当前页码
    this.currentPage = 0;
    this.buttonsPerPage = 3; // 每页显示3个游戏按钮
    
    // 游戏按钮列表
    this.gameButtons = [];
  }
  
  /**
   * 获取游戏显示名称（静态方法）
   */
  static getDisplayName() {
    return '游戏选择';
  }
  
  /**
   * 获取游戏预览图（静态方法）
   */
  static getPreviewImage() {
    return null; // 主菜单不需要预览图
  }
  
  /**
   * 初始化游戏
   */
  async init() {
    console.log('主菜单初始化...');
    
    // 注册系统
    this.world.registerSystem(new RenderSystem(this.renderer));
    this.world.registerSystem(new InputSystem(this.inputManager));
    this.world.registerSystem(new UISystem(this.renderer));
    this.world.registerSystem(new NavigationSystem(this));
    
    // 创建UI元素
    this._createTitle();
    this._createGameButtons();
    this._createNavigationButtons();
    
    console.log('主菜单初始化完成');
  }
  
  /**
   * 创建标题
   * @private
   */
  _createTitle() {
    const titleEntity = this.world.createEntity();
    
    titleEntity.addComponent(new PositionComponent(
      this.canvas.width / 2,
      150
    ));
    
    titleEntity.addComponent(new RenderComponent('text', {
      text: '太阳鸟游戏',
      fontSize: 48,
      color: '#FFD700',
      textAlign: 'center',
      zIndex: 10
    }));
    
    titleEntity.addComponent(new UIComponent('title'));
  }
  
  /**
   * 创建游戏选择按钮
   * @private
   */
  _createGameButtons() {
    // 获取所有游戏（排除主菜单自己）
    const allGames = this.gameManager.getAllGames().filter(
      game => game.name !== 'MainMenu'
    );
    
    const buttonWidth = 200;
    const buttonHeight = 150;
    const buttonSpacing = 30;
    const startY = 300;
    
    // 为每个游戏创建按钮
    allGames.forEach((game, index) => {
      const buttonEntity = this.world.createEntity();
      
      // 计算按钮位置
      const x = this.canvas.width / 2;
      const y = startY + index * (buttonHeight + buttonSpacing);
      
      buttonEntity.addComponent(new PositionComponent(x, y));
      
      buttonEntity.addComponent(new RenderComponent('rect', {
        width: buttonWidth,
        height: buttonHeight,
        color: '#4CAF50',
        zIndex: 5
      }));
      
      buttonEntity.addComponent(new InputComponent({
        touchable: true,
        draggable: false
      }));
      
      buttonEntity.addComponent(new ButtonComponent(
        game.name,
        game.displayName,
        game.preview
      ));
      
      // 添加按钮文本
      const textEntity = this.world.createEntity();
      textEntity.addComponent(new PositionComponent(x, y));
      textEntity.addComponent(new RenderComponent('text', {
        text: game.displayName,
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
        zIndex: 6
      }));
      textEntity.addComponent(new UIComponent('button-text'));
      
      // 设置点击回调
      const input = buttonEntity.getComponent(InputComponent);
      input.onTouchEnd = () => {
        console.log(`点击了游戏: ${game.displayName}`);
        this.gameManager.switchGame(game.name);
      };
      
      this.gameButtons.push(buttonEntity);
    });
  }
  
  /**
   * 创建翻页按钮
   * @private
   */
  _createNavigationButtons() {
    // 如果游戏数量少于等于每页显示数量，不需要翻页按钮
    if (this.gameButtons.length <= this.buttonsPerPage) {
      return;
    }
    
    // 创建"上一页"按钮
    const prevButton = this.world.createEntity();
    prevButton.addComponent(new PositionComponent(100, this.canvas.height - 100));
    prevButton.addComponent(new RenderComponent('rect', {
      width: 120,
      height: 60,
      color: '#2196F3',
      zIndex: 5
    }));
    prevButton.addComponent(new InputComponent({ touchable: true }));
    
    const prevInput = prevButton.getComponent(InputComponent);
    prevInput.onTouchEnd = () => this._prevPage();
    
    // 创建"下一页"按钮
    const nextButton = this.world.createEntity();
    nextButton.addComponent(new PositionComponent(
      this.canvas.width - 100,
      this.canvas.height - 100
    ));
    nextButton.addComponent(new RenderComponent('rect', {
      width: 120,
      height: 60,
      color: '#2196F3',
      zIndex: 5
    }));
    nextButton.addComponent(new InputComponent({ touchable: true }));
    
    const nextInput = nextButton.getComponent(InputComponent);
    nextInput.onTouchEnd = () => this._nextPage();
  }
  
  /**
   * 上一页
   * @private
   */
  _prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this._updateButtonsVisibility();
    }
  }
  
  /**
   * 下一页
   * @private
   */
  _nextPage() {
    const maxPage = Math.ceil(this.gameButtons.length / this.buttonsPerPage) - 1;
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this._updateButtonsVisibility();
    }
  }
  
  /**
   * 更新按钮可见性
   * @private
   */
  _updateButtonsVisibility() {
    const startIndex = this.currentPage * this.buttonsPerPage;
    const endIndex = startIndex + this.buttonsPerPage;
    
    this.gameButtons.forEach((button, index) => {
      const render = button.getComponent(RenderComponent);
      render.visible = index >= startIndex && index < endIndex;
    });
  }
  
  /**
   * 更新游戏逻辑
   */
  update() {
    this.world.update();
  }
  
  /**
   * 渲染游戏画面
   */
  render() {
    // 清空画布
    this.renderer.clear('#1a1a2e');
  }
  
  /**
   * 释放游戏资源
   */
  release() {
    console.log('主菜单释放资源...');
    this.world.destroy();
    this.inputManager.destroy();
  }
}
