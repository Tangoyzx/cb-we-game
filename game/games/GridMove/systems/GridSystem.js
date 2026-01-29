import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { MovementComponent } from '../../../core/components/MovementComponent.js';
import { GridComponent } from '../components/GridComponent.js';
import { TerrainComponent } from '../components/TerrainComponent.js';

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
    
    // 地形组件缓存
    this.terrainComponent = null;
  }
  
  update(deltaTime, entities) {
    // 获取地形组件（第一次获取时缓存）
    if (!this.terrainComponent) {
      const world = entities[0]?.world;
      if (world && world.getEntitiesWithComponent) {
        const terrainEntities = world.getEntitiesWithComponent(TerrainComponent);
        if (terrainEntities.length > 0) {
          this.terrainComponent = terrainEntities[0].getComponent(TerrainComponent);
          console.log('GridSystem: 地形组件已缓存');
        }
      }
    }
    
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
        if (distance < 3) {  // 提高阈值，减少停顿感
          // ⚠️ 不要使用Math.round，直接使用目标位置计算网格坐标
          // 这样可以避免纵向坐标被意外改变
          const targetGridX = Math.floor(movement.targetX / this.cellSize);
          const targetGridY = Math.floor(movement.targetY / this.cellSize);
          
          // 限制在网格范围内
          grid.gridX = Math.max(0, Math.min(this.gridSize - 1, targetGridX));
          grid.gridY = Math.max(0, Math.min(this.gridSize - 1, targetGridY));
          
          // 🌊 安全检查：确保最终位置是可行走的
          if (this.terrainComponent && !this.terrainComponent.isWalkable(grid.gridX, grid.gridY)) {
            console.warn(`GridSystem: 角色尝试停在不可行走的位置 (${grid.gridX}, ${grid.gridY})，回退到上一个位置`);
            // 这种情况理论上不应该发生，因为DragSystem已经做了检查
            // 但作为安全措施，我们可以停止移动而不更新位置
            movement.clearTarget();
            movement.stop();
            continue;
          }
          
          // 直接对齐到目标位置（而不是重新计算）
          position.x = movement.targetX;
          position.y = movement.targetY;
          
          // 停止移动
          movement.clearTarget();
          movement.stop();
        }
      }
    }
  }
}
