import { Component } from '../ecs/Component.js';

/**
 * AnimationComponent 动画组件
 * 管理实体的动画状态、帧切换逻辑和播放控制
 * 
 * 这个组件让角色变得生动有趣，就像给角色注入了生命力！
 */
export class AnimationComponent extends Component {
  constructor() {
    super();
    
    // 动画集合：存储所有动画数据
    // 结构：{ animationType: { direction: [frame1, frame2, ...] } }
    this.animations = new Map();
    
    // 当前播放状态
    this.currentAnimation = null;    // 当前动画名称
    this.currentDirection = 'down';  // 当前方向
    this.currentFrameIndex = 0;      // 当前帧索引
    this.currentFrame = null;        // 当前帧的Image对象
    
    // 播放控制
    this.isPlaying = false;          // 是否正在播放
    this.isPaused = false;           // 是否暂停
    this.loop = true;                // 是否循环播放
    this.playbackSpeed = 1.0;        // 播放速度倍率
    
    // 时间控制
    this.frameRate = 8;              // 帧率（帧/秒）
    this.frameDuration = 1000 / this.frameRate; // 每帧持续时间（毫秒）
    this.lastFrameTime = 0;          // 上一帧的时间戳
    this.elapsedTime = 0;            // 累计时间
    
    // 回调函数
    this.onAnimationComplete = null; // 动画完成回调
    this.onFrameChange = null;       // 帧切换回调
    this.onAnimationStart = null;    // 动画开始回调
    
    // 动画队列（支持动画排队播放）
    this.animationQueue = [];
    
    // 调试信息
    this.debug = false;
  }

  /**
   * 添加动画数据
   * @param {string} name - 动画名称（如 'idle', 'walk'）
   * @param {string} direction - 方向（如 'down', 'up', 'left', 'right'）
   * @param {Array<Image>} frames - 动画帧数组
   * @param {Object} options - 动画选项
   */
  addAnimation(name, direction, frames, options = {}) {
    if (!this.animations.has(name)) {
      this.animations.set(name, new Map());
    }
    
    const animationData = {
      frames: frames,
      frameRate: options.frameRate || this.frameRate,
      loop: options.loop !== undefined ? options.loop : true,
      frameDuration: 1000 / (options.frameRate || this.frameRate)
    };
    
    this.animations.get(name).set(direction, animationData);
    
    if (this.debug) {
      console.log(`📽️ 添加动画: ${name}-${direction}, ${frames.length}帧, ${animationData.frameRate}fps`);
    }
  }

  /**
   * 批量添加动画数据
   * @param {Object} animationsData - 动画数据对象
   * 格式：{ animationType: { direction: [frames] } }
   */
  addAnimations(animationsData) {
    for (const [animationType, directions] of Object.entries(animationsData)) {
      for (const [direction, frames] of Object.entries(directions)) {
        this.addAnimation(animationType, direction, frames);
      }
    }
    
    console.log(`📚 批量添加动画完成，共 ${this.animations.size} 种动画类型`);
  }

  /**
   * 播放指定动画
   * @param {string} name - 动画名称
   * @param {string} direction - 方向（可选，默认保持当前方向）
   * @param {Object} options - 播放选项
   */
  play(name, direction = null, options = {}) {
    const targetDirection = direction || this.currentDirection;
    
    // 检查动画是否存在
    if (!this.hasAnimation(name, targetDirection)) {
      console.warn(`⚠️ 动画不存在: ${name}-${targetDirection}`);
      return false;
    }
    
    // 如果是相同的动画且正在播放，不重复播放
    if (this.currentAnimation === name && 
        this.currentDirection === targetDirection && 
        this.isPlaying && 
        !options.restart) {
      return true;
    }
    
    // 停止当前动画
    this.stop();
    
    // 设置新动画
    this.currentAnimation = name;
    this.currentDirection = targetDirection;
    this.currentFrameIndex = 0;
    this.elapsedTime = 0;
    this.lastFrameTime = Date.now();
    
    // 获取动画数据
    const animationData = this.animations.get(name).get(targetDirection);
    this.loop = options.loop !== undefined ? options.loop : animationData.loop;
    this.playbackSpeed = options.speed || 1.0;
    this.frameDuration = animationData.frameDuration / this.playbackSpeed;
    
    // 设置当前帧
    this._updateCurrentFrame();
    
    // 开始播放
    this.isPlaying = true;
    this.isPaused = false;
    
    // 触发开始回调
    if (this.onAnimationStart) {
      this.onAnimationStart(name, targetDirection);
    }
    
    if (this.debug) {
      console.log(`▶️ 播放动画: ${name}-${targetDirection}, 循环: ${this.loop}`);
    }
    
    return true;
  }

  /**
   * 暂停动画
   */
  pause() {
    this.isPaused = true;
    if (this.debug) {
      console.log(`⏸️ 暂停动画: ${this.currentAnimation}-${this.currentDirection}`);
    }
  }

  /**
   * 恢复动画
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = Date.now();
      if (this.debug) {
        console.log(`▶️ 恢复动画: ${this.currentAnimation}-${this.currentDirection}`);
      }
    }
  }

  /**
   * 停止动画
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentFrameIndex = 0;
    this.elapsedTime = 0;
    
    if (this.debug && this.currentAnimation) {
      console.log(`⏹️ 停止动画: ${this.currentAnimation}-${this.currentDirection}`);
    }
  }

  /**
   * 更新动画（由AnimationSystem调用）
   * @param {number} deltaTime - 距离上一帧的时间（毫秒）
   */
  update(deltaTime) {
    if (!this.isPlaying || this.isPaused || !this.currentAnimation) {
      return;
    }
    
    // 累计时间
    this.elapsedTime += deltaTime;
    
    // 检查是否需要切换到下一帧
    if (this.elapsedTime >= this.frameDuration) {
      this._nextFrame();
      this.elapsedTime = 0; // 重置累计时间
    }
  }

  /**
   * 切换到下一帧
   * @private
   */
  _nextFrame() {
    if (!this.currentAnimation) return;
    
    const animationData = this.animations.get(this.currentAnimation).get(this.currentDirection);
    const totalFrames = animationData.frames.length;
    
    this.currentFrameIndex++;
    
    // 检查是否到达最后一帧
    if (this.currentFrameIndex >= totalFrames) {
      if (this.loop) {
        // 循环播放，回到第一帧
        this.currentFrameIndex = 0;
      } else {
        // 不循环，停止在最后一帧
        this.currentFrameIndex = totalFrames - 1;
        this.isPlaying = false;
        
        // 触发完成回调
        if (this.onAnimationComplete) {
          this.onAnimationComplete(this.currentAnimation, this.currentDirection);
        }
        
        if (this.debug) {
          console.log(`🏁 动画播放完成: ${this.currentAnimation}-${this.currentDirection}`);
        }
      }
    }
    
    // 更新当前帧
    this._updateCurrentFrame();
    
    // 触发帧切换回调
    if (this.onFrameChange) {
      this.onFrameChange(this.currentFrameIndex, this.currentFrame);
    }
  }

  /**
   * 更新当前帧
   * @private
   */
  _updateCurrentFrame() {
    if (!this.currentAnimation) return;
    
    const animationData = this.animations.get(this.currentAnimation).get(this.currentDirection);
    this.currentFrame = animationData.frames[this.currentFrameIndex];
  }

  /**
   * 检查动画是否存在
   * @param {string} name - 动画名称
   * @param {string} direction - 方向
   * @returns {boolean} 是否存在
   */
  hasAnimation(name, direction) {
    return this.animations.has(name) && 
           this.animations.get(name).has(direction);
  }

  /**
   * 获取当前帧的Image对象
   * @returns {Image|null} 当前帧图片
   */
  getCurrentFrame() {
    return this.currentFrame;
  }

  /**
   * 获取动画信息
   * @returns {Object} 动画信息
   */
  getAnimationInfo() {
    if (!this.currentAnimation) {
      return null;
    }
    
    const animationData = this.animations.get(this.currentAnimation).get(this.currentDirection);
    
    return {
      name: this.currentAnimation,
      direction: this.currentDirection,
      currentFrame: this.currentFrameIndex,
      totalFrames: animationData.frames.length,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      loop: this.loop,
      frameRate: animationData.frameRate,
      playbackSpeed: this.playbackSpeed
    };
  }

  /**
   * 设置动画方向（用于角色转向）
   * @param {string} direction - 新方向
   */
  setDirection(direction) {
    if (this.currentDirection === direction) return;
    
    // 如果当前有动画在播放，切换到新方向
    if (this.isPlaying && this.currentAnimation) {
      this.play(this.currentAnimation, direction, { restart: false });
    } else {
      this.currentDirection = direction;
    }
  }

  /**
   * 获取所有可用的动画名称
   * @returns {Array<string>} 动画名称数组
   */
  getAnimationNames() {
    return Array.from(this.animations.keys());
  }

  /**
   * 获取指定动画的所有方向
   * @param {string} name - 动画名称
   * @returns {Array<string>} 方向数组
   */
  getAnimationDirections(name) {
    if (!this.animations.has(name)) return [];
    return Array.from(this.animations.get(name).keys());
  }

  /**
   * 设置帧率
   * @param {number} frameRate - 新的帧率
   */
  setFrameRate(frameRate) {
    this.frameRate = frameRate;
    this.frameDuration = 1000 / frameRate;
  }

  /**
   * 启用/禁用调试模式
   * @param {boolean} enabled - 是否启用
   */
  setDebug(enabled) {
    this.debug = enabled;
  }

  /**
   * 获取动画统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    let totalFrames = 0;
    let totalAnimations = 0;
    
    for (const [name, directions] of this.animations) {
      for (const [direction, data] of directions) {
        totalAnimations++;
        totalFrames += data.frames.length;
      }
    }
    
    return {
      animationTypes: this.animations.size,
      totalAnimations,
      totalFrames,
      currentAnimation: this.currentAnimation,
      currentDirection: this.currentDirection,
      isPlaying: this.isPlaying
    };
  }

  /**
   * 销毁组件，清理资源
   */
  destroy() {
    this.stop();
    this.animations.clear();
    this.animationQueue = [];
    this.currentFrame = null;
    
    // 清理回调
    this.onAnimationComplete = null;
    this.onFrameChange = null;
    this.onAnimationStart = null;
    
    if (this.debug) {
      console.log('💥 AnimationComponent已销毁');
    }
    
    super.destroy();
  }
}