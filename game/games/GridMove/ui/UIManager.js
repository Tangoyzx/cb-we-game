/**
 * UIManager - UI管理器
 * 管理GridMove游戏的所有UI元素（按钮、Tab、信息显示等）
 * 
 * 什么是UIManager？
 * 把它想象成游戏的"控制面板"，显示各种按钮和信息。
 * 就像你玩游戏时屏幕上显示的血条、按钮等等！
 */
export class UIManager {
  constructor(canvas, renderer, gameAreaBottom) {
    this.canvas = canvas;
    this.renderer = renderer;
    
    // UI区域配置
    this.gameAreaBottom = gameAreaBottom; // 底部UI区域高度（300px）
    this.uiAreaY = canvas.height - gameAreaBottom; // UI区域起始Y坐标
    
    // 返回按钮配置（移到底部左侧）
    this.backButton = {
      x: 20,
      y: this.uiAreaY + 20,
      width: 120,
      height: 45,
      color: '#4CAF50',
      textColor: '#FFFFFF',
      text: '返回主菜单'
    };
    
    // Tab配置
    this.tabs = [
      { id: 'info', label: '信息', active: true },
      { id: 'items', label: '物品', active: false }
    ];
    
    this.tabHeight = 45;
    this.tabStartY = this.uiAreaY + 75; // 返回按钮下面
    this.tabWidth = 120;
    this.tabSpacing = 10;
    
    // Tab内容区域
    this.contentAreaY = this.tabStartY + this.tabHeight + 10;
    this.contentAreaHeight = this.gameAreaBottom - 95; // 剩余空间
    
    // 当前激活的Tab
    this.activeTab = 'info';
    
    // 物品栏UI配置（数据来源改为动态获取）
    this.inventoryUI = {
      currentPage: 0,
      itemsPerPage: 5,
      itemWidth: 60,
      itemHeight: 60,
      itemSpacing: 10,
      selectedItemIndex: -1  // 当前选中的物品索引
    };
    
    // 物品栏数据引用（将在游戏初始化时设置）
    this.inventoryComponent = null;
  }
  
  /**
   * 检查点击位置是否在返回按钮内
   */
  isBackButtonClicked(x, y) {
    const btn = this.backButton;
    return x >= btn.x && x <= btn.x + btn.width &&
           y >= btn.y && y <= btn.y + btn.height;
  }
  
  /**
   * 检查点击位置是否在UI区域内
   */
  isInUIArea(x, y) {
    return y >= this.uiAreaY;
  }
  
  /**
   * 处理点击事件
   * @returns {string|null} 返回处理结果类型：'back'、'tab'、'item'或null
   */
  handleClick(x, y) {
    // 检查返回按钮
    if (this.isBackButtonClicked(x, y)) {
      return 'back';
    }
    
    // 检查Tab点击
    for (let i = 0; i < this.tabs.length; i++) {
      const tabX = 20 + i * (this.tabWidth + this.tabSpacing);
      const tabY = this.tabStartY;
      
      if (x >= tabX && x <= tabX + this.tabWidth &&
          y >= tabY && y <= tabY + this.tabHeight) {
        this.switchTab(this.tabs[i].id);
        return 'tab';
      }
    }
    
    // 检查物品栏点击（仅在物品Tab激活时）
    if (this.activeTab === 'items') {
      const clickedItem = this._getClickedItem(x, y);
      if (clickedItem !== null) {
        const inventoryData = this._getInventoryData();
        if (clickedItem < inventoryData.length && !inventoryData[clickedItem].empty) {
          this._selectItem(clickedItem);
          return 'item';
        }
      }
    }
    
    return null;
  }
  
  /**
   * 切换Tab
   */
  switchTab(tabId) {
    this.tabs.forEach(tab => {
      tab.active = (tab.id === tabId);
    });
    this.activeTab = tabId;
  }
  
  /**
   * 设置物品栏组件引用
   * @param {InventoryComponent} inventoryComponent - 物品栏组件
   */
  setInventoryComponent(inventoryComponent) {
    this.inventoryComponent = inventoryComponent;
  }
  
  /**
   * 获取物品栏数据
   * @returns {Array} 物品数据数组
   */
  _getInventoryData() {
    if (!this.inventoryComponent) {
      // 如果没有物品栏组件，返回空数据
      return [
        { type: 'coin', name: '金币', icon: '🪙', count: 0, empty: true },
        { type: 'seed', name: '种子', icon: '🌱', count: 0, empty: true },
        { type: 'block', name: '石块', icon: '🪨', count: 0, empty: true },
        { type: 'terrain', name: '土块', icon: '🟫', count: 0, empty: true }
      ];
    }
    
    return this.inventoryComponent.getInventoryData();
  }
  
  /**
   * 选中物品
   */
  _selectItem(index) {
    this.inventoryUI.selectedItemIndex = index;
    console.log(`选中物品索引: ${index}`);
  }
  
  /**
   * 获取点击的物品索引
   * 🎒 支持多行布局
   */
  _getClickedItem(x, y) {
    const startX = 30;
    const startY = this.contentAreaY + 20;
    const { itemWidth, itemHeight, itemSpacing } = this.inventoryUI;
    const inventoryData = this._getInventoryData();
    
    // 计算每行能显示多少个物品
    const maxItemsPerRow = Math.floor((this.renderer.canvas.width - startX * 2) / (itemWidth + itemSpacing));
    
    for (let i = 0; i < inventoryData.length; i++) {
      // 计算行和列
      const row = Math.floor(i / maxItemsPerRow);
      const col = i % maxItemsPerRow;
      
      const itemX = startX + col * (itemWidth + itemSpacing);
      const itemY = startY + row * (itemHeight + 25);
      
      if (x >= itemX && x <= itemX + itemWidth &&
          y >= itemY && y <= itemY + itemHeight) {
        return i;
      }
    }
    
    return null;
  }
  
  /**
   * 渲染所有UI元素
   */
  render(gridInfo) {
    // 绘制UI背景
    this.renderer.drawRect(
      0,
      this.uiAreaY,
      this.canvas.width,
      this.gameAreaBottom,
      'rgba(20, 20, 30, 0.9)'
    );
    
    // 绘制顶部分割线
    this.renderer.drawLine(
      0,
      this.uiAreaY,
      this.canvas.width,
      this.uiAreaY,
      '#444444',
      2
    );
    
    // 绘制返回按钮
    this._renderBackButton();
    
    // 绘制Tab栏
    this._renderTabs();
    
    // 绘制Tab内容
    if (this.activeTab === 'info') {
      this._renderInfoTab(gridInfo);
    } else if (this.activeTab === 'items') {
      this._renderItemsTab();
    }
  }
  
  /**
   * 渲染返回按钮
   */
  _renderBackButton() {
    const btn = this.backButton;
    
    // 绘制按钮背景
    this.renderer.drawRect(
      btn.x,
      btn.y,
      btn.width,
      btn.height,
      btn.color
    );
    
    // 绘制按钮边框
    this.renderer.drawRectStroke(
      btn.x,
      btn.y,
      btn.width,
      btn.height,
      '#66BB6A',
      2
    );
    
    // 绘制按钮文字
    this.renderer.drawText(
      btn.text,
      btn.x + btn.width / 2,
      btn.y + btn.height / 2 - 10,
      btn.textColor,
      18,
      'center'
    );
  }
  
  /**
   * 渲染Tab标签栏
   */
  _renderTabs() {
    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const tabX = 20 + i * (this.tabWidth + this.tabSpacing);
      const tabY = this.tabStartY;
      
      // 激活的Tab用不同颜色
      const bgColor = tab.active ? '#2196F3' : '#424242';
      const borderColor = tab.active ? '#42A5F5' : '#616161';
      
      // 绘制Tab背景
      this.renderer.drawRect(
        tabX,
        tabY,
        this.tabWidth,
        this.tabHeight,
        bgColor
      );
      
      // 绘制Tab边框
      this.renderer.drawRectStroke(
        tabX,
        tabY,
        this.tabWidth,
        this.tabHeight,
        borderColor,
        2
      );
      
      // 绘制Tab文字
      this.renderer.drawText(
        tab.label,
        tabX + this.tabWidth / 2,
        tabY + this.tabHeight / 2 - 10,
        '#FFFFFF',
        18,
        'center'
      );
    }
  }
  
  /**
   * 渲染信息Tab内容
   */
  _renderInfoTab(gridInfo) {
    const startX = 30;
    const startY = this.contentAreaY + 10;
    const lineHeight = 35;
    
    // 标题
    this.renderer.drawText(
      '角色信息',
      startX,
      startY,
      '#FFD700',
      22,
      'left'
    );
    
    // 网格坐标
    this.renderer.drawText(
      `网格坐标: (${gridInfo.gridX}, ${gridInfo.gridY})`,
      startX,
      startY + lineHeight + 10,
      '#FFFFFF',
      20,
      'left'
    );
    
    // 移动方向
    this.renderer.drawText(
      `移动方向: ${gridInfo.direction}`,
      startX,
      startY + lineHeight * 2 + 10,
      '#FFD700',
      20,
      'left'
    );
  }
  
  /**
   * 渲染物品Tab内容
   * 🎒 支持动态物品数量和多行显示
   */
  _renderItemsTab() {
    const startX = 30;
    const startY = this.contentAreaY + 20;
    const { itemWidth, itemHeight, itemSpacing } = this.inventoryUI;
    const inventoryData = this._getInventoryData();
    
    // 标题
    this.renderer.drawText(
      '物品栏 (按收集顺序)',
      startX,
      this.contentAreaY - 5,
      '#FFD700',
      22,
      'left'
    );
    
    // 如果物品栏为空，显示提示
    if (inventoryData.length === 0) {
      this.renderer.drawText(
        '物品栏空空如也...',
        this.renderer.canvas.width / 2,
        this.contentAreaY + 80,
        '#888888',
        18,
        'center'
      );
      
      this.renderer.drawText(
        '快去地图上探索收集物品吧！',
        this.renderer.canvas.width / 2,
        this.contentAreaY + 110,
        '#666666',
        14,
        'center'
      );
      return;
    }
    
    // 计算每行能显示多少个物品
    const maxItemsPerRow = Math.floor((this.renderer.canvas.width - startX * 2) / (itemWidth + itemSpacing));
    
    // 绘制物品格子（支持多行）
    for (let i = 0; i < inventoryData.length; i++) {
      const item = inventoryData[i];
      
      // 计算行和列
      const row = Math.floor(i / maxItemsPerRow);
      const col = i % maxItemsPerRow;
      
      const itemX = startX + col * (itemWidth + itemSpacing);
      const itemY = startY + row * (itemHeight + 25);  // 25是名称的高度
      
      // 背景颜色（选中状态）
      let bgColor = '#424242';
      let borderColor = '#616161';
      
      if (this.inventoryUI.selectedItemIndex === i) {
        bgColor = '#1976D2';
        borderColor = '#42A5F5';
      }
      
      // 绘制物品背景
      this.renderer.drawRect(
        itemX,
        itemY,
        itemWidth,
        itemHeight,
        bgColor
      );
      
      // 绘制物品边框
      this.renderer.drawRectStroke(
        itemX,
        itemY,
        itemWidth,
        itemHeight,
        borderColor,
        2
      );
      
      // 绘制物品图标（使用emoji）
      this.renderer.drawText(
        item.icon,
        itemX + itemWidth / 2,
        itemY + itemHeight / 2 - 10,
        '#FFFFFF',
        20,
        'center'
      );
      
      // 绘制数量（右下角）
      this.renderer.drawText(
        `×${item.count}`,
        itemX + itemWidth - 8,
        itemY + itemHeight - 8,
        '#FFD700',
        12,
        'right'
      );
      
      // 绘制物品名称（在格子下方）
      this.renderer.drawText(
        item.name,
        itemX + itemWidth / 2,
        itemY + itemHeight + 15,
        '#CCCCCC',
        12,
        'center'
      );
    }
    
    // 底部提示信息
    const totalItems = inventoryData.reduce((sum, item) => sum + item.count, 0);
    const infoY = this.contentAreaY + Math.max(120, startY + Math.ceil(inventoryData.length / maxItemsPerRow) * (itemHeight + 25) + 20);
    
    this.renderer.drawText(
      `共 ${inventoryData.length} 种物品 | 总计 ${totalItems} 个 | 点击物品可选中使用`,
      startX,
      infoY,
      '#999999',
      14,
      'left'
    );
  }
}
