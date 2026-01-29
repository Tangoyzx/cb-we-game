/**
 * System 系统基类
 * 系统负责处理游戏逻辑，操作具有特定组件的实体
 * 
 * 什么是系统？
 * 系统就像"工作人员"，专门处理特定类型的任务
 * 比如：移动系统负责移动所有能移动的实体，渲染系统负责画出所有能看见的实体
 */
export class System {
  constructor() {
    // 系统需要处理的组件类型列表
    // 子类需要在构造函数中设置这个数组
    this.requiredComponents = [];
    
    // 系统是否激活
    this.enabled = true;
  }
  
  /**
   * 检查实体是否符合系统的要求
   * @param {Entity} entity - 要检查的实体
   * @returns {boolean}
   */
  matchesEntity(entity) {
    // 检查实体是否拥有所有必需的组件
    return this.requiredComponents.every(ComponentClass => 
      entity.hasComponent(ComponentClass)
    );
  }
  
  /**
   * 更新系统逻辑
   * @param {number} deltaTime - 距离上一帧的时间（毫秒）
   * @param {Array<Entity>} entities - 符合条件的实体列表
   */
  update(deltaTime, entities) {
    // 子类必须实现这个方法
    throw new Error('System.update() must be implemented by subclass');
  }
  
  /**
   * 系统初始化
   * 可以在这里做一些准备工作
   */
  init() {
    // 子类可以重写这个方法
  }
  
  /**
   * 系统销毁
   * 清理系统使用的资源
   */
  destroy() {
    // 子类可以重写这个方法
  }
}
