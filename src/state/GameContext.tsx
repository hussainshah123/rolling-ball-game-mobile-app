import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BALLS, TOTAL_LEVELS } from '../theme/theme';
import { SoundManager } from '../audio/SoundManager';

export interface GameState {
  coins: number;
  ownedBalls: string[];
  selectedBall: string;
  /** stars earned per level index (0 = not completed) */
  stars: number[];
  /** highest unlocked level index */
  unlockedLevel: number;
  soundOn: boolean;
  bestScore: number;
  ready: boolean;
}

interface GameActions {
  addCoins: (amount: number) => void;
  buyBall: (id: string) => boolean;
  selectBall: (id: string) => void;
  completeLevel: (levelIdx: number, stars: number, coins: number, score: number) => void;
  setSoundOn: (on: boolean) => void;
  resetProgress: () => void;
}

const DEFAULT_STATE: GameState = {
  coins: 0,
  ownedBalls: ['classic'],
  selectedBall: 'classic',
  stars: new Array(TOTAL_LEVELS).fill(0),
  unlockedLevel: 0,
  soundOn: true,
  bestScore: 0,
  ready: false,
};

const STORAGE_KEY = '@rollingball/state/v1';

const GameContext = createContext<(GameState & GameActions) | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<GameState>;
          setState(prev => ({
            ...prev,
            ...saved,
            stars: [
              ...(saved.stars ?? []),
              ...new Array(TOTAL_LEVELS).fill(0),
            ].slice(0, TOTAL_LEVELS),
            ready: true,
          }));
        } else {
          setState(prev => ({ ...prev, ready: true }));
        }
      })
      .catch(() => setState(prev => ({ ...prev, ready: true })))
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    SoundManager.setEnabled(state.soundOn);
  }, [state.soundOn]);

  useEffect(() => {
    if (!hydrated.current || !state.ready) {
      return;
    }
    // JSON.stringify drops undefined — `ready` is runtime-only and never persisted
    const persisted = { ...state, ready: undefined };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  }, []);

  const buyBall = useCallback((id: string): boolean => {
    const ball = BALLS.find(b => b.id === id);
    if (!ball) {
      return false;
    }
    let bought = false;
    setState(prev => {
      if (prev.ownedBalls.includes(id) || prev.coins < ball.price) {
        return prev;
      }
      bought = true;
      return {
        ...prev,
        coins: prev.coins - ball.price,
        ownedBalls: [...prev.ownedBalls, id],
        selectedBall: id,
      };
    });
    return bought;
  }, []);

  const selectBall = useCallback((id: string) => {
    setState(prev =>
      prev.ownedBalls.includes(id) ? { ...prev, selectedBall: id } : prev,
    );
  }, []);

  const completeLevel = useCallback(
    (levelIdx: number, stars: number, coins: number, score: number) => {
      setState(prev => {
        const nextStars = [...prev.stars];
        nextStars[levelIdx] = Math.max(nextStars[levelIdx] ?? 0, stars);
        return {
          ...prev,
          coins: prev.coins + coins,
          stars: nextStars,
          unlockedLevel: Math.min(
            TOTAL_LEVELS - 1,
            Math.max(prev.unlockedLevel, levelIdx + 1),
          ),
          bestScore: Math.max(prev.bestScore, score),
        };
      });
    },
    [],
  );

  const setSoundOn = useCallback((on: boolean) => {
    setState(prev => ({ ...prev, soundOn: on }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...DEFAULT_STATE, ready: true });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addCoins,
      buyBall,
      selectBall,
      completeLevel,
      setSoundOn,
      resetProgress,
    }),
    [state, addCoins, buyBall, selectBall, completeLevel, setSoundOn, resetProgress],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return ctx;
}
