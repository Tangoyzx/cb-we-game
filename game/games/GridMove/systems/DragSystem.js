import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { MovementComponent } from '../../../core/components/MovementComponent.js';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { GridComponent } from '../components/GridComponent.js';
import { TerrainComponent } from '../components/TerrainComponent.js';

/**
 * DragSystem 拖拽系统
 * 处理玩家的拖拽控制
 */
export class DragSystem extends System {
  constructor(inputManager, gridSize, cellSize, game) {
    super();
    
    this.inputManager = inputManager;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.game = game;  // 保存游戏引用用于更新方向显示
    
    this.requiredComponents = [PositionComponent, MovementComponent, PlayerComponent];
    
    // 玩家实体引用（用于松手时对齐）
    this.playerEntity = null;
    
    // 地形组件缓存（用于地形检查）
    this.terrainComponent = null;
    
    // 拖拽开始时的位置
    this.dragStartX = 0;
    this.dragStartY = 0;
    
    // 当前触摸位置
    this.currentTouchX = 0;
    this.currentTouchY = 0;
    
    // 是否正在拖拽
    this.dragging = false;
    
    // 是否显示拖拽线（只有拖动距离够了才显示）
    this.showDragLine = false;
    
    // 下一个要执行的方向（用于网格间的排队）
    this.nextDirection = null;
    this.nextDirectionName = '无';
    
    // 当前正在执行的方向（用于判断是否需要重新设置目标）
    this.currentDirection = null;
    
    // 游戏区域偏移（由GridMoveGame设置）
    this.gameAreaTop = 0;
    
    // 绑定输入事件
    this._bindInputEvents();
  }
  
  _bindInputEvents() {
    // 触摸开始
    this.inputManager.onTouchStart = (x, y) => {
      // 检查是否在UI区域按下，如果是则不触发拖动
      if (this.game && this.game.uiManager && this.game.uiManager.isInUIArea(x, y)) {
        this.dragging = false;
        return;
      }
      
      this.dragStartX = x;
      this.dragStartY = y;
      this.currentTouchX = x;
      this.currentTouchY = y;
      this.dragging = true;
      this.showDragLine = false;  // 刚按下不显示线
    };
    
    // 触摸移动
    this.inputManager.onTouchMove = (x, y, dx, dy) => {
      if (!this.dragging) return;
      
      // 更新当前触摸位置
      this.currentTouchX = x;
      this.currentTouchY = y;
      
      // 计算拖拽方向
      const offsetX = x - this.dragStartX;
      const offsetY = y - this.dragStartY;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      // 降低触发距离阈值，提高响应速度
      if (distance < 10) return;
      
      // 距离够了才显示拖拽线
      this.showDragLine = true;
      
      // 获取拖拽方向（四个方向）
      const angle = Math.atan2(offsetY, offsetX);
      let direction = null;
      
      // 判断方向
      let directionName = '';
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        direction = { x: 1, y: 0 }; // 右
        directionName = '右';
      } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
        direction = { x: 0, y: 1 }; // 下
        directionName = '下';
      } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
        direction = { x: 0, y: -1 }; // 上
        directionName = '上';
      } else {
        direction = { x: -1, y: 0 }; // 左
        directionName = '左';
      }
      
      // 更新下一个方向（用于网格间的排队）
      this.nextDirection = direction;
      this.nextDirectionName = directionName;
      
      // 更新游戏中的方向显示
      if (this.game) {
        this.game.currentDirection = directionName;
      }
      
      // 不要重置拖拽起点，保持从按下点计算方向
      // this.dragStartX = x;
      // this.dragStartY = y;
    };
    
    // 触摸结束
    this.inputManager.onTouchEnd = () => {
      this.dragging = false;
      this.showDragLine = false;
      this.nextDirection = null;  // 清除方向，但不强制停止
      this.nextDirectionName = '无';
      this.currentDirection = null;  // 重置当前方向
      
      // 重置方向显示
      if (this.game) {
        this.game.currentDirection = '无';
      }
      
      // 不要强制对齐！让角色自然移动到当前目标格子
      // this._snapToGridCenter();
    };
  }
  
  update(deltaTime, entities) {
    // 获取地形组件（第一次获取时缓存）
    if (!this.terrainComponent) {
      // 从世界中查找地形实体
      const world = entities[0]?.world || this.game?.world;
      if (world && world.getEntitiesWithComponent) {
        const terrainEntities = world.getEntitiesWithComponent(TerrainComponent);
        if (terrainEntities.length > 0) {
          this.terrainComponent = terrainEntities[0].getComponent(TerrainComponent);
          console.log('DragSystem: 地形组件已缓存');
        }
      }
    }
    
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent);
      const movement = entity.getComponent(MovementComponent);
      const player = entity.getComponent(PlayerComponent);
      const grid = entity.getComponent(GridComponent);
      
      if (!player.canMove) continue;
      
      // 保存玩家实体引用
      this.playerEntity = entity;
      
      // 2. 如果没有下一个方向
      if (!this.nextDirection) {
        // 如果角色还在移动，让它继续移动到目标格子（不要立即停止）
        if (movement.moving && movement.targetX !== null) {
          // 继续移动，直到到达目标
          continue;
        } else {
          // 已经到达目标或没有目标，更新网格坐标并停止移动
          this._updateGridPosition(position, grid);
          movement.clearTarget();
          movement.stop();
          continue;
        }
      }
      
      // 3. 检查是否在网格中心
      const isAtGridCenter = this._isAtGridCenter(position, grid);
      
      // 4. 如果在格子中心，或者没有在移动，立即响应新方向
      if (isAtGridCenter || !movement.moving) {
        // 先更新网格坐标（确保基于正确的当前位置）
        this._updateGridPosition(position, grid);
        
        // 计算目标格子
        const targetGridX = grid.gridX + this.nextDirection.x;
        const targetGridY = grid.gridY + this.nextDirection.y;
        
        // 限制在网格范围内
        const clampedGridX = Math.max(0, Math.min(this.gridSize - 1, targetGridX));
        const clampedGridY = Math.max(0, Math.min(this.gridSize - 1, targetGridY));
        
        // 如果到达边界无法继续移动，停止
        if (clampedGridX === grid.gridX && clampedGridY === grid.gridY) {
          movement.clearTarget();
          movement.stop();
          this.currentDirection = null;
          continue;
        }
        
        // 🌊 地形检查：检查目标位置是否可行走
        if (this.terrainComponent) {
          if (!this.terrainComponent.canMoveTo(grid.gridX, grid.gridY, clampedGridX, clampedGridY)) {
            // 无法移动到目标位置（比如水域），停止移动并提供反馈
            movement.clearTarget();
            movement.stop();
            this.currentDirection = null;
            
            // 更新游戏中的方向显示
            if (this.game) {
              this.game.currentDirection = '阻挡'; // 显示被阻挡
            }
            
            console.log(`无法移动到 (${clampedGridX}, ${clampedGridY}): 地形阻挡`);
            continue;
          }
        }
        
        // 检查方向是否改变
        const directionChanged = !this.currentDirection || 
                                 this.currentDirection.x !== this.nextDirection.x || 
                                 this.currentDirection.y !== this.nextDirection.y;
        
        // 只有方向改变时才重新设置速度和目标
        if (directionChanged) {
          // 计算目标像素位置
          const targetX = clampedGridX * this.cellSize + this.cellSize / 2;
          const targetY = clampedGridY * this.cellSize + this.cellSize / 2;
          
          // 设置速度和目标
          const speed = movement.speed;
          movement.setVelocity(
            this.nextDirection.x * speed,
            this.nextDirection.y * speed
          );
          movement.setTarget(targetX, targetY);
          
          // 更新当前方向
          this.currentDirection = { x: this.nextDirection.x, y: this.nextDirection.y };
        } else {
          // 方向相同，只需更新目标位置（保持流畅移动）
          const targetX = clampedGridX * this.cellSize + this.cellSize / 2;
          const targetY = clampedGridY * this.cellSize + this.cellSize / 2;
          movement.setTarget(targetX, targetY);
        }
      }
      // 5. 如果不在格子中心且在移动，继续当前移动，等待到达格子中心
      // 注意：移动中不要更新grid坐标，避免目标突变！
    }
  }
  
  /**
   * 强制对齐到最近的格子中心
   * @private
   */
  _snapToGridCenter() {
    // 使用保存的玩家实体引用
    if (!this.playerEntity) return;
    
    const position = this.playerEntity.getComponent(PositionComponent);
    const grid = this.playerEntity.getComponent(GridComponent);
    const movement = this.playerEntity.getComponent(MovementComponent);
    
    if (!position || !grid || !movement) return;
    
    // 更新网格坐标
    this._updateGridPosition(position, grid);
    
    // 计算格子中心位置
    const centerX = grid.gridX * this.cellSize + this.cellSize / 2;
    const centerY = grid.gridY * this.cellSize + this.cellSize / 2;
    
    // 直接移动到格子中心
    position.x = centerX;
    position.y = centerY;
    
    // 确保停止移动
    movement.clearTarget();
    movement.stop();
  }
  
  /**
   * 更新网格坐标（根据像素位置）
   * @private
   */
  _updateGridPosition(position, grid) {
    const newGridX = Math.floor(position.x / this.cellSize);
    const newGridY = Math.floor(position.y / this.cellSize);
    
    // 限制在网格范围内
    grid.gridX = Math.max(0, Math.min(this.gridSize - 1, newGridX));
    grid.gridY = Math.max(0, Math.min(this.gridSize - 1, newGridY));
  }
  
  /**
   * 检查是否在网格中心
   * @private
   */
  _isAtGridCenter(position, grid) {
    const centerX = grid.gridX * this.cellSize + this.cellSize / 2;
    const centerY = grid.gridY * this.cellSize + this.cellSize / 2;
    const distance = Math.sqrt(
      Math.pow(position.x - centerX, 2) + 
      Math.pow(position.y - centerY, 2)
    );
    return distance < 3; // 降低误差范围，与GridSystem保持一致
  }
  
  destroy() {
    super.destroy();
    this.inputManager.onTouchStart = null;
    this.inputManager.onTouchMove = null;
    this.inputManager.onTouchEnd = null;
  }
}
