import { System } from '../ecs/System.js';
import { AnimationComponent } from '../components/AnimationComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { MovementComponent } from '../components/MovementComponent.js';
import { PositionComponent } from '../components/PositionComponent.js';

/**
 * AnimationSystem 动画系统
 * 处理动画更新、状态驱动和渲染集成
 * 
 * 这个系统让角色根据移动状态自动播放对应的动画，就像给角色装上了智能大脑！
 */
export class AnimationSystem extends System {
  constructor() {
    super();
    
    // 系统需要的组件类型
    this.requiredComponents = [AnimationComponent, RenderComponent];
    
    // 系统配置
    this.enabled = true;
    this.debug = false;
    
    // 方向映射：从移动向量到动画方向
    this.directionMap = {
      'up': 'up',
      'down': 'down', 
      'left': 'left',
      'right': 'right'
    };
    
    // 动画优先级（数字越大优先级越高）
    this.animationPriority = {
      'walk': 10,
      'idle': 1
    };
    
    // 状态缓存，避免重复计算
    this.entityStates = new Map();
    
    // 性能统计
    this.stats = {
      entitiesProcessed: 0,
      animationsUpdated: 0,
      stateChanges: 0
    };
  }

  /**
   * 更新系统
   * @param {number} deltaTime - 距离上一帧的时间（毫秒）
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    if (!this.enabled) return;
    
    // 重置统计
    this.stats.entitiesProcessed = entities.length;
    this.stats.animationsUpdated = 0;
    this.stats.stateChanges = 0;
    
    for (const entity of entities) {
      this._updateEntityAnimation(entity, deltaTime);
    }
    
    if (this.debug && entities.length > 0) {
      console.log(`🎬 AnimationSystem更新: ${this.stats.entitiesProcessed}个实体, ${this.stats.animationsUpdated}个动画更新, ${this.stats.stateChanges}个状态变化`);
    }
  }

  /**
   * 更新单个实体的动画
   * @param {Entity} entity - 实体
   * @param {number} deltaTime - 时间增量
   * @private
   */
  _updateEntityAnimation(entity, deltaTime) {
    const animationComp = entity.getComponent(AnimationComponent);
    const renderComp = entity.getComponent(RenderComponent);
    
    // 1. 更新动画组件的时间逻辑
    animationComp.update(deltaTime);
    this.stats.animationsUpdated++;
    
    // 2. 根据实体状态选择合适的动画
    this._updateAnimationState(entity);
    
    // 3. 将当前动画帧应用到渲染组件
    this._updateRenderComponent(animationComp, renderComp);
  }

  /**
   * 根据实体状态更新动画
   * @param {Entity} entity - 实体
   * @private
   */
  _updateAnimationState(entity) {
    const animationComp = entity.getComponent(AnimationComponent);
    const movementComp = entity.getComponent(MovementComponent);
    
    // 分析当前状态
    const currentState = this._analyzeEntityState(entity);
    const entityId = entity.id;
    
    // 检查状态是否发生变化
    const previousState = this.entityStates.get(entityId);
    if (this._stateEquals(currentState, previousState)) {
      return; // 状态没有变化，不需要更新动画
    }
    
    // 保存新状态
    this.entityStates.set(entityId, { ...currentState });
    this.stats.stateChanges++;
    
    // 根据新状态选择动画
    const { animationType, direction } = this._selectAnimation(currentState);
    
    // 播放新动画
    if (animationType && animationComp.hasAnimation(animationType, direction)) {
      const shouldRestart = animationComp.currentAnimation !== animationType || 
                           animationComp.currentDirection !== direction;
      
      if (shouldRestart) {
        animationComp.play(animationType, direction, { 
          loop: true,
          restart: true 
        });
        
        if (this.debug) {
          console.log(`🎭 实体${entityId}切换动画: ${animationType}-${direction}`);
        }
      }
    } else if (this.debug) {
      console.warn(`⚠️ 实体${entityId}缺少动画: ${animationType}-${direction}`);
    }
  }

  /**
   * 分析实体当前状态
   * @param {Entity} entity - 实体
   * @returns {Object} 状态对象
   * @private
   */
  _analyzeEntityState(entity) {
    const movementComp = entity.getComponent(MovementComponent);
    const positionComp = entity.getComponent(PositionComponent);
    
    const state = {
      isMoving: false,
      direction: 'down',
      speed: 0,
      hasTarget: false
    };
    
    if (movementComp) {
      state.isMoving = movementComp.moving;
      state.speed = movementComp.speed;
      state.hasTarget = movementComp.targetX !== null && movementComp.targetY !== null;
      
      // 计算移动方向
      if (state.isMoving || state.hasTarget) {
        state.direction = this._calculateDirection(movementComp, positionComp);
      }
    }
    
    return state;
  }

  /**
   * 计算移动方向
   * @param {MovementComponent} movementComp - 移动组件
   * @param {PositionComponent} positionComp - 位置组件
   * @returns {string} 方向字符串
   * @private
   */
  _calculateDirection(movementComp, positionComp) {
    let directionX = 0;
    let directionY = 0;
    
    // 优先使用目标位置计算方向
    if (movementComp.targetX !== null && movementComp.targetY !== null && positionComp) {
      directionX = movementComp.targetX - positionComp.x;
      directionY = movementComp.targetY - positionComp.y;
    } 
    // 其次使用速度向量
    else if (movementComp.velocityX !== 0 || movementComp.velocityY !== 0) {
      directionX = movementComp.velocityX;
      directionY = movementComp.velocityY;
    }
    
    // 确定主要方向（优先考虑Y轴，符合俯视角游戏习惯）
    if (Math.abs(directionY) > Math.abs(directionX)) {
      return directionY > 0 ? 'down' : 'up';
    } else if (Math.abs(directionX) > 0) {
      return directionX > 0 ? 'right' : 'left';
    }
    
    return 'down'; // 默认方向
  }

  /**
   * 根据状态选择动画
   * @param {Object} state - 实体状态
   * @returns {Object} 动画选择结果 {animationType, direction}
   * @private
   */
  _selectAnimation(state) {
    let animationType = 'idle'; // 默认站立动画
    
    // 根据移动状态选择动画类型
    if (state.isMoving || state.hasTarget) {
      animationType = 'walk';
    }
    
    return {
      animationType,
      direction: state.direction
    };
  }

  /**
   * 比较两个状态是否相等
   * @param {Object} state1 - 状态1
   * @param {Object} state2 - 状态2
   * @returns {boolean} 是否相等
   * @private
   */
  _stateEquals(state1, state2) {
    if (!state1 || !state2) return false;
    
    return state1.isMoving === state2.isMoving &&
           state1.direction === state2.direction &&
           state1.hasTarget === state2.hasTarget;
  }

  /**
   * 更新渲染组件
   * @param {AnimationComponent} animationComp - 动画组件
   * @param {RenderComponent} renderComp - 渲染组件
   * @private
   */
  _updateRenderComponent(animationComp, renderComp) {
    const currentFrame = animationComp.getCurrentFrame();
    
    if (currentFrame) {
      // 切换到图片渲染模式
      renderComp.type = 'image';
      renderComp.image = currentFrame;
      
      // 设置图片尺寸（如果需要）
      if (currentFrame.width && currentFrame.height) {
        renderComp.width = currentFrame.width;
        renderComp.height = currentFrame.height;
      }
    } else if (this.debug) {
      console.warn('⚠️ 动画组件没有当前帧');
    }
  }

  /**
   * 为实体设置动画数据
   * @param {Entity} entity - 实体
   * @param {Object} animationsData - 动画数据
   */
  setupEntityAnimations(entity, animationsData) {
    const animationComp = entity.getComponent(AnimationComponent);
    
    if (animationComp) {
      animationComp.addAnimations(animationsData);
      
      // 默认播放站立动画
      if (animationComp.hasAnimation('idle', 'down')) {
        animationComp.play('idle', 'down');
      }
      
      if (this.debug) {
        console.log(`🎨 为实体${entity.id}设置动画数据`);
      }
    }
  }

  /**
   * 强制实体播放指定动画
   * @param {Entity} entity - 实体
   * @param {string} animationType - 动画类型
   * @param {string} direction - 方向
   * @param {Object} options - 播放选项
   */
  playEntityAnimation(entity, animationType, direction, options = {}) {
    const animationComp = entity.getComponent(AnimationComponent);
    
    if (animationComp) {
      animationComp.play(animationType, direction, options);
      
      if (this.debug) {
        console.log(`🎬 强制播放动画: 实体${entity.id} ${animationType}-${direction}`);
      }
    }
  }

  /**
   * 获取实体当前动画信息
   * @param {Entity} entity - 实体
   * @returns {Object|null} 动画信息
   */
  getEntityAnimationInfo(entity) {
    const animationComp = entity.getComponent(AnimationComponent);
    return animationComp ? animationComp.getAnimationInfo() : null;
  }

  /**
   * 启用/禁用调试模式
   * @param {boolean} enabled - 是否启用
   */
  setDebug(enabled) {
    this.debug = enabled;
    console.log(`🐛 AnimationSystem调试模式: ${enabled ? '开启' : '关闭'}`);
  }

  /**
   * 获取系统统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cachedStates: this.entityStates.size,
      enabled: this.enabled
    };
  }

  /**
   * 清理实体状态缓存
   * @param {Entity} entity - 要清理的实体（可选，不传则清理所有）
   */
  clearEntityState(entity = null) {
    if (entity) {
      this.entityStates.delete(entity.id);
    } else {
      this.entityStates.clear();
    }
  }

  /**
   * 销毁系统，清理资源
   */
  destroy() {
    this.entityStates.clear();
    this.stats = { entitiesProcessed: 0, animationsUpdated: 0, stateChanges: 0 };
    
    if (this.debug) {
      console.log('💥 AnimationSystem已销毁');
    }
  }
}