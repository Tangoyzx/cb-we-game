import { Component } from '../ecs/Component.js';

/**
 * RenderComponent 渲染组件
 * 定义实体的渲染属性（颜色、大小、形状等）
 * 
 * 这个组件告诉渲染系统"这个实体应该怎么画"
 */
export class RenderComponent extends Component {
  constructor(type = 'rect', options = {}) {
    super();
    
    // 渲染类型：rect（矩形）、circle（圆形）、image（图片）、text（文本）
    this.type = type;
    
    // 颜色
    this.color = options.color || '#FFFFFF';
    
    // 尺寸（对于矩形是宽和高，对于圆形是半径）
    this.width = options.width || 32;
    this.height = options.height || 32;
    this.radius = options.radius || 16;
    
    // 图片（如果type是image）
    this.image = options.image || null;
    
    // 文本（如果type是text）
    this.text = options.text || '';
    this.fontSize = options.fontSize || 20;
    this.textAlign = options.textAlign || 'center';
    
    // 透明度
    this.alpha = options.alpha !== undefined ? options.alpha : 1;
    
    // 是否可见
    this.visible = options.visible !== undefined ? options.visible : true;
    
    // 渲染层级（数字越大越靠前）
    this.zIndex = options.zIndex || 0;
  }
  
  /**
   * 设置颜色
   * @param {string} color - 颜色值
   */
  setColor(color) {
    this.color = color;
  }
  
  /**
   * 设置尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }
  
  /**
   * 设置透明度
   * @param {number} alpha - 透明度 0-1
   */
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }
  
  /**
   * 设置可见性
   * @param {boolean} visible - 是否可见
   */
  setVisible(visible) {
    this.visible = visible;
  }
}
