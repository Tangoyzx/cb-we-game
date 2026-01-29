import { Component } from '../ecs/Component.js';

/**
 * MovementComponent 移动组件
 * 存储实体的移动速度和目标位置
 * 
 * 如果实体需要移动，就给它添加这个组件
 */
export class MovementComponent extends Component {
  constructor(speed = 0) {
    super();
    
    // 移动速度（像素/秒）
    this.speed = speed;
    
    // 当前移动方向（弧度）
    this.direction = 0;
    
    // 速度分量
    this.velocityX = 0;
    this.velocityY = 0;
    
    // 目标位置（如果有的话）
    this.targetX = null;
    this.targetY = null;
    
    // 是否正在移动
    this.moving = false;
  }
  
  /**
   * 设置速度
   * @param {number} speed - 速度值
   */
  setSpeed(speed) {
    this.speed = speed;
  }
  
  /**
   * 设置移动方向
   * @param {number} angle - 角度（弧度）
   */
  setDirection(angle) {
    this.direction = angle;
    this.velocityX = Math.cos(angle) * this.speed;
    this.velocityY = Math.sin(angle) * this.speed;
  }
  
  /**
   * 设置速度向量
   * @param {number} vx - X方向速度
   * @param {number} vy - Y方向速度
   */
  setVelocity(vx, vy) {
    this.velocityX = vx;
    this.velocityY = vy;
    
    // 更新方向和速度
    this.speed = Math.sqrt(vx * vx + vy * vy);
    this.direction = Math.atan2(vy, vx);
  }
  
  /**
   * 设置目标位置
   * @param {number} x - 目标X坐标
   * @param {number} y - 目标Y坐标
   */
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.moving = true;
  }
  
  /**
   * 清除目标位置
   */
  clearTarget() {
    this.targetX = null;
    this.targetY = null;
    this.moving = false;
  }
  
  /**
   * 停止移动
   */
  stop() {
    this.velocityX = 0;
    this.velocityY = 0;
    this.moving = false;
  }
}
