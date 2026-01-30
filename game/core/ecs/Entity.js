/**
 * Entity 实体类
 * 实体是游戏中的对象，通过组合不同的组件来定义它的特性
 * 
 * 什么是实体？
 * 可以把它想象成一个"空盒子"，你可以往里面放各种"标签"（组件）
 * 比如：一个玩家实体 = 位置组件 + 渲染组件 + 输入组件 + 移动组件
 */

// 用于生成唯一的实体ID
let nextEntityId = 1;

export class Entity {
  constructor() {
    // 每个实体都有一个唯一的ID
    this.id = nextEntityId++;
    
    // 存储该实体的所有组件
    // 使用Map可以快速通过组件类型查找组件
    this.components = new Map();
    
    // 标记实体是否激活
    this.active = true;
  }
  
  /**
   * 添加组件到实体
   * @param {Component} component - 要添加的组件实例
   */
  addComponent(component) {
    // 使用组件的构造函数作为key（而不是类名字符串）
    // 这样可以避免代码压缩后类名变化导致的问题
    const ComponentClass = component.constructor;
    
    // 将组件存储到Map中
    this.components.set(ComponentClass, component);
    
    // 设置组件所属的实体ID
    component.entityId = this.id;
    
    // 初始化组件
    component.init();
    
    return this;
  }
  
  /**
   * 获取指定类型的组件
   * @param {Function} ComponentClass - 组件的类
   * @returns {Component|null} 组件实例或null
   */
  getComponent(ComponentClass) {
    return this.components.get(ComponentClass) || null;
  }
  
  /**
   * 检查实体是否拥有指定类型的组件
   * @param {Function} ComponentClass - 组件的类
   * @returns {boolean}
   */
  hasComponent(ComponentClass) {
    return this.components.has(ComponentClass);
  }
  
  /**
   * 移除指定类型的组件
   * @param {Function} ComponentClass - 组件的类
   */
  removeComponent(ComponentClass) {
    const component = this.components.get(ComponentClass);
    
    if (component) {
      // 调用组件的销毁方法
      component.destroy();
      // 从Map中移除
      this.components.delete(ComponentClass);
    }
    
    return this;
  }
  
  /**
   * 销毁实体，移除所有组件
   */
  destroy() {
    // 销毁所有组件
    for (const component of this.components.values()) {
      component.destroy();
    }
    
    // 清空组件Map
    this.components.clear();
    
    // 标记为非激活
    this.active = false;
  }
}
