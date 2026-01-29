/**
 * InputManager 输入管理器
 * 处理触摸事件，提供简单的输入接口
 * 
 * 什么是InputManager？
 * 就像游戏的"耳朵"和"眼睛"，负责监听玩家的触摸操作
 * 然后告诉游戏"玩家刚才点了哪里"或"玩家正在拖动"
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    
    // 触摸状态
    this.touching = false;
    
    // 当前触摸位置
    this.touchX = 0;
    this.touchY = 0;
    
    // 触摸开始位置
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    // 上一帧的触摸位置
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    
    // 触摸移动的距离
    this.deltaX = 0;
    this.deltaY = 0;
    
    // 事件回调函数
    this.onTouchStart = null;
    this.onTouchMove = null;
    this.onTouchEnd = null;
    
    // 绑定事件处理函数
    this._bindEvents();
  }
  
  /**
   * 绑定触摸事件
   * @private
   */
  _bindEvents() {
    // 触摸开始
    wx.onTouchStart((event) => {
      if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        this.touching = true;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.deltaX = 0;
        this.deltaY = 0;
        
        // 调用回调
        if (this.onTouchStart) {
          this.onTouchStart(this.touchX, this.touchY);
        }
      }
    });
    
    // 触摸移动
    wx.onTouchMove((event) => {
      if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        
        // 更新位置
        this.lastTouchX = this.touchX;
        this.lastTouchY = this.touchY;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        
        // 计算移动距离
        this.deltaX = this.touchX - this.lastTouchX;
        this.deltaY = this.touchY - this.lastTouchY;
        
        // 调用回调
        if (this.onTouchMove) {
          this.onTouchMove(this.touchX, this.touchY, this.deltaX, this.deltaY);
        }
      }
    });
    
    // 触摸结束
    wx.onTouchEnd((event) => {
      this.touching = false;
      this.deltaX = 0;
      this.deltaY = 0;
      
      // 调用回调
      if (this.onTouchEnd) {
        this.onTouchEnd(this.touchX, this.touchY);
      }
    });
    
    // 触摸取消（如来电等）
    wx.onTouchCancel((event) => {
      this.touching = false;
      this.deltaX = 0;
      this.deltaY = 0;
      
      // 调用回调
      if (this.onTouchEnd) {
        this.onTouchEnd(this.touchX, this.touchY);
      }
    });
  }
  
  /**
   * 获取触摸相对于起始位置的偏移
   * @returns {{x: number, y: number}}
   */
  getTouchOffset() {
    return {
      x: this.touchX - this.touchStartX,
      y: this.touchY - this.touchStartY
    };
  }
  
  /**
   * 检查某个区域是否被点击
   * @param {number} x - 区域X坐标
   * @param {number} y - 区域Y坐标
   * @param {number} width - 区域宽度
   * @param {number} height - 区域高度
   * @returns {boolean}
   */
  isAreaTouched(x, y, width, height) {
    return this.touching &&
           this.touchX >= x &&
           this.touchX <= x + width &&
           this.touchY >= y &&
           this.touchY <= y + height;
  }
  
  /**
   * 检查某个圆形区域是否被点击
   * @param {number} x - 圆心X坐标
   * @param {number} y - 圆心Y坐标
   * @param {number} radius - 半径
   * @returns {boolean}
   */
  isCircleTouched(x, y, radius) {
    if (!this.touching) return false;
    
    const dx = this.touchX - x;
    const dy = this.touchY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= radius;
  }
  
  /**
   * 重置输入状态
   */
  reset() {
    this.touching = false;
    this.deltaX = 0;
    this.deltaY = 0;
  }
  
  /**
   * 销毁输入管理器
   */
  destroy() {
    // 微信小游戏的事件监听无法直接移除，这里重置回调
    this.onTouchStart = null;
    this.onTouchMove = null;
    this.onTouchEnd = null;
  }
}
