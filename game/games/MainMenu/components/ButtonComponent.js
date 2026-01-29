import { Component } from '../../../core/ecs/Component.js';

/**
 * ButtonComponent 按钮组件
 * 主菜单专用的按钮组件
 * 
 * 这个组件用于游戏选择按钮，存储游戏的相关信息
 */
export class ButtonComponent extends Component {
  constructor(gameName, displayName, preview) {
    super();
    
    // 游戏名称（用于切换游戏）
    this.gameName = gameName;
    
    // 显示名称
    this.displayName = displayName;
    
    // 预览图
    this.preview = preview;
    
    // 按钮状态
    this.pressed = false;
    this.hovered = false;
  }
}
