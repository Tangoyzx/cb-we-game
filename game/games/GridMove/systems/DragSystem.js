import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { MovementComponent } from '../../../core/components/MovementComponent.js';
import { PlayerComponent } from '../components/PlayerComponent.js';

/**
 * DragSystem 拖拽系统
 * 处理玩家的拖拽控制
 */
export class DragSystem extends System {
  constructor(inputManager, gridSize, cellSize) {
    super();
    
    this.inputManager = inputManager;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    
    this.requiredComponents = [PositionComponent, MovementComponent, PlayerComponent];
    
    // 拖拽开始时的位置
    this.dragStartX = 0;
    this.dragStartY = 0;
    
    // 是否正在拖拽
    this.dragging = false;
    
    // 绑定输入事件
    this._bindInputEvents();
  }
  
  _bindInputEvents() {
    // 触摸开始
    this.inputManager.onTouchStart = (x, y) => {
      this.dragStartX = x;
      this.dragStartY = y;
      this.dragging = true;
    };
    
    // 触摸移动
    this.inputManager.onTouchMove = (x, y, dx, dy) => {
      if (!this.dragging) return;
      
      // 计算拖拽方向
      const offsetX = x - this.dragStartX;
      const offsetY = y - this.dragStartY;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      // 如果拖拽距离太小，不做处理
      if (distance < 20) return;
      
      // 获取拖拽方向（四个方向）
      const angle = Math.atan2(offsetY, offsetX);
      let direction = null;
      
      // 判断方向
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        direction = { x: 1, y: 0 }; // 右
      } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
        direction = { x: 0, y: 1 }; // 下
      } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
        direction = { x: 0, y: -1 }; // 上
      } else {
        direction = { x: -1, y: 0 }; // 左
      }
      
      // 应用移动方向
      this._applyMovement(direction);
      
      // 重置拖拽起点
      this.dragStartX = x;
      this.dragStartY = y;
    };
    
    // 触摸结束
    this.inputManager.onTouchEnd = () => {
      this.dragging = false;
    };
  }
  
  _applyMovement(direction) {
    // 这个方法会在update中被调用，存储方向供update使用
    this.currentDirection = direction;
  }
  
  update(deltaTime, entities) {
    if (!this.currentDirection) return;
    
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent);
      const movement = entity.getComponent(MovementComponent);
      const player = entity.getComponent(PlayerComponent);
      
      if (!player.canMove) continue;
      if (movement.moving) continue; // 如果正在移动，不接受新的移动指令
      
      // 计算移动速度向量
      const speed = movement.speed;
      movement.setVelocity(
        this.currentDirection.x * speed,
        this.currentDirection.y * speed
      );
      
      // 计算目标位置（向拖拽方向移动很远）
      const targetX = position.x + this.currentDirection.x * 10000;
      const targetY = position.y + this.currentDirection.y * 10000;
      
      // 限制在网格范围内
      const maxX = this.gridSize * this.cellSize;
      const maxY = this.gridSize * this.cellSize;
      
      movement.setTarget(
        Math.max(0, Math.min(maxX, targetX)),
        Math.max(0, Math.min(maxY, targetY))
      );
    }
    
    // 清除当前方向
    this.currentDirection = null;
  }
  
  destroy() {
    super.destroy();
    this.inputManager.onTouchStart = null;
    this.inputManager.onTouchMove = null;
    this.inputManager.onTouchEnd = null;
  }
}
