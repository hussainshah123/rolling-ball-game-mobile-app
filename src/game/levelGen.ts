import { Coin, Decoration, LevelData, Obstacle, ObstacleType } from './types';
import { LEVELS_PER_WORLD } from '../theme/theme';

/** Deterministic mulberry32 PRNG so every level is identical on every run. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OBSTACLE_POOL: ObstacleType[][] = [
  // new types unlock as worlds progress
  ['gap', 'movingBlock'],
  ['gap', 'movingBlock', 'hammer'],
  ['gap', 'movingBlock', 'hammer', 'spinner'],
  ['gap', 'movingBlock', 'hammer', 'spinner', 'fallingPlatform'],
  ['gap', 'hammer', 'spinner', 'fallingPlatform', 'movingBlock'],
  ['gap', 'hammer', 'spinner', 'fallingPlatform', 'movingBlock'],
];

export function levelIndex(world: number, level: number): number {
  return world * LEVELS_PER_WORLD + level;
}

export function generateLevel(world: number, level: number): LevelData {
  const idx = levelIndex(world, level);
  const rng = makeRng(1337 + idx * 7919);

  const length = 8200 + world * 1400 + level * 550;
  const speed = Math.min(720, 330 + world * 42 + level * 16);

  const pool = OBSTACLE_POOL[Math.min(world, OBSTACLE_POOL.length - 1)];
  const spacingBase = Math.max(560, 980 - world * 60 - level * 28);

  const obstacles: Obstacle[] = [];
  const coins: Coin[] = [];
  const decorations: Decoration[] = [];

  let id = 1;
  let z = 1500; // safe run-up before the first hazard
  while (z < length - 1200) {
    const type = pool[Math.floor(rng() * pool.length)];
    const lane = Math.floor(rng() * 3);
    const depth =
      type === 'gap'
        ? 150 + Math.floor(rng() * 60)
        : type === 'fallingPlatform'
        ? 170
        : type === 'spinner'
        ? 120
        : 90;
    obstacles.push({
      id: id++,
      type,
      z,
      lane: type === 'hammer' || type === 'movingBlock' ? 1 : lane,
      depth,
      period: 1500 + Math.floor(rng() * 900) - world * 60,
      phase: rng(),
    });

    // coin run between hazards, biased to a safe lane
    const coinLane = (lane + 1 + Math.floor(rng() * 2)) % 3;
    const runStart = z + depth + 190;
    const count = 3 + Math.floor(rng() * 3);
    for (let c = 0; c < count; c++) {
      const cz = runStart + c * 95;
      if (cz < length - 900) {
        coins.push({ id: id++, z: cz, lane: coinLane });
      }
    }

    z += spacingBase + Math.floor(rng() * 320);
  }

  // opening coin line so the player scores immediately
  for (let c = 0; c < 5; c++) {
    coins.push({ id: id++, z: 520 + c * 95, lane: 1 });
  }

  for (let d = 250; d < length; d += 340 + Math.floor(rng() * 260)) {
    decorations.push({
      id: id++,
      z: d,
      side: rng() > 0.5 ? 1 : -1,
      size: 18 + Math.floor(rng() * 22),
      kind: Math.floor(rng() * 3),
    });
  }

  return { world, level, length, speed, obstacles, coins, decorations };
}

/** stars from coin ratio: 1 star to finish, up to 3 with coins */
export function starsForRun(collected: number, total: number): number {
  if (total <= 0) {
    return 3;
  }
  const ratio = collected / total;
  if (ratio >= 0.8) {
    return 3;
  }
  if (ratio >= 0.45) {
    return 2;
  }
  return 1;
}
