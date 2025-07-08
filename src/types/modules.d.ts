/**
 * 模块声明文件
 * 为JavaScript模块提供TypeScript类型定义
 */

// 管理器模块声明
declare module './managers/AudioManager.js' {
    export default class AudioManager {
        constructor();
        toggleMute(): void;
        setVolume(volume: number): void;
        playBackground(): void;
        pauseBackground(): void;
        resumeBackground(): void;
        stopAll(): void;
        destroy(): void;
        play(soundName: string): void;
        [key: string]: any;
    }
}

declare module './managers/InputManager.js' {
    import type { InputState } from '../types/global.js';
    export default class InputManager {
        constructor(game: any);
        getMovementInput(): InputState;
        destroy(): void;
        [key: string]: any;
    }
}

declare module './managers/CollisionManager.js' {
    export default class CollisionManager {
        constructor(game: any);
        checkAllCollisions(): void;
        [key: string]: any;
    }
}

declare module './managers/SpawnManager.js' {
    export default class SpawnManager {
        constructor(game: any);
        update(currentTime: number): void;
        forceSpawnEnemy(type: string): void;
        forceSpawnPowerUp(type: string): void;
        forceSpawnBoss(): void;
        clearAll(): void;
        [key: string]: any;
    }
}

declare module './managers/GameStateManager.js' {
    import type { GameState } from '../types/global.js';
    export default class GameStateManager {
        constructor(game: any);
        startGame(): void;
        pauseGame(): void;
        resumeGame(): void;
        resetGame(): void;
        checkLevelUp(): void;
        isPlaying(): boolean;
        forceState(state: GameState): void;
        destroy(): void;
        [key: string]: any;
    }
}

declare module './managers/UIManager.js' {
    export default class UIManager {
        constructor(game: any);
        render(): void;
        renderDebugInfo(): void;
        destroy(): void;
        [key: string]: any;
    }
}

// 类模块声明
declare module './classes/Player.js' {
    import type { IGameObject, InputState } from '../types/global.js';
    export default class Player implements IGameObject {
        x: number;
        y: number;
        width: number;
        height: number;
        health: number;
        active: boolean;
        constructor(x: number, y: number);
        update(): void;
        render(ctx: CanvasRenderingContext2D): void;
        handleInput(input: InputState, canvas: HTMLCanvasElement): void;
        shoot(bullets: any[], enemies: any[]): void;
        [key: string]: any;
    }
}

declare module './classes/Particle.js' {
    import type { ParticleConfig } from '../types/global.js';
    export default class Particle {
        particles: ParticleConfig[];
        constructor(ctx: CanvasRenderingContext2D);
        update(): void;
        render(): void;
        destroy(): void;
        [key: string]: any;
    }
}

declare module './classes/Background.js' {
    export default class Background {
        constructor(width: number, height: number);
        update(): void;
        render(ctx: CanvasRenderingContext2D): void;
        [key: string]: any;
    }
}

declare module './classes/Enemy.js' {
    import type { IGameObject } from '../types/global.js';
    export default class Enemy implements IGameObject {
        x: number;
        y: number;
        width: number;
        height: number;
        active: boolean;
        constructor(...args: any[]);
        update(): void;
        render(ctx: CanvasRenderingContext2D): void;
        [key: string]: any;
    }
}

declare module './classes/PowerUp.js' {
    import type { IGameObject } from '../types/global.js';
    export default class PowerUp implements IGameObject {
        x: number;
        y: number;
        width: number;
        height: number;
        active: boolean;
        constructor(...args: any[]);
        update(): void;
        render(ctx: CanvasRenderingContext2D): void;
        [key: string]: any;
    }
} 