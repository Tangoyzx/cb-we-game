import { Component } from '../../../core/ecs/Component.js';

/**
 * GridComponent 网格组件
 * 用于管理网格相关的数据
 */
export class GridComponent extends Component {
  constructor(gridX, gridY, gridSize, cellSize) {
    super();
    
    // 网格坐标
    this.gridX = gridX;
    this.gridY = gridY;
    
    // 网格大小（总行列数）
    this.gridSize = gridSize;
    
    // 单元格大小（像素）
    this.cellSize = cellSize;
  }
  
  /**
   * 设置网格坐标
   */
  setGridPosition(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
  }
  
  /**
   * 获取屏幕坐标
   */
  getScreenPosition() {
    return {
      x: this.gridX * this.cellSize + this.cellSize / 2,
      y: this.gridY * this.cellSize + this.cellSize / 2
    };
  }
}
