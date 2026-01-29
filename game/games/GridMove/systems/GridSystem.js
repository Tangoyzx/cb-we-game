import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { MovementComponent } from '../../../core/components/MovementComponent.js';
import { GridComponent } from '../components/GridComponent.js';

/**
 * GridSystem 网格系统
 * 负责网格对齐和网格内的移动逻辑
 */
export class GridSystem extends System {
  constructor(gridSize, cellSize) {
    super();
    
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    
    this.requiredComponents = [PositionComponent, GridComponent, MovementComponent];
  }
  
  update(deltaTime, entities) {
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent);
      const grid = entity.getComponent(GridComponent);
      const movement = entity.getComponent(MovementComponent);
      
      // 如果实体正在移动
      if (movement.moving && movement.targetX !== null) {
        // 检查是否到达目标位置
        const dx = movement.targetX - position.x;
        const dy = movement.targetY - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果已经很接近目标，对齐到网格
        if (distance < 1) {
          // 计算最近的网格点
          const nearestGridX = Math.round(position.x / this.cellSize);
          const nearestGridY = Math.round(position.y / this.cellSize);
          
          // 限制在网格范围内
          grid.gridX = Math.max(0, Math.min(this.gridSize - 1, nearestGridX));
          grid.gridY = Math.max(0, Math.min(this.gridSize - 1, nearestGridY));
          
          // 对齐到网格中心
          position.x = grid.gridX * this.cellSize + this.cellSize / 2;
          position.y = grid.gridY * this.cellSize + this.cellSize / 2;
          
          // 停止移动
          movement.clearTarget();
          movement.stop();
        }
      }
    }
  }
}
