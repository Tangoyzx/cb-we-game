import { System } from '../../../core/ecs/System.js';
import { PositionComponent } from '../../../core/components/PositionComponent.js';
import { GridComponent } from '../components/GridComponent.js';
import { PlayerComponent } from '../components/PlayerComponent.js';
import { ItemComponent } from '../components/ItemComponent.js';
import { InventoryComponent } from '../components/InventoryComponent.js';

/**
 * CollectionSystem 收集系统
 * 处理玩家与物品的碰撞检测和收集逻辑
 * 
 * 什么是CollectionSystem？
 * 就像游戏中的"捡东西"功能！当你的角色走到金币或种子上时，
 * 这个系统会自动检测到，然后把物品放到你的背包里！
 */
export class CollectionSystem extends System {
  constructor(gridSize, cellSize) {
    super();
    
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    
    // 这个系统需要处理玩家实体和物品实体
    this.requiredComponents = [];
    
    // 收集音效（暂时用控制台输出代替）
    this.collectSoundEnabled = true;
  }
  
  /**
   * 系统主更新循环
   * 每帧都会检查玩家是否碰到了可收集的物品
   */
  update(deltaTime, entities) {
    // 找到玩家实体
    const playerEntity = this._findPlayerEntity(entities);
    if (!playerEntity) return;
    
    // 获取玩家的网格位置
    const playerGrid = playerEntity.getComponent(GridComponent);
    if (!playerGrid) return;
    
    // 找到所有物品实体
    const itemEntities = this._findItemEntities(entities);
    if (itemEntities.length === 0) return;
    
    // 检查玩家是否与任何物品发生碰撞
    this._checkCollisions(playerEntity, itemEntities);
  }
  
  /**
   * 查找玩家实体
   */
  _findPlayerEntity(entities) {
    for (const entity of entities) {
      if (entity.hasComponent(PlayerComponent) && 
          entity.hasComponent(GridComponent) &&
          entity.hasComponent(InventoryComponent)) {
        return entity;
      }
    }
    return null;
  }
  
  /**
   * 查找所有物品实体
   */
  _findItemEntities(entities) {
    const items = [];
    for (const entity of entities) {
      if (entity.hasComponent(ItemComponent) && 
          entity.hasComponent(PositionComponent)) {
        items.push(entity);
      }
    }
    return items;
  }
  
  /**
   * 检查碰撞并处理收集
   */
  _checkCollisions(playerEntity, itemEntities) {
    const playerGrid = playerEntity.getComponent(GridComponent);
    const playerInventory = playerEntity.getComponent(InventoryComponent);
    
    for (const itemEntity of itemEntities) {
      const itemComponent = itemEntity.getComponent(ItemComponent);
      
      // 跳过已收集的物品
      if (itemComponent.collected) continue;
      
      // 跳过不可收集的物品
      if (!itemComponent.canBeCollected()) continue;
      
      // 检查玩家是否在物品的网格位置上
      if (this._isPlayerAtItemLocation(playerGrid, itemComponent)) {
        // 收集物品！
        this._collectItem(playerEntity, itemEntity, playerInventory, itemComponent);
      }
    }
  }
  
  /**
   * 检查玩家是否在物品位置
   * 这里使用精确的网格坐标匹配，确保玩家到达格子中心才能收集
   */
  _isPlayerAtItemLocation(playerGrid, itemComponent) {
    return playerGrid.gridX === itemComponent.gridX && 
           playerGrid.gridY === itemComponent.gridY;
  }
  
  /**
   * 收集物品的核心逻辑
   */
  _collectItem(playerEntity, itemEntity, inventory, itemComponent) {
    // 标记物品为已收集
    const collected = itemComponent.collect();
    if (!collected) return;
    
    // 添加到玩家物品栏
    const added = inventory.addItem(itemComponent.type, 1);
    if (!added) {
      // 如果物品栏满了，取消收集
      itemComponent.collected = false;
      console.warn(`物品栏已满，无法收集 ${itemComponent.config.name}`);
      return;
    }
    
    // 播放收集音效（暂时用控制台输出）
    if (this.collectSoundEnabled) {
      this._playCollectSound(itemComponent.type);
    }
    
    // 显示收集提示
    this._showCollectMessage(itemComponent);
    
    // 可以在这里添加收集特效
    this._playCollectEffect(itemEntity, itemComponent);
    
    console.log(`🎉 收集成功: ${itemComponent.config.name} (${itemComponent.type})`);
    console.log(`📦 ${inventory.toString()}`);
  }
  
  /**
   * 播放收集音效（暂时用控制台输出代替）
   */
  _playCollectSound(itemType) {
    const sounds = {
      'coin': '🔔 叮！金币收集音效',
      'seed': '🌱 嗖！种子收集音效',
      'block': '🪨 咚！石块收集音效',
      'terrain': '🟫 嚓！土块收集音效'
    };
    
    const sound = sounds[itemType] || '✨ 收集音效';
    console.log(sound);
  }
  
  /**
   * 显示收集消息
   */
  _showCollectMessage(itemComponent) {
    // 这里可以实现浮动文字效果
    // 暂时用控制台输出
    console.log(`💫 获得 ${itemComponent.config.name}！`);
  }
  
  /**
   * 播放收集特效
   */
  _playCollectEffect(itemEntity, itemComponent) {
    // 这里可以实现粒子效果、闪光效果等
    // 暂时只是标记物品为不可见
    
    // 可以添加渐隐效果
    if (itemComponent.config) {
      itemComponent.config.alpha = 0; // 设置透明度为0
    }
  }
  
  /**
   * 检查指定位置是否有可收集的物品
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {Array} entities - 实体列表
   * @returns {boolean} 是否有可收集物品
   */
  hasCollectableItemAt(gridX, gridY, entities) {
    const itemEntities = this._findItemEntities(entities);
    
    for (const itemEntity of itemEntities) {
      const itemComponent = itemEntity.getComponent(ItemComponent);
      
      if (itemComponent.gridX === gridX && 
          itemComponent.gridY === gridY && 
          itemComponent.canBeCollected()) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 获取指定位置的所有物品
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {Array} entities - 实体列表
   * @returns {Array} 物品组件数组
   */
  getItemsAt(gridX, gridY, entities) {
    const items = [];
    const itemEntities = this._findItemEntities(entities);
    
    for (const itemEntity of itemEntities) {
      const itemComponent = itemEntity.getComponent(ItemComponent);
      
      if (itemComponent.gridX === gridX && 
          itemComponent.gridY === gridY && 
          !itemComponent.collected) {
        items.push(itemComponent);
      }
    }
    
    return items;
  }
  
  /**
   * 清理已收集的物品实体
   * 这个方法可以定期调用来清理内存
   */
  cleanupCollectedItems(entities) {
    const itemEntities = this._findItemEntities(entities);
    const toRemove = [];
    
    for (const itemEntity of itemEntities) {
      const itemComponent = itemEntity.getComponent(ItemComponent);
      
      if (itemComponent.collected) {
        toRemove.push(itemEntity);
      }
    }
    
    // 从世界中移除已收集的物品实体
    for (const entity of toRemove) {
      if (entity.world && entity.world.removeEntity) {
        entity.world.removeEntity(entity);
        console.log(`🗑️ 清理已收集物品: ${entity.getComponent(ItemComponent).config.name}`);
      }
    }
    
    return toRemove.length;
  }
}