export interface WorldTheme {
  id: number;
  name: string;
  emoji: string;
  /** deep background behind the horizon */
  sky: string;
  skyGlow: string;
  /** track surface */
  track: string;
  trackAlt: string;
  trackEdge: string;
  laneLine: string;
  /** obstacle accent */
  hazard: string;
  hazardDark: string;
  decoration: string;
  fog: string;
}

export const WORLDS: WorldTheme[] = [
  {
    id: 0,
    name: 'Forest',
    emoji: '🌳',
    sky: '#0b2818',
    skyGlow: '#1d5c33',
    track: '#2e7d4f',
    trackAlt: '#2a7248',
    trackEdge: '#8ee6b0',
    laneLine: '#4c9e6f',
    hazard: '#e0533d',
    hazardDark: '#a33324',
    decoration: '#1f5c38',
    fog: '#0b2818',
  },
  {
    id: 1,
    name: 'Lava',
    emoji: '🌋',
    sky: '#26090b',
    skyGlow: '#7a1f14',
    track: '#4a2c2a',
    trackAlt: '#412624',
    trackEdge: '#ff9d45',
    laneLine: '#6b413d',
    hazard: '#ff5c1f',
    hazardDark: '#c23a0a',
    decoration: '#611b12',
    fog: '#26090b',
  },
  {
    id: 2,
    name: 'Ice',
    emoji: '❄️',
    sky: '#0d2436',
    skyGlow: '#2d6d94',
    track: '#7fc4de',
    trackAlt: '#74b9d4',
    trackEdge: '#eafaff',
    laneLine: '#a7dced',
    hazard: '#3a6bd6',
    hazardDark: '#26479c',
    decoration: '#5da9c7',
    fog: '#0d2436',
  },
  {
    id: 3,
    name: 'Space',
    emoji: '🌌',
    sky: '#0a0a1f',
    skyGlow: '#3b2a72',
    track: '#3d3670',
    trackAlt: '#373164',
    trackEdge: '#a48bff',
    laneLine: '#544b93',
    hazard: '#ff4fa0',
    hazardDark: '#b82a6e',
    decoration: '#241f4a',
    fog: '#0a0a1f',
  },
  {
    id: 4,
    name: 'Desert',
    emoji: '🏜️',
    sky: '#3a2410',
    skyGlow: '#a8692a',
    track: '#d9a05b',
    trackAlt: '#cf9752',
    trackEdge: '#ffe4b0',
    laneLine: '#b98643',
    hazard: '#b03a2e',
    hazardDark: '#7e2118',
    decoration: '#8f5f2a',
    fog: '#3a2410',
  },
  {
    id: 5,
    name: 'Sky',
    emoji: '☁️',
    sky: '#1d4e89',
    skyGlow: '#5fa8e8',
    track: '#e9f4ff',
    trackAlt: '#dcecfb',
    trackEdge: '#ffffff',
    laneLine: '#bcd8f0',
    hazard: '#f2b12e',
    hazardDark: '#c48611',
    decoration: '#cfe6fa',
    fog: '#1d4e89',
  },
];

export interface BallSkin {
  id: string;
  name: string;
  emoji: string;
  price: number;
  color: string;
  highlight: string;
  trail: string;
  glow: string;
}

export const BALLS: BallSkin[] = [
  {
    id: 'classic',
    name: 'Classic',
    emoji: '⚪',
    price: 0,
    color: '#f4f4f6',
    highlight: '#ffffff',
    trail: 'rgba(255,255,255,0.55)',
    glow: 'rgba(255,255,255,0.35)',
  },
  {
    id: 'crystal',
    name: 'Crystal',
    emoji: '🔵',
    price: 100,
    color: '#5fb8ef',
    highlight: '#d8f2ff',
    trail: 'rgba(95,184,239,0.6)',
    glow: 'rgba(95,184,239,0.4)',
  },
  {
    id: 'fire',
    name: 'Fire',
    emoji: '🔥',
    price: 250,
    color: '#ff7b2e',
    highlight: '#ffd9a1',
    trail: 'rgba(255,123,46,0.65)',
    glow: 'rgba(255,123,46,0.45)',
  },
  {
    id: 'ice',
    name: 'Ice',
    emoji: '❄️',
    price: 250,
    color: '#bfeaf7',
    highlight: '#ffffff',
    trail: 'rgba(191,234,247,0.6)',
    glow: 'rgba(191,234,247,0.45)',
  },
  {
    id: 'electric',
    name: 'Electric',
    emoji: '⚡',
    price: 400,
    color: '#ffd93b',
    highlight: '#fff7cf',
    trail: 'rgba(255,217,59,0.65)',
    glow: 'rgba(255,217,59,0.45)',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '🌌',
    price: 600,
    color: '#8a5cf6',
    highlight: '#e3d5ff',
    trail: 'rgba(138,92,246,0.65)',
    glow: 'rgba(138,92,246,0.5)',
  },
];

export const LEVELS_PER_WORLD = 5;
export const TOTAL_LEVELS = WORLDS.length * LEVELS_PER_WORLD;

export const UI = {
  bg: '#0d1220',
  card: '#1a2236',
  cardLight: '#242f4a',
  text: '#f2f5fc',
  textDim: '#8d99b8',
  accent: '#4f8cff',
  accentDark: '#2f66d0',
  gold: '#ffce3d',
  goldDark: '#d9a415',
  green: '#3ecf72',
  red: '#ff5560',
  outline: 'rgba(255,255,255,0.08)',
};
