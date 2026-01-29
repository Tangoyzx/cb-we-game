import { System } from '../ecs/System.js';
import { PositionComponent } from '../components/PositionComponent.js';
import { InputComponent } from '../components/InputComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';

/**
 * InputSystem 输入系统
 * 负责处理实体的触摸交互
 * 
 * 这个系统检测玩家的触摸操作，并分发给对应的实体
 */
export class InputSystem extends System {
  constructor(inputManager) {
    super();
    
    // 输入管理器
    this.inputManager = inputManager;
    
    // 需要的组件类型
    this.requiredComponents = [PositionComponent, InputComponent];
    
    // 当前被触摸的实体
    this.touchedEntity = null;
    
    // 绑定输入事件
    this._bindInputEvents();
  }
  
  /**
   * 绑定输入事件
   * @private
   */
  _bindInputEvents() {
    // 触摸开始
    this.inputManager.onTouchStart = (x, y) => {
      this._handleTouchStart(x, y);
    };
    
    // 触摸移动
    this.inputManager.onTouchMove = (x, y, dx, dy) => {
      this._handleTouchMove(x, y, dx, dy);
    };
    
    // 触摸结束
    this.inputManager.onTouchEnd = (x, y) => {
      this._handleTouchEnd(x, y);
    };
  }
  
  /**
   * 更新系统
   * @param {number} deltaTime - 距离上一帧的时间
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    // 存储实体列表供事件处理使用
    this.entities = entities;
  }
  
  /**
   * 处理触摸开始
   * @private
   */
  _handleTouchStart(x, y) {
    if (!this.entities) return;
    
    // 从后往前遍历（优先处理zIndex高的实体）
    const sortedEntities = this._sortEntitiesByZIndex(this.entities);
    
    for (const entity of sortedEntities) {
      const position = entity.getComponent(PositionComponent);
      const input = entity.getComponent(InputComponent);
      
      if (!input.touchable) continue;
      
      // 检查触摸点是否在实体范围内
      if (this._isTouchInEntity(x, y, entity)) {
        this.touchedEntity = entity;
        
        // 如果实体可拖拽，标记为拖拽中
        if (input.draggable) {
          input.dragging = true;
        }
        
        // 调用回调
        if (input.onTouchStart) {
          input.onTouchStart(x, y, entity);
        }
        
        break; // 只处理最上层的实体
      }
    }
  }
  
  /**
   * 处理触摸移动
   * @private
   */
  _handleTouchMove(x, y, dx, dy) {
    if (!this.touchedEntity) return;
    
    const input = this.touchedEntity.getComponent(InputComponent);
    
    if (input.dragging) {
      const position = this.touchedEntity.getComponent(PositionComponent);
      position.move(dx, dy);
    }
    
    // 调用回调
    if (input.onTouchMove) {
      input.onTouchMove(x, y, dx, dy, this.touchedEntity);
    }
  }
  
  /**
   * 处理触摸结束
   * @private
   */
  _handleTouchEnd(x, y) {
    if (!this.touchedEntity) return;
    
    const input = this.touchedEntity.getComponent(InputComponent);
    
    // 取消拖拽状态
    if (input.dragging) {
      input.dragging = false;
    }
    
    // 调用回调
    if (input.onTouchEnd) {
      input.onTouchEnd(x, y, this.touchedEntity);
    }
    
    this.touchedEntity = null;
  }
  
  /**
   * 检查触摸点是否在实体范围内
   * @private
   */
  _isTouchInEntity(x, y, entity) {
    const position = entity.getComponent(PositionComponent);
    const render = entity.getComponent(RenderComponent);
    
    if (!render) return false;
    
    // 根据渲染类型判断
    if (render.type === 'rect') {
      return x >= position.x - render.width / 2 &&
             x <= position.x + render.width / 2 &&
             y >= position.y - render.height / 2 &&
             y <= position.y + render.height / 2;
    } else if (render.type === 'circle') {
      const dx = x - position.x;
      const dy = y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= render.radius;
    }
    
    return false;
  }
  
  /**
   * 按zIndex排序实体
   * @private
   */
  _sortEntitiesByZIndex(entities) {
    return entities.slice().sort((a, b) => {
      const renderA = a.getComponent(RenderComponent);
      const renderB = b.getComponent(RenderComponent);
      const zIndexA = renderA ? renderA.zIndex : 0;
      const zIndexB = renderB ? renderB.zIndex : 0;
      return zIndexB - zIndexA; // 从大到小排序
    });
  }
  
  /**
   * 销毁系统
   */
  destroy() {
    super.destroy();
    this.touchedEntity = null;
    this.entities = null;
  }
}
