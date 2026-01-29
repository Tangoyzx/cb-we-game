/**
 * Renderer 渲染管理器
 * 封装Canvas绘图操作，提供便捷的绘图方法
 * 
 * 什么是Renderer？
 * 就像一支"画笔"，帮你在画布上画出游戏的所有内容
 */
export class Renderer {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    
    // 屏幕尺寸
    this.width = canvas.width;
    this.height = canvas.height;
  }
  
  /**
   * 清空画布
   * @param {string} color - 背景颜色，默认黑色
   */
  clear(color = '#000000') {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * 绘制矩形
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} color - 颜色
   */
  drawRect(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }
  
  /**
   * 绘制矩形边框
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} color - 颜色
   * @param {number} lineWidth - 线宽
   */
  drawRectStroke(x, y, width, height, color, lineWidth = 1) {
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.strokeRect(x, y, width, height);
  }
  
  /**
   * 绘制圆形
   * @param {number} x - 圆心X坐标
   * @param {number} y - 圆心Y坐标
   * @param {number} radius - 半径
   * @param {string} color - 颜色
   */
  drawCircle(x, y, radius, color) {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.fill();
  }
  
  /**
   * 绘制圆形边框
   * @param {number} x - 圆心X坐标
   * @param {number} y - 圆心Y坐标
   * @param {number} radius - 半径
   * @param {string} color - 颜色
   * @param {number} lineWidth - 线宽
   */
  drawCircleStroke(x, y, radius, color, lineWidth = 1) {
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    this.context.stroke();
  }
  
  /**
   * 绘制文本
   * @param {string} text - 文本内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} color - 颜色
   * @param {number} size - 字体大小
   * @param {string} align - 对齐方式 left/center/right
   */
  drawText(text, x, y, color = '#FFFFFF', size = 20, align = 'left') {
    this.context.fillStyle = color;
    this.context.font = `${size}px Arial`;
    this.context.textAlign = align;
    this.context.textBaseline = 'top';
    this.context.fillText(text, x, y);
  }
  
  /**
   * 绘制图片
   * @param {Image} image - 图片对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度（可选）
   * @param {number} height - 高度（可选）
   */
  drawImage(image, x, y, width, height) {
    if (width && height) {
      this.context.drawImage(image, x, y, width, height);
    } else {
      this.context.drawImage(image, x, y);
    }
  }
  
  /**
   * 绘制线条
   * @param {number} x1 - 起点X坐标
   * @param {number} y1 - 起点Y坐标
   * @param {number} x2 - 终点X坐标
   * @param {number} y2 - 终点Y坐标
   * @param {string} color - 颜色
   * @param {number} lineWidth - 线宽
   */
  drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }
  
  /**
   * 保存当前绘图状态
   */
  save() {
    this.context.save();
  }
  
  /**
   * 恢复之前保存的绘图状态
   */
  restore() {
    this.context.restore();
  }
  
  /**
   * 设置透明度
   * @param {number} alpha - 透明度 0-1
   */
  setAlpha(alpha) {
    this.context.globalAlpha = alpha;
  }
}
