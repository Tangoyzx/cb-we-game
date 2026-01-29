import { Component } from '../../../core/ecs/Component.js';

/**
 * PlayerComponent 玩家组件
 * 标记该实体是玩家角色
 */
export class PlayerComponent extends Component {
  constructor() {
    super();
    
    // 玩家是否可以移动
    this.canMove = true;
  }
}
