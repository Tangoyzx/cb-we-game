import { System } from '../ecs/System.js';
import { PositionComponent } from '../components/PositionComponent.js';
import { MovementComponent } from '../components/MovementComponent.js';

/**
 * MovementSystem 移动系统
 * 负责更新所有拥有位置和移动组件的实体的位置
 * 
 * 这个系统根据实体的速度和方向，每帧更新它们的位置
 */
export class MovementSystem extends System {
  constructor() {
    super();
    
    // 需要的组件类型
    this.requiredComponents = [PositionComponent, MovementComponent];
  }
  
  /**
   * 更新系统
   * @param {number} deltaTime - 距离上一帧的时间（毫秒）
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    // 转换为秒
    const deltaSeconds = deltaTime / 1000;
    
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent);
      const movement = entity.getComponent(MovementComponent);
      
      // 如果有目标位置，向目标移动
      if (movement.targetX !== null && movement.targetY !== null) {
        this._moveToTarget(position, movement, deltaSeconds);
      } 
      // 否则根据速度向量移动
      else if (movement.velocityX !== 0 || movement.velocityY !== 0) {
        position.x += movement.velocityX * deltaSeconds;
        position.y += movement.velocityY * deltaSeconds;
      }
    }
  }
  
  /**
   * 向目标位置移动
   * @private
   */
  _moveToTarget(position, movement, deltaSeconds) {
    // 计算到目标的向量
    const dx = movement.targetX - position.x;
    const dy = movement.targetY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果已经很接近目标，直接到达
    if (distance < 1) {
      position.x = movement.targetX;
      position.y = movement.targetY;
      movement.clearTarget();
      return;
    }
    
    // 计算这一帧应该移动的距离
    const moveDistance = movement.speed * deltaSeconds;
    
    // 如果这一帧就能到达目标
    if (moveDistance >= distance) {
      position.x = movement.targetX;
      position.y = movement.targetY;
      movement.clearTarget();
    } else {
      // 按比例移动
      const ratio = moveDistance / distance;
      position.x += dx * ratio;
      position.y += dy * ratio;
    }
  }
}
