# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a HTML5 space shooting game built with TypeScript/JavaScript and Canvas 2D API. The project uses a manager-based architecture with ES6 modules and is currently in the process of migrating from JavaScript to TypeScript.

## Development Commands

### Build and Run
```bash
npm run dev              # Build and start development server on port 8000
npm run dev:watch        # Build with TypeScript watch mode and start dev server
npm run start            # Start production server on port 8080
```

### Build Commands
```bash
npm run build            # Build for development (copies JS files)
npm run build:prod       # Full TypeScript build for production
npm run clean            # Clean dist directory
```

### Code Quality
```bash
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint on TypeScript files
npm run format           # Format code with Prettier
```

## Architecture Overview

### Core Architecture Pattern
The project follows a **Manager Pattern** with a central `Game` class coordinating specialized managers:

- **Game.ts**: Main game controller, manages game loop and coordinates all subsystems
- **Manager System**: Specialized managers handle specific aspects of game functionality
- **Configuration-Driven**: Game parameters centralized in `src/config/gameConfig.ts`

### Key Managers and Their Responsibilities

1. **GameStateManager**: Game state transitions (start/playing/paused/game over/level up)
2. **SpawnManager**: Enemy and power-up generation with level-based scaling
3. **InputManager**: Keyboard input handling and game controls
4. **AudioManager**: Web Audio API sound generation and management
5. **UIManager**: Game interface rendering and debug information
6. **CollisionManager**: Collision detection between all game objects

### Core Game Classes

- **Player**: Player ship with movement, shooting, and power-up effects
- **Enemy**: Base enemy class with multiple specialized subclasses
- **Bullet**: Projectile system for player and enemy weapons
- **PowerUp**: Power-up system with various effect types
- **ParticleSystem**: Visual effects for explosions and trails
- **Background**: Animated starfield background rendering

## TypeScript Migration Status

**IMPORTANT**: This project is currently in a mixed TypeScript/JavaScript state. Both `.ts` and `.js` files exist for most modules.

### Current State Issues:
- Dual maintenance of `.js` and `.ts` files
- Build system uses JavaScript files as import sources
- Type safety is compromised

### When Working on This Project:
1. **Always edit the TypeScript files** (`.ts` extension) 
2. **Never edit the `.js` files directly** - they should be generated/copied from TypeScript
3. **Run `npm run type-check`** before committing changes
4. **Use the TypeScript imports** in new code
5. **Consider completing the TypeScript migration** by removing redundant `.js` files

## Game Configuration

All game parameters are centralized in `src/config/gameConfig.ts`:
- Canvas dimensions and rendering settings
- Player attributes (speed, health, weapon cooldown)
- Enemy configurations (health, scoring, movement patterns)
- Power-up effect durations and behaviors
- Level progression and difficulty scaling

## Development Guidelines

### Code Organization
- **Classes**: Place in `src/classes/` directory
- **Managers**: Place in `src/managers/` directory
- **Utilities**: Place in `src/utils/` directory
- **Types**: Define in `src/types/` directory

### Adding New Features

#### New Enemy Types:
1. Create subclass in `src/classes/Enemy.ts`
2. Add configuration to `src/config/gameConfig.ts`
3. Update spawn logic in `SpawnManager.ts`

#### New Power-ups:
1. Define in `src/config/gameConfig.ts`
2. Add rendering logic in `src/classes/PowerUp.ts`
3. Implement effect in `src/classes/Player.ts`

#### New Managers:
1. Create in `src/managers/` directory
2. Initialize in `Game.ts` constructor
3. Add to game loop if needed

### Testing and Debugging

- Use browser dev tools for debugging
- Game provides debug object with performance metrics
- Test across different browsers (Chrome 88+, Firefox 85+, Safari 14+)
- Verify performance with 50+ simultaneous objects

### Performance Considerations

- Object pooling is used for bullets and particles
- Collision detection is optimized with spatial partitioning
- Particle system manages lifecycle automatically
- Canvas rendering uses requestAnimationFrame for smooth 60fps

## File Structure Context

```
src/
├── Game.ts              # Main game controller
├── main.ts              # Application entry point
├── classes/             # Game entity classes
│   ├── Player.ts        # Player ship
│   ├── Enemy.ts         # Enemy types
│   ├── Bullet.ts        # Projectile system
│   ├── PowerUp.ts       # Power-up effects
│   ├── Particle.ts      # Particle effects
│   └── Background.ts    # Background rendering
├── managers/            # System managers
│   ├── GameStateManager.ts
│   ├── SpawnManager.ts
│   ├── InputManager.ts
│   ├── AudioManager.ts
│   ├── UIManager.ts
│   └── CollisionManager.ts
├── config/              # Game configuration
│   └── gameConfig.ts    # Centralized parameters
├── utils/               # Utility functions
│   └── helpers.ts       # Math, storage, event helpers
└── types/               # TypeScript type definitions
    ├── global.ts        # Global type definitions
    └── modules.d.ts     # Module declarations
```

## Common Issues and Solutions

### Build Issues
- If TypeScript compilation fails, check `tsconfig.json` configuration
- Ensure all imports use relative paths with file extensions
- Run `npm run clean` before full rebuild

### Performance Issues
- Monitor object count in debug panel
- Check for memory leaks in particle systems
- Verify requestAnimationFrame usage for smooth rendering

### Audio Issues
- Web Audio API requires user interaction to start
- Check browser compatibility for audio features
- Verify audio context state before playing sounds