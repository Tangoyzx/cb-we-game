import { System } from '../ecs/System.js';
import { PositionComponent } from '../components/PositionComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';

/**
 * RenderSystem 渲染系统
 * 负责绘制所有拥有位置和渲染组件的实体
 * 
 * 这个系统遍历所有需要渲染的实体，根据它们的渲染组件画出来
 */
export class RenderSystem extends System {
  constructor(renderer) {
    super();
    
    // 渲染器
    this.renderer = renderer;
    
    // 需要的组件类型
    this.requiredComponents = [PositionComponent, RenderComponent];
  }
  
  /**
   * 更新系统
   * @param {number} deltaTime - 距离上一帧的时间
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    // 按照zIndex排序，zIndex大的后绘制（显示在上层）
    const sortedEntities = entities.slice().sort((a, b) => {
      const renderA = a.getComponent(RenderComponent);
      const renderB = b.getComponent(RenderComponent);
      return renderA.zIndex - renderB.zIndex;
    });
    
    // 绘制所有实体
    for (const entity of sortedEntities) {
      const position = entity.getComponent(PositionComponent);
      const render = entity.getComponent(RenderComponent);
      
      // 如果不可见，跳过
      if (!render.visible) continue;
      
      // 保存当前绘图状态
      this.renderer.save();
      
      // 设置透明度
      if (render.alpha < 1) {
        this.renderer.setAlpha(render.alpha);
      }
      
      // 根据渲染类型绘制
      switch (render.type) {
        case 'rect':
          this._drawRect(position, render);
          break;
        case 'circle':
          this._drawCircle(position, render);
          break;
        case 'image':
          this._drawImage(position, render);
          break;
        case 'text':
          this._drawText(position, render);
          break;
      }
      
      // 恢复绘图状态
      this.renderer.restore();
    }
  }
  
  /**
   * 绘制矩形
   * @private
   */
  _drawRect(position, render) {
    this.renderer.drawRect(
      position.x - render.width / 2,
      position.y - render.height / 2,
      render.width,
      render.height,
      render.color
    );
  }
  
  /**
   * 绘制圆形
   * @private
   */
  _drawCircle(position, render) {
    this.renderer.drawCircle(
      position.x,
      position.y,
      render.radius,
      render.color
    );
  }
  
  /**
   * 绘制图片
   * @private
   */
  _drawImage(position, render) {
    if (render.image) {
      this.renderer.drawImage(
        render.image,
        position.x - render.width / 2,
        position.y - render.height / 2,
        render.width,
        render.height
      );
    }
  }
  
  /**
   * 绘制文本
   * @private
   */
  _drawText(position, render) {
    this.renderer.drawText(
      render.text,
      position.x,
      position.y,
      render.color,
      render.fontSize,
      render.textAlign
    );
  }
}
