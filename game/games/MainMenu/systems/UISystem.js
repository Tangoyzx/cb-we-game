import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { RenderComponent } from '../../../core/components/RenderComponent.js';
import { UIComponent } from '../components/UIComponent.js';

/**
 * UISystem UI系统
 * 负责渲染主菜单的UI元素
 */
export class UISystem extends System {
  constructor(renderer) {
    super();
    this.renderer = renderer;
    this.requiredComponents = [PositionComponent, RenderComponent, UIComponent];
  }
  
  update(deltaTime, entities) {
    // UI元素由RenderSystem统一渲染
    // 这里可以添加一些UI特有的更新逻辑，比如动画效果
  }
}
