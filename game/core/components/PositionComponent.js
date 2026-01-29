import { Component } from '../ecs/Component.js';

/**
 * PositionComponent 位置组件
 * 存储实体在游戏世界中的位置信息
 * 
 * 这是最基础的组件之一
 * 只要实体需要在屏幕上显示，就需要这个组件来记录它的位置
 */
export class PositionComponent extends Component {
  constructor(x = 0, y = 0) {
    super();
    
    // 实体的X坐标
    this.x = x;
    
    // 实体的Y坐标
    this.y = y;
  }
  
  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  /**
   * 移动位置
   * @param {number} dx - X方向的移动距离
   * @param {number} dy - Y方向的移动距离
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
