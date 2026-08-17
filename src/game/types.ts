export type ObstacleType =
  | 'hammer'
  | 'spinner'
  | 'gap'
  | 'movingBlock'
  | 'fallingPlatform';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  /** distance along the track in world px (0 = start) */
  z: number;
  /** lane index 0..2 — for hammer/movingBlock this is the centre of the sweep */
  lane: number;
  /** length of the hazard along the track */
  depth: number;
  /** sweep period in ms for moving obstacles */
  period: number;
  /** phase offset 0..1 so obstacles are not synchronised */
  phase: number;
}

export interface Coin {
  id: number;
  z: number;
  lane: number;
}

export interface Decoration {
  id: number;
  z: number;
  /** -1 = left side, 1 = right side */
  side: number;
  size: number;
  kind: number;
}

export interface LevelData {
  world: number;
  level: number;
  /** total track length in world px */
  length: number;
  /** forward speed in world px per second */
  speed: number;
  obstacles: Obstacle[];
  coins: Coin[];
  decorations: Decoration[];
}

export const LANES = 3;
export const LANE_WIDTH = 92;
export const TRACK_WIDTH = LANES * LANE_WIDTH;
export const BALL_SIZE = 46;
export const JUMP_DURATION = 620;
export const JUMP_HEIGHT = 96;

/** lane index -> x offset from track centre (in plane px) */
export function laneX(lane: number): number {
  return (lane - 1) * LANE_WIDTH;
}
