import { System } from '../ecs/System.js';
import { PositionComponent } from '../components/PositionComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { ItemComponent } from '../../games/GridMove/components/ItemComponent.js';

/**
 * RenderSystem 渲染系统
 * 负责绘制所有拥有位置和渲染组件的实体
 * 🎁 现在支持物品渲染！
 * 
 * 这个系统遍历所有需要渲染的实体，根据它们的渲染组件画出来
 */
export class RenderSystem extends System {
  constructor(renderer, cellSize = 50) {
    super();
    
    // 渲染器
    this.renderer = renderer;
    
    // 格子大小（用于物品渲染）
    this.cellSize = cellSize;
    
    // 需要的组件类型（只需要位置组件，因为物品没有RenderComponent）
    this.requiredComponents = [PositionComponent];
  }
  
  /**
   * 更新系统（渲染系统在update中不做任何事）
   * @param {number} deltaTime - 距离上一帧的时间
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    // 渲染系统不在update中做任何事，所有渲染在render方法中完成
  }
  
  /**
   * 渲染系统
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  render(entities) {
    // 按照zIndex排序，zIndex大的后绘制（显示在上层）
    const sortedEntities = entities.slice().sort((a, b) => {
      const renderA = a.getComponent(RenderComponent);
      const renderB = b.getComponent(RenderComponent);
      const zIndexA = renderA ? renderA.zIndex : 0;
      const zIndexB = renderB ? renderB.zIndex : 0;
      return zIndexA - zIndexB;
    });
    
    // 绘制所有实体
    for (const entity of sortedEntities) {
      const position = entity.getComponent(PositionComponent);
      if (!position) continue;
      
      // 🎁 优先检查是否是物品实体
      const itemComponent = entity.getComponent(ItemComponent);
      if (itemComponent) {
        this._renderItem(position, itemComponent);
        continue;
      }
      
      // 普通实体渲染
      const render = entity.getComponent(RenderComponent);
      if (!render || !render.visible) continue;
      
      this._renderEntity(position, render);
    }
  }
  
  /**
   * 渲染普通实体
   * @param {PositionComponent} position - 位置组件
   * @param {RenderComponent} render - 渲染组件
   */
  _renderEntity(position, render) {
    const { x, y } = position;
    const { type, color, width, height, radius } = render;
    
    switch (type) {
      case 'rect':
        this.renderer.drawRect(x - width/2, y - height/2, width, height, color);
        break;
      case 'circle':
        this.renderer.drawCircle(x, y, radius, color);
        break;
      case 'image':
        if (render.image) {
          this.renderer.drawImage(render.image, x - width/2, y - height/2, width, height);
        }
        break;
      case 'text':
        // 渲染文本（如果有的话）
        if (render.text) {
          const fontSize = render.fontSize || 16;
          const textColor = render.color || '#FFFFFF';
          const align = render.align || 'center';
          this.renderer.drawText(render.text, x, y, textColor, fontSize, align);
        }
        break;
      default:
        console.warn(`未知的渲染类型: ${type}`);
    }
  }
  
  /**
   * 渲染物品实体
   * @param {PositionComponent} position - 位置组件
   * @param {ItemComponent} item - 物品组件
   */
  _renderItem(position, item) {
    // 跳过已收集的物品
    if (item.collected) return;
    
    const { x, y } = position;
    const { config } = item;
    
    // 应用透明度（收集特效可能会设置）
    const alpha = config.alpha !== undefined ? config.alpha : 1.0;
    if (alpha <= 0) return;
    
    // 保存当前状态
    this.renderer.context.save();
    
    // 设置透明度
    if (alpha < 1.0) {
      this.renderer.context.globalAlpha = alpha;
    }
    
    // 根据物品形状渲染
    switch (config.shape) {
      case 'circle':
        this._renderItemCircle(x, y, item);
        break;
      case 'square':
        this._renderItemSquare(x, y, item);
        break;
      case 'diamond':
        this._renderItemDiamond(x, y, item);
        break;
      default:
        this._renderItemCircle(x, y, item); // 默认圆形
    }
    
    // 恢复状态
    this.renderer.context.restore();
  }
  
  /**
   * 渲染圆形物品（如金币）
   */
  _renderItemCircle(x, y, item) {
    const radius = item.getRenderRadius(this.cellSize);
    
    // 绘制物品主体
    this.renderer.context.beginPath();
    this.renderer.context.arc(x, y, radius, 0, Math.PI * 2);
    this.renderer.context.fillStyle = item.config.color;
    this.renderer.context.fill();
    
    // 绘制边框
    this.renderer.context.strokeStyle = this._darkenColor(item.config.color, 0.3);
    this.renderer.context.lineWidth = 2;
    this.renderer.context.stroke();
    
    // 金币特效：内部高光
    if (item.type === 'coin') {
      this.renderer.context.beginPath();
      this.renderer.context.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
      this.renderer.context.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.renderer.context.fill();
    }
  }
  
  /**
   * 渲染方形物品（如石块）
   */
  _renderItemSquare(x, y, item) {
    const size = item.getRenderRadius(this.cellSize) * 2; // 方形的边长
    const halfSize = size / 2;
    
    // 绘制物品主体
    this.renderer.context.fillStyle = item.config.color;
    this.renderer.context.fillRect(x - halfSize, y - halfSize, size, size);
    
    // 绘制边框
    this.renderer.context.strokeStyle = this._darkenColor(item.config.color, 0.3);
    this.renderer.context.lineWidth = 2;
    this.renderer.context.strokeRect(x - halfSize, y - halfSize, size, size);
  }
  
  /**
   * 渲染菱形物品（如种子）
   */
  _renderItemDiamond(x, y, item) {
    const radius = item.getRenderRadius(this.cellSize);
    
    // 绘制菱形
    this.renderer.context.beginPath();
    this.renderer.context.moveTo(x, y - radius);      // 上
    this.renderer.context.lineTo(x + radius, y);      // 右
    this.renderer.context.lineTo(x, y + radius);      // 下
    this.renderer.context.lineTo(x - radius, y);      // 左
    this.renderer.context.closePath();
    
    // 填充
    this.renderer.context.fillStyle = item.config.color;
    this.renderer.context.fill();
    
    // 边框
    this.renderer.context.strokeStyle = this._darkenColor(item.config.color, 0.3);
    this.renderer.context.lineWidth = 2;
    this.renderer.context.stroke();
    
    // 种子特效：中间的小点
    if (item.type === 'seed') {
      this.renderer.context.beginPath();
      this.renderer.context.arc(x, y, radius * 0.3, 0, Math.PI * 2);
      this.renderer.context.fillStyle = this._darkenColor(item.config.color, 0.5);
      this.renderer.context.fill();
    }
  }
  
  /**
   * 颜色加深工具函数
   */
  _darkenColor(color, factor) {
    // 简单的颜色加深实现
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const newR = Math.floor(r * (1 - factor));
      const newG = Math.floor(g * (1 - factor));
      const newB = Math.floor(b * (1 - factor));
      
      return `rgb(${newR}, ${newG}, ${newB})`;
    }
    return color;
  }
}