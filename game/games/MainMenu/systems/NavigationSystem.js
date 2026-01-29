import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { ButtonComponent } from '../components/ButtonComponent.js';

/**
 * NavigationSystem 导航系统
 * 负责处理翻页逻辑
 */
export class NavigationSystem extends System {
  constructor(mainMenuGame) {
    super();
    this.mainMenuGame = mainMenuGame;
    this.requiredComponents = [PositionComponent, ButtonComponent];
  }
  
  update(deltaTime, entities) {
    // 翻页逻辑在MainMenuGame中处理
    // 这里可以添加翻页动画效果
  }
}
