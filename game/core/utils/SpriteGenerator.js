/**
 * SpriteGenerator 精灵图生成器
 * 用于生成角色动画帧的像素风格图片
 * 
 * 这个工具可以帮助小朋友快速生成游戏角色的动画图片！
 */
export class SpriteGenerator {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.spriteSize = 48; // 48x48像素的角色
  }

  /**
   * 初始化画布
   * @private
   */
  _initCanvas() {
    // 在微信小游戏环境中创建离屏Canvas
    if (typeof wx !== 'undefined' && wx.createCanvas) {
      this.canvas = wx.createCanvas();
    } else {
      // 浏览器环境
      this.canvas = document.createElement('canvas');
    }
    
    this.canvas.width = this.spriteSize;
    this.canvas.height = this.spriteSize;
    this.context = this.canvas.getContext('2d');
    
    // 关闭抗锯齿，保持像素风格
    this.context.imageSmoothingEnabled = false;
  }

  /**
   * 生成站立动画帧（3帧呼吸效果）
   * 🌟 优化后的呼吸效果更加明显！
   * @param {string} direction - 方向：'down', 'up', 'left', 'right'
   * @returns {Array<Canvas>} 动画帧数组
   */
  generateIdleFrames(direction = 'down') {
    const frames = [];
    
    for (let frame = 0; frame < 3; frame++) {
      this._initCanvas();
      this._clearCanvas();
      
      // 计算呼吸效果参数（增强版）
      // frame 0: 正常大小
      // frame 1: 扩张（吸气）
      // frame 2: 收缩（呼气）
      let bodyScaleY = 1.0;
      let bodyOffsetY = 0;
      
      if (frame === 1) {
        // 吸气：身体变高一点
        bodyScaleY = 1.1;
        bodyOffsetY = -1;
      } else if (frame === 2) {
        // 呼气：身体变矮一点
        bodyScaleY = 0.95;
        bodyOffsetY = 1;
      }
      
      // 绘制角色基础形状（带呼吸参数）
      this._drawCharacterBase(direction, bodyScaleY, bodyOffsetY);
      
      frames.push(this._cloneCanvas());
    }
    
    return frames;
  }

  /**
   * 生成走路动画帧（4帧）
   * 🚶 优化后眼睛不会抖动！
   * @param {string} direction - 方向：'down', 'up', 'left', 'right'
   * @returns {Array<Canvas>} 动画帧数组
   */
  generateWalkFrames(direction = 'down') {
    const frames = [];
    
    for (let frame = 0; frame < 4; frame++) {
      this._initCanvas();
      this._clearCanvas();
      
      // 计算走路时的上下摆动偏移
      const bobOffset = Math.sin(frame * Math.PI / 2) * 2;
      
      // 绘制角色基础形状（眼睛位置固定，只有身体和四肢会动）
      this._drawCharacterBase(direction, 1.0, bobOffset, frame);
      
      frames.push(this._cloneCanvas());
    }
    
    return frames;
  }

  /**
   * 绘制角色基础形状
   * 🎨 优化版：支持呼吸效果和走路效果，眼睛位置固定
   * @param {string} direction - 朝向
   * @param {number} bodyScaleY - 身体Y轴缩放（用于呼吸效果）
   * @param {number} bodyOffsetY - 身体Y轴偏移（用于走路和呼吸效果）
   * @param {number} walkFrame - 走路帧数（可选，用于四肢摆动）
   * @private
   */
  _drawCharacterBase(direction, bodyScaleY = 1.0, bodyOffsetY = 0, walkFrame = -1) {
    const ctx = this.context;
    const center = this.spriteSize / 2;
    
    // 设置像素风格
    ctx.imageSmoothingEnabled = false;
    
    // 计算身体和头部的实际位置（考虑偏移和缩放）
    const bodyY = center + 2 + bodyOffsetY;
    const bodyRadiusY = 20 * bodyScaleY;
    const headY = center - 8; // 头部位置固定，不随身体移动
    
    // 绘制身体（椭圆形）- 会随呼吸和走路移动
    ctx.fillStyle = '#4CAF50'; // 绿色身体
    ctx.beginPath();
    ctx.ellipse(center, bodyY, 16, bodyRadiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制头部（圆形）- 位置固定，眼睛不会抖动！
    ctx.fillStyle = '#66BB6A'; // 稍浅的绿色头部
    ctx.beginPath();
    ctx.arc(center, headY, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制眼睛 - 位置完全固定在头部上
    this._drawEyes(direction, center, headY);
    
    // 绘制四肢 - 如果是走路动画，添加摆动效果
    if (walkFrame >= 0) {
      this._drawLimbsWalking(direction, center, bodyY, walkFrame);
    } else {
      this._drawLimbs(direction, center, bodyY);
    }
  }

  /**
   * 绘制眼睛
   * 👀 眼睛位置完全固定，不会抖动！
   * @param {string} direction - 朝向
   * @param {number} centerX - 头部中心X坐标
   * @param {number} centerY - 头部中心Y坐标
   * @private
   */
  _drawEyes(direction, centerX, centerY) {
    const ctx = this.context;
    
    ctx.fillStyle = '#000000'; // 黑色眼睛
    
    // 眼睛大小
    const eyeSize = 3;
    
    switch (direction) {
      case 'down':
        // 向下看的眼睛（相对于头部中心定位）
        ctx.fillRect(centerX - 6, centerY - 2, eyeSize, eyeSize);
        ctx.fillRect(centerX + 3, centerY - 2, eyeSize, eyeSize);
        break;
      case 'up':
        // 向上看的眼睛
        ctx.fillRect(centerX - 6, centerY - 4, eyeSize, eyeSize);
        ctx.fillRect(centerX + 3, centerY - 4, eyeSize, eyeSize);
        break;
      case 'left':
        // 向左看的眼睛
        ctx.fillRect(centerX - 8, centerY - 2, eyeSize, eyeSize);
        ctx.fillRect(centerX - 2, centerY - 2, eyeSize, eyeSize);
        break;
      case 'right':
        // 向右看的眼睛
        ctx.fillRect(centerX - 1, centerY - 2, eyeSize, eyeSize);
        ctx.fillRect(centerX + 5, centerY - 2, eyeSize, eyeSize);
        break;
    }
  }

  /**
   * 绘制四肢（静止状态）
   * @param {string} direction - 朝向
   * @param {number} centerX - 中心X坐标
   * @param {number} bodyY - 身体Y坐标
   * @private
   */
  _drawLimbs(direction, centerX, bodyY) {
    const ctx = this.context;
    
    ctx.fillStyle = '#4CAF50'; // 与身体同色
    
    // 绘制手臂（跟随身体位置）
    ctx.fillRect(centerX - 20, bodyY - 4, 8, 4); // 左臂
    ctx.fillRect(centerX + 12, bodyY - 4, 8, 4); // 右臂
    
    // 绘制腿部（跟随身体位置）
    ctx.fillRect(centerX - 8, bodyY + 16, 4, 8); // 左腿
    ctx.fillRect(centerX + 4, bodyY + 16, 4, 8); // 右腿
  }

  /**
   * 绘制四肢（走路状态，带摆动效果）
   * 🚶 四肢会摆动，但眼睛不会抖动！
   * @param {string} direction - 朝向
   * @param {number} centerX - 中心X坐标
   * @param {number} bodyY - 身体Y坐标
   * @param {number} frame - 当前帧
   * @private
   */
  _drawLimbsWalking(direction, centerX, bodyY, frame) {
    const ctx = this.context;
    
    ctx.fillStyle = '#4CAF50'; // 与身体同色
    
    // 计算手臂和腿的摆动偏移
    const leftSwing = Math.sin(frame * Math.PI / 2) * 3;
    const rightSwing = -leftSwing;
    
    // 绘制手臂（带摆动效果）
    ctx.fillRect(centerX - 20, bodyY - 4 + leftSwing, 8, 4); // 左臂
    ctx.fillRect(centerX + 12, bodyY - 4 + rightSwing, 8, 4); // 右臂
    
    // 绘制腿部（带摆动效果）
    ctx.fillRect(centerX - 8, bodyY + 16 + rightSwing, 4, 8); // 左腿
    ctx.fillRect(centerX + 4, bodyY + 16 + leftSwing, 4, 8); // 右腿
  }

  /**
   * 清空画布
   * @private
   */
  _clearCanvas() {
    this.context.clearRect(0, 0, this.spriteSize, this.spriteSize);
  }

  /**
   * 克隆当前画布
   * @returns {Canvas} 克隆的画布
   * @private
   */
  _cloneCanvas() {
    let clonedCanvas;
    
    if (typeof wx !== 'undefined' && wx.createCanvas) {
      clonedCanvas = wx.createCanvas();
    } else {
      clonedCanvas = document.createElement('canvas');
    }
    
    clonedCanvas.width = this.canvas.width;
    clonedCanvas.height = this.canvas.height;
    
    const clonedContext = clonedCanvas.getContext('2d');
    clonedContext.drawImage(this.canvas, 0, 0);
    
    return clonedCanvas;
  }

  /**
   * 将Canvas转换为Image对象
   * @param {Canvas} canvas - 画布
   * @returns {Promise<Image>} Image对象
   */
  async canvasToImage(canvas) {
    return new Promise((resolve, reject) => {
      let image;
      
      if (typeof wx !== 'undefined' && wx.createImage) {
        // 微信小游戏环境
        image = wx.createImage();
      } else {
        // 浏览器环境
        image = new Image();
      }
      
      image.onload = () => resolve(image);
      image.onerror = reject;
      
      // 将Canvas转换为DataURL
      image.src = canvas.toDataURL('image/png');
    });
  }

  /**
   * 生成完整的角色动画集
   * @returns {Promise<Object>} 包含所有动画的对象
   */
  async generateCharacterAnimations() {
    console.log('🎨 开始生成角色动画图片...');
    
    const animations = {
      idle: {},
      walk: {}
    };
    
    const directions = ['down', 'up', 'left', 'right'];
    
    for (const direction of directions) {
      console.log(`生成 ${direction} 方向的动画...`);
      
      // 生成站立动画
      const idleFrames = this.generateIdleFrames(direction);
      animations.idle[direction] = [];
      
      for (let i = 0; i < idleFrames.length; i++) {
        const image = await this.canvasToImage(idleFrames[i]);
        animations.idle[direction].push(image);
      }
      
      // 生成走路动画
      const walkFrames = this.generateWalkFrames(direction);
      animations.walk[direction] = [];
      
      for (let i = 0; i < walkFrames.length; i++) {
        const image = await this.canvasToImage(walkFrames[i]);
        animations.walk[direction].push(image);
      }
    }
    
    console.log('✅ 角色动画图片生成完成！');
    console.log('📊 动画统计:');
    console.log('  - 站立动画: 4个方向 × 3帧 = 12张图片');
    console.log('  - 走路动画: 4个方向 × 4帧 = 16张图片');
    console.log('  - 总计: 28张动画图片');
    
    return animations;
  }
}