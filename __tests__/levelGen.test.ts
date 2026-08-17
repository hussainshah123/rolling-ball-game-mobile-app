/**
 * @format
 */

import { generateLevel, levelIndex, starsForRun } from '../src/game/levelGen';
import { LEVELS_PER_WORLD, TOTAL_LEVELS, WORLDS } from '../src/theme/theme';

describe('levelGen', () => {
  test('is deterministic — same level generates identical data', () => {
    const a = generateLevel(2, 3);
    const b = generateLevel(2, 3);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('every level has obstacles, coins and a sane layout', () => {
    for (let w = 0; w < WORLDS.length; w++) {
      for (let l = 0; l < LEVELS_PER_WORLD; l++) {
        const level = generateLevel(w, l);
        expect(level.length).toBeGreaterThan(4000);
        expect(level.speed).toBeGreaterThan(200);
        expect(level.obstacles.length).toBeGreaterThan(3);
        expect(level.coins.length).toBeGreaterThan(5);
        // no hazard right at the start or past the finish
        for (const o of level.obstacles) {
          expect(o.z).toBeGreaterThanOrEqual(1000);
          expect(o.z + o.depth).toBeLessThan(level.length);
          expect(o.lane).toBeGreaterThanOrEqual(0);
          expect(o.lane).toBeLessThanOrEqual(2);
        }
        for (const c of level.coins) {
          expect(c.lane).toBeGreaterThanOrEqual(0);
          expect(c.lane).toBeLessThanOrEqual(2);
          expect(c.z).toBeLessThan(level.length);
        }
      }
    }
  });

  test('difficulty ramps up across worlds', () => {
    expect(generateLevel(5, 4).speed).toBeGreaterThan(generateLevel(0, 0).speed);
    expect(generateLevel(5, 4).length).toBeGreaterThan(
      generateLevel(0, 0).length,
    );
  });

  test('levelIndex maps world/level pairs uniquely', () => {
    const seen = new Set<number>();
    for (let w = 0; w < WORLDS.length; w++) {
      for (let l = 0; l < LEVELS_PER_WORLD; l++) {
        seen.add(levelIndex(w, l));
      }
    }
    expect(seen.size).toBe(TOTAL_LEVELS);
  });

  test('star rating thresholds', () => {
    expect(starsForRun(0, 100)).toBe(1);
    expect(starsForRun(45, 100)).toBe(2);
    expect(starsForRun(80, 100)).toBe(3);
    expect(starsForRun(0, 0)).toBe(3);
  });
});
