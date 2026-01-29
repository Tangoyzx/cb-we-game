import { Component } from '../../../core/ecs/Component.js';

/**
 * UIComponent UI组件
 * 主菜单专用的UI组件
 * 
 * 用于标记界面元素（标题、装饰等）
 */
export class UIComponent extends Component {
  constructor(type, data = {}) {
    super();
    
    // UI类型：title（标题）、decoration（装饰）、panel（面板）
    this.type = type;
    
    // UI相关数据
    this.data = data;
  }
}
