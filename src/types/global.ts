/**
 * 全局类型定义
 * 定义游戏中使用的所有接口和类型
 */

// 基础类型
export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Rect extends Point2D, Size2D {}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// 游戏配置类型
export interface GameConfig {
  CANVAS: {
    WIDTH: number;
    HEIGHT: number;
    BACKGROUND_COLOR: string;
  };
  PLAYER: {
    WIDTH: number;
    HEIGHT: number;
    SPEED: number;
    SHOOT_COOLDOWN: number;
    MAX_HEALTH: number;
    INVULNERABLE_TIME: number;
  };
  ENEMY: {
    SPAWN_RATE: number;
    MIN_SPAWN_RATE: number;
    BOSS_SPAWN_RATE: number;
    BOSS_KILL_THRESHOLD: number;
    TYPES: Record<string, EnemyTypeConfig>;
  };
  POWER_UP: {
    SPAWN_RATE: number;
    SPAWN_CHANCE: number;
    DURATION: Record<string, number>;
    TYPES: string[];
  };
  BULLET: {
    WIDTH: number;
    HEIGHT: number;
    SPEED: number;
    COLOR: string;
  };
  AUDIO: {
    DEFAULT_VOLUME: number;
    BACKGROUND_MUSIC_VOLUME: number;
  };
  PARTICLE: {
    EXPLOSION_COUNT: number;
    SPARK_COUNT: number;
    FLASH_COUNT: number;
    LIFE_TIME: number;
  };
  BACKGROUND: {
    STAR_COUNT: number;
    STAR_SPEED_MIN: number;
    STAR_SPEED_MAX: number;
  };
  LEVEL: {
    SCORE_PER_LEVEL: number;
    DIFFICULTY_INCREASE_RATE: number;
  };
  GAME_STATES: {
    START: string;
    PLAYING: string;
    PAUSED: string;
    GAME_OVER: string;
    LEVEL_UP: string;
  };
  DEBUG?: {
    ENABLED: boolean;
  };
}

export interface EnemyTypeConfig {
  width: number;
  height: number;
  hp: number;
  score: number;
  speedMultiplier: number;
  color: string;
}

// 游戏状态类型
export type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'levelUp';

// 输入相关类型
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  pause: boolean;
  weaponNext: boolean;
  weaponPrev: boolean;
  weapon1: boolean;
  weapon2: boolean;
  weapon3: boolean;
  weapon4: boolean;
  weapon5: boolean;
  weapon6: boolean;
}

// 武器系统类型
export type WeaponType = 'normal' | 'double' | 'shotgun' | 'laser' | 'missile' | 'plasma';

export interface WeaponConfig {
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number;
  ammo?: number;
  maxAmmo?: number;
  energy?: number;
  maxEnergy?: number;
  chargeTime?: number;
}

export interface WeaponStats {
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  energy: number;
  maxEnergy: number;
  chargeTime: number;
  isCharging: boolean;
  lastFireTime: number;
}

// 子弹类型
export type BulletType = 'normal' | 'homing' | 'piercing' | 'explosive' | 'expanding';

export interface BulletConfig {
  type: BulletType;
  speed: number;
  damage: number;
  width: number;
  height: number;
  color: string;
  pierce?: boolean;
  homing?: boolean;
  explosive?: boolean;
  expanding?: boolean;
  maxTargets?: number;
}

// 敌机类型
export type EnemyType = 'normal' | 'fast' | 'heavy' | 'zigzag' | 'boss';

export interface EnemyConfig extends Point2D {
  type: EnemyType;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speed: number;
  score: number;
  color: string;
  shootCooldown?: number;
  lastShotTime?: number;
}

// 道具类型
export type PowerUpType = 'health' | 'doubleShot' | 'shield' | 'rapidFire' | 'multiShot' | 'laser' | 'missile' | 'plasma';

export interface PowerUpConfig extends Point2D {
  type: PowerUpType;
  width: number;
  height: number;
  color: string;
  duration?: number;
  value?: number;
}

// 粒子系统类型
export interface ParticleConfig extends Point2D {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
  gravity?: number;
  rotation?: number;
  rotationSpeed?: number;
}

// 特效类型
export interface ScreenShake {
  duration: number;
  intensity: number;
}

// 游戏统计类型
export interface GameStats {
  score: number;
  level: number;
  enemiesKilled: number;
  bossKilled: number;
  playerHealth: number;
  enemyCount: number;
  bulletCount: number;
  powerUpCount: number;
  particleCount: number;
  fps: number;
  gameState: GameState;
}

// 管理器接口
export interface IManager {
  update?(): void;
  render?(ctx: CanvasRenderingContext2D): void;
  destroy?(): void;
}

// 游戏对象基类接口
export interface IGameObject extends Point2D {
  width: number;
  height: number;
  active: boolean;
  update(): void;
  render(ctx: CanvasRenderingContext2D): void;
}

// 可移动对象接口
export interface IMovable extends IGameObject {
  vx: number;
  vy: number;
  speed: number;
}

// 可碰撞对象接口
export interface ICollidable extends IGameObject {
  checkCollision(other: ICollidable): boolean;
  onCollision?(other: ICollidable): void;
}

// 有生命值的对象接口
export interface IHealthy extends IGameObject {
  health: number;
  maxHealth: number;
  takeDamage(damage: number): void;
  heal(amount: number): void;
  isDead(): boolean;
}

// 可攻击对象接口
export interface IAttacker {
  damage: number;
  canAttack(): boolean;
  attack(target: IHealthy): void;
}

// 音频管理器接口
export interface IAudioManager extends IManager {
  play(soundName: string): void;
  playBackground(): void;
  pauseBackground(): void;
  resumeBackground(): void;
  stopAll(): void;
  toggleMute(): void;
  setVolume(volume: number): void;
}

// 输入管理器接口
export interface IInputManager extends IManager {
  getMovementInput(): InputState;
  isKeyPressed(key: string): boolean;
  addKeyListener(key: string, callback: () => void): void;
  removeKeyListener(key: string): void;
}

// 事件系统类型
export type EventCallback = (...args: any[]) => void;

export interface IEventEmitter {
  on(event: string, callback: EventCallback): void;
  off(event: string, callback: EventCallback): void;
  emit(event: string, ...args: any[]): void;
}

// Canvas相关类型扩展
export interface HTMLCanvasElementWithSize extends HTMLCanvasElement {
  width: number;
  height: number;
}

// 窗口对象扩展（用于调试）
declare global {
  interface Window {
    game?: any;
    retryGame?: () => void;
  }
}

// 实用类型
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>; 