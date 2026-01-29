/**
 * World ECS世界管理器
 * 统一管理所有的实体和系统
 * 
 * 什么是World？
 * World就像一个"游戏世界的管理员"
 * 它知道游戏里有哪些角色（实体），有哪些工作人员（系统）
 * 每一帧都让所有工作人员去处理它们负责的角色
 */
export class World {
  constructor() {
    // 存储所有实体
    this.entities = [];
    
    // 存储所有系统
    this.systems = [];
    
    // 上一帧的时间戳
    this.lastTime = Date.now();
  }
  
  /**
   * 创建一个新实体
   * @returns {Entity} 新创建的实体
   */
  createEntity() {
    const Entity = require('./Entity.js').Entity;
    const entity = new Entity();
    this.entities.push(entity);
    return entity;
  }
  
  /**
   * 添加实体到世界
   * @param {Entity} entity - 要添加的实体
   */
  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
    }
    return this;
  }
  
  /**
   * 从世界中移除实体
   * @param {Entity} entity - 要移除的实体
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      // 销毁实体
      entity.destroy();
      // 从数组中移除
      this.entities.splice(index, 1);
    }
    return this;
  }
  
  /**
   * 根据ID查找实体
   * @param {number} id - 实体ID
   * @returns {Entity|null}
   */
  getEntityById(id) {
    return this.entities.find(entity => entity.id === id) || null;
  }
  
  /**
   * 获取拥有指定组件的所有实体
   * @param {Function} ComponentClass - 组件类
   * @returns {Array<Entity>}
   */
  getEntitiesWithComponent(ComponentClass) {
    return this.entities.filter(entity => 
      entity.active && entity.hasComponent(ComponentClass)
    );
  }
  
  /**
   * 注册系统
   * @param {System} system - 要注册的系统
   */
  registerSystem(system) {
    this.systems.push(system);
    system.init();
    return this;
  }
  
  /**
   * 移除系统
   * @param {System} system - 要移除的系统
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      system.destroy();
      this.systems.splice(index, 1);
    }
    return this;
  }
  
  /**
   * 更新世界
   * 调用所有系统的update方法
   */
  update() {
    // 计算距离上一帧的时间
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 更新所有激活的系统
    for (const system of this.systems) {
      if (!system.enabled) continue;
      
      // 找出符合该系统要求的所有实体
      const matchingEntities = this.entities.filter(entity => 
        entity.active && system.matchesEntity(entity)
      );
      
      // 调用系统的update方法
      system.update(deltaTime, matchingEntities);
    }
    
    // 清理已销毁的实体
    this.entities = this.entities.filter(entity => entity.active);
  }
  
  /**
   * 清空世界
   * 移除所有实体和系统
   */
  clear() {
    // 销毁所有实体
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities = [];
    
    // 销毁所有系统
    for (const system of this.systems) {
      system.destroy();
    }
    this.systems = [];
  }
  
  /**
   * 销毁世界
   */
  destroy() {
    this.clear();
  }
}
