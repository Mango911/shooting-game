/**
 * 游戏配置文件
 * 所有游戏相关的常量和配置都在这里定义
 */

export const GAME_CONFIG = {
  // 画布配置
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#0a0a0a'
  },

  // 玩家配置
  PLAYER: {
    WIDTH: 40,
    HEIGHT: 40,
    SPEED: 5,
    SHOOT_COOLDOWN: 200, // 毫秒
    MAX_HEALTH: 3,
    INVULNERABLE_TIME: 1500 // 毫秒
  },

  // 敌机配置
  ENEMY: {
    SPAWN_RATE: 2000, // 毫秒
    BOSS_KILL_THRESHOLD: 20, // 每20个敌机生成一个Boss
    TYPES: {
      NORMAL: {
        width: 30, height: 30, hp: 1, score: 10,
        speedMultiplier: 1, color: '#ff6b6b'
      },
      FAST: {
        width: 20, height: 20, hp: 1, score: 15,
        speedMultiplier: 1.5, color: '#ff9f43'
      },
      HEAVY: {
        width: 45, height: 45, hp: 3, score: 30,
        speedMultiplier: 0.6, color: '#8c7ae6'
      },
      ZIGZAG: {
        width: 25, height: 25, hp: 2, score: 25,
        speedMultiplier: 1, color: '#ff6348'
      },
      BOSS: {
        width: 80, height: 60, hp: 15, score: 200,
        speedMultiplier: 0.3, color: '#ee5a24'
      }
    }
  },

  // 道具配置
  POWER_UP: {
    SPAWN_RATE: 15000, // 毫秒
    SPAWN_CHANCE: 0.3, // 生成概率
    DURATION: {
      DOUBLE_SHOT: 10000,
      MULTI_SHOT: 12000,
      SHIELD: 8000,
      RAPID_FIRE: 7000
    },
    TYPES: ['health', 'doubleShot', 'shield', 'rapidFire', 'multiShot', 'laser', 'missile', 'plasma']
  },

  // 子弹配置
  BULLET: {
    WIDTH: 4,
    HEIGHT: 10,
    SPEED: -8,
    COLOR: '#feca57'
  },

  // 音频配置
  AUDIO: {
    DEFAULT_VOLUME: 0.3,
    BACKGROUND_MUSIC_VOLUME: 0.1
  },

  // 粒子配置
  PARTICLE: {
    EXPLOSION_COUNT: 15,
    SPARK_COUNT: 8,
    FLASH_COUNT: 5,
    LIFE_TIME: 40
  },

  // 背景配置
  BACKGROUND: {
    STAR_COUNT: 150,
    STAR_SPEED_MIN: 0.5,
    STAR_SPEED_MAX: 2.5
  },

  // 关卡配置
  LEVEL: {
    SCORE_PER_LEVEL: 100,
    DIFFICULTY_INCREASE_RATE: 0.1,
    MIN_SPAWN_RATE: 400
  },

  // 游戏状态
  GAME_STATES: {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  }
};

export default GAME_CONFIG; 