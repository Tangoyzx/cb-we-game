import { Component } from '../ecs/Component.js';

/**
 * InputComponent 输入组件
 * 标记实体可以接收输入事件
 * 
 * 给实体添加这个组件，表示它可以响应玩家的触摸操作
 */
export class InputComponent extends Component {
  constructor(options = {}) {
    super();
    
    // 是否可以被触摸
    this.touchable = options.touchable !== undefined ? options.touchable : true;
    
    // 是否可以拖拽
    this.draggable = options.draggable !== undefined ? options.draggable : false;
    
    // 是否正在被拖拽
    this.dragging = false;
    
    // 触摸回调函数
    this.onTouchStart = options.onTouchStart || null;
    this.onTouchMove = options.onTouchMove || null;
    this.onTouchEnd = options.onTouchEnd || null;
  }
  
  /**
   * 设置触摸开始回调
   * @param {Function} callback - 回调函数
   */
  setTouchStartCallback(callback) {
    this.onTouchStart = callback;
  }
  
  /**
   * 设置触摸移动回调
   * @param {Function} callback - 回调函数
   */
  setTouchMoveCallback(callback) {
    this.onTouchMove = callback;
  }
  
  /**
   * 设置触摸结束回调
   * @param {Function} callback - 回调函数
   */
  setTouchEndCallback(callback) {
    this.onTouchEnd = callback;
  }
}
