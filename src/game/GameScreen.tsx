import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BALLS, LEVELS_PER_WORLD, TOTAL_LEVELS, WORLDS } from '../theme/theme';
import { useGame } from '../state/GameContext';
import { SoundManager } from '../audio/SoundManager';
import { generateLevel, levelIndex, starsForRun } from './levelGen';
import {
  BALL_SIZE,
  JUMP_DURATION,
  JUMP_HEIGHT,
  LANE_WIDTH,
} from './types';
import { TrackSurface, PLANE_WIDTH } from './components/TrackSurface';
import { ObstacleView } from './components/ObstacleView';
import { CoinView } from './components/CoinView';
import { BallView } from './components/BallView';
import { Burst, FogOverlay } from './components/effects';
import {
  GameOverOverlay,
  HUD,
  LevelCompleteOverlay,
  PauseOverlay,
  ReadyOverlay,
} from './components/overlays';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const TILT = '55deg';
const BILLBOARD = '-55deg';
const PERSPECTIVE = 900;
const APRON_END = 2400;
const APRON_START = 800;

type Phase = 'ready' | 'running' | 'paused' | 'dead' | 'won';

export default function GameScreen({ route, navigation }: Props) {
  const { world, level } = route.params;
  const { width, height } = useWindowDimensions();
  const game = useGame();

  const theme = WORLDS[world];
  const levelData = useMemo(() => generateLevel(world, level), [world, level]);
  const skin = useMemo(
    () => BALLS.find(b => b.id === game.selectedBall) ?? BALLS[0],
    [game.selectedBall],
  );

  const planeH = levelData.length + APRON_END + APRON_START;
  const yOf = useCallback(
    (z: number) => levelData.length + APRON_END - z,
    [levelData.length],
  );
  const ballY0 = height * 0.64;
  const planeTop = ballY0 - (levelData.length + APRON_END);
  const planeLeft = (width - PLANE_WIDTH) / 2;

  const sortedCoins = useMemo(
    () => [...levelData.coins].sort((a, b) => a.z - b.z),
    [levelData],
  );

  const [runKey, setRunKey] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [hudScore, setHudScore] = useState(0);
  const [hudCoins, setHudCoins] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [result, setResult] = useState<{
    stars: number;
    coins: number;
    score: number;
  } | null>(null);

  // engine-driven animated values, rebuilt on every retry
  const anim = useMemo(() => {
    const sweeps = new Map<number, Animated.Value>();
    const coinOps = new Map<number, Animated.Value>();
    levelData.obstacles.forEach(o => {
      if (o.type === 'hammer' || o.type === 'movingBlock') {
        sweeps.set(o.id, new Animated.Value(0));
      }
    });
    levelData.coins.forEach(c => coinOps.set(c.id, new Animated.Value(1)));
    return {
      trackY: new Animated.Value(0),
      ballX: new Animated.Value(0),
      ballLift: new Animated.Value(0),
      ballScale: new Animated.Value(1),
      ballOpacity: new Animated.Value(1),
      shadowScale: new Animated.Value(1),
      shadowOpacity: new Animated.Value(0.32),
      shakeX: new Animated.Value(0),
      shakeY: new Animated.Value(0),
      sweeps,
      coinOps,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData, runKey]);

  // engine state kept in refs — no re-render per frame
  const eng = useRef({
    status: 'ready' as Phase,
    z: 0,
    lanePos: 1,
    laneTarget: 1,
    jumpStart: 0,
    runTime: 0,
    lastTs: 0,
    coinsCollected: 0,
    nextCoin: 0,
    collected: new Set<number>(),
    contact: new Map<number, number>(),
    lastHud: 0,
  });

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const setStatus = useCallback((s: Phase) => {
    eng.current.status = s;
    setPhase(s);
  }, []);

  // reset engine on retry / level change
  useEffect(() => {
    eng.current = {
      status: 'ready',
      z: 0,
      lanePos: 1,
      laneTarget: 1,
      jumpStart: 0,
      runTime: 0,
      lastTs: 0,
      coinsCollected: 0,
      nextCoin: 0,
      collected: new Set<number>(),
      contact: new Map<number, number>(),
      lastHud: 0,
    };
    setPhase('ready');
    setHudScore(0);
    setHudCoins(0);
    setResult(null);
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, levelData]);

  const die = useCallback(
    (kind: 'crash' | 'fall') => {
      const e = eng.current;
      e.status = 'dead';
      setPhase('dead');
      SoundManager.play('crash');
      if (kind === 'crash') {
        setBurstKey(k => k + 1);
        anim.ballOpacity.setValue(0);
        anim.shadowOpacity.setValue(0);
        Animated.sequence([
          Animated.timing(anim.shakeX, {
            toValue: 9,
            duration: 45,
            useNativeDriver: false,
          }),
          Animated.timing(anim.shakeX, {
            toValue: -8,
            duration: 45,
            useNativeDriver: false,
          }),
          Animated.timing(anim.shakeY, {
            toValue: 7,
            duration: 45,
            useNativeDriver: false,
          }),
          Animated.timing(anim.shakeX, {
            toValue: 0,
            duration: 45,
            useNativeDriver: false,
          }),
          Animated.timing(anim.shakeY, {
            toValue: 0,
            duration: 45,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(anim.ballLift, {
            toValue: 170,
            duration: 480,
            useNativeDriver: false,
          }),
          Animated.timing(anim.ballScale, {
            toValue: 0.4,
            duration: 480,
            useNativeDriver: false,
          }),
          Animated.timing(anim.ballOpacity, {
            toValue: 0,
            duration: 480,
            useNativeDriver: false,
          }),
          Animated.timing(anim.shadowOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
      const score =
        Math.floor(e.z / 10) + e.coinsCollected * 10;
      setHudScore(score);
      later(() => setResult({ stars: 0, coins: e.coinsCollected, score }), 950);
    },
    [anim, later],
  );

  const win = useCallback(() => {
    const e = eng.current;
    e.status = 'won';
    setPhase('won');
    SoundManager.play('win');
    const stars = starsForRun(e.coinsCollected, levelData.coins.length);
    const score = Math.floor(levelData.length / 10) + e.coinsCollected * 10;
    game.completeLevel(levelIndex(world, level), stars, e.coinsCollected, score);
    later(
      () => setResult({ stars, coins: e.coinsCollected, score }),
      700,
    );
  }, [game, level, levelData, later, world]);

  // main game loop
  useEffect(() => {
    let raf = 0;
    const step = (ts: number) => {
      const e = eng.current;
      const dt = e.lastTs ? Math.min(48, ts - e.lastTs) : 16;
      e.lastTs = ts;

      if (e.status === 'running') {
        e.runTime += dt;
        const progress = e.z / levelData.length;
        e.z += ((levelData.speed * dt) / 1000) * (1 + 0.1 * progress);

        // smooth lane steering
        e.lanePos += (e.laneTarget - e.lanePos) * Math.min(1, (dt / 1000) * 13);

        // jump arc
        let h = 0;
        if (e.jumpStart > 0) {
          const u = (ts - e.jumpStart) / JUMP_DURATION;
          if (u >= 1) {
            e.jumpStart = 0;
          } else {
            h = 4 * JUMP_HEIGHT * u * (1 - u);
          }
        }
        const hn = h / JUMP_HEIGHT;

        anim.trackY.setValue(e.z);
        anim.ballX.setValue((e.lanePos - 1) * LANE_WIDTH);
        anim.ballLift.setValue(-h);
        anim.ballScale.setValue(1 + 0.22 * hn);
        anim.shadowScale.setValue(1 - 0.4 * hn);
        anim.shadowOpacity.setValue(0.32 * (1 - 0.55 * hn));

        // ---- coins ----
        while (
          e.nextCoin < sortedCoins.length &&
          sortedCoins[e.nextCoin].z < e.z - 70
        ) {
          e.nextCoin++;
        }
        for (
          let i = e.nextCoin;
          i < sortedCoins.length && sortedCoins[i].z <= e.z + 70;
          i++
        ) {
          const c = sortedCoins[i];
          if (
            !e.collected.has(c.id) &&
            Math.abs(c.z - e.z) < 52 &&
            Math.abs(e.lanePos - c.lane) < 0.55
          ) {
            e.collected.add(c.id);
            e.coinsCollected++;
            anim.coinOps.get(c.id)?.setValue(0);
            SoundManager.play('coin', 0.8);
          }
        }

        // ---- obstacles ----
        const ballPx = (e.lanePos - 1) * LANE_WIDTH;
        for (const o of levelData.obstacles) {
          const dz = o.z + o.depth / 2 - e.z;
          if (Math.abs(dz) > 1000) {
            continue;
          }
          let sweepX = 0;
          if (o.type === 'hammer' || o.type === 'movingBlock') {
            sweepX =
              Math.sin(2 * Math.PI * (e.runTime / o.period + o.phase)) *
              LANE_WIDTH;
            anim.sweeps.get(o.id)?.setValue(sweepX);
          }
          if (e.status !== 'running') {
            continue;
          }
          switch (o.type) {
            case 'gap':
              if (
                Math.abs(dz) < o.depth / 2 + 8 &&
                Math.abs(e.lanePos - o.lane) < 0.5 &&
                h < 6
              ) {
                die('fall');
              }
              break;
            case 'spinner':
              if (
                Math.abs(dz) < o.depth / 2 + 18 &&
                Math.abs(e.lanePos - o.lane) < 0.6 &&
                h < 34
              ) {
                die('crash');
              }
              break;
            case 'fallingPlatform':
              if (
                Math.abs(dz) < o.depth / 2 &&
                Math.abs(e.lanePos - o.lane) < 0.5 &&
                h < 6
              ) {
                const c = (e.contact.get(o.id) ?? 0) + dt;
                e.contact.set(o.id, c);
                if (c > 180) {
                  die('fall');
                }
              }
              break;
            case 'hammer':
              if (
                Math.abs(dz) < o.depth / 2 + 22 &&
                Math.abs(sweepX - ballPx) < 50 &&
                h < 30
              ) {
                die('crash');
              }
              break;
            case 'movingBlock':
              if (
                Math.abs(dz) < o.depth / 2 + 24 &&
                Math.abs(sweepX - ballPx) < 60 &&
                h < 55
              ) {
                die('crash');
              }
              break;
          }
        }

        // ---- finish ----
        if (e.status === 'running' && e.z >= levelData.length) {
          win();
        }

        // ---- HUD throttle ----
        if (ts - e.lastHud > 100) {
          e.lastHud = ts;
          setHudScore(Math.floor(e.z / 10) + e.coinsCollected * 10);
          setHudCoins(e.coinsCollected);
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [anim, die, levelData, sortedCoins, win]);

  // ---- input ----
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderRelease: (_evt, g) => {
          const e = eng.current;
          if (e.status === 'ready') {
            setStatus('running');
            return;
          }
          if (e.status !== 'running') {
            return;
          }
          const { dx, dy } = g;
          if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
            const next = Math.max(0, Math.min(2, e.laneTarget + (dx > 0 ? 1 : -1)));
            if (next !== e.laneTarget) {
              e.laneTarget = next;
              SoundManager.play('whoosh', 0.6);
            }
            return;
          }
          const isTap = Math.abs(dx) < 14 && Math.abs(dy) < 14;
          if ((dy < -42 || isTap) && e.jumpStart === 0) {
            e.jumpStart = e.lastTs;
            SoundManager.play('jump', 0.7);
          }
        },
      }),
    [setStatus],
  );

  const retry = useCallback(() => setRunKey(k => k + 1), []);
  const goHome = useCallback(() => navigation.popToTop(), [navigation]);
  const idx = levelIndex(world, level);
  const isLastLevel = idx >= TOTAL_LEVELS - 1;
  const nextLevel = useCallback(() => {
    if (isLastLevel) {
      navigation.popToTop();
      return;
    }
    const nIdx = idx + 1;
    navigation.replace('Game', {
      world: Math.floor(nIdx / LEVELS_PER_WORLD),
      level: nIdx % LEVELS_PER_WORLD,
    });
  }, [idx, isLastLevel, navigation]);

  const pause = useCallback(() => {
    if (eng.current.status === 'running') {
      setStatus('paused');
    }
  }, [setStatus]);
  const resume = useCallback(() => setStatus('running'), [setStatus]);

  return (
    <View
      style={[styles.root, { backgroundColor: theme.sky }]}
      {...pan.panHandlers}>
      <Animated.View
        style={[
          styles.root,
          {
            transform: [
              { translateX: anim.shakeX },
              { translateY: anim.shakeY },
            ],
          },
        ]}>
        {/* horizon glow */}
        <View
          style={[
            styles.glow,
            {
              top: height * 0.22,
              height: height * 0.26,
              backgroundColor: theme.skyGlow,
            },
          ]}
        />

        {/* 3D viewport */}
        <View
          style={[
            styles.viewport,
            { transform: [{ perspective: PERSPECTIVE }, { rotateX: TILT }] },
          ]}
          pointerEvents="none">
          {/* scrolling world plane */}
          <Animated.View
            key={`plane-${runKey}`}
            style={{
              position: 'absolute',
              left: planeLeft,
              top: planeTop,
              width: PLANE_WIDTH,
              height: planeH,
              transform: [{ translateY: anim.trackY }],
            }}>
            <TrackSurface
              level={levelData}
              theme={theme}
              planeH={planeH}
              yOf={yOf}
            />
            {levelData.coins.map(c => (
              <CoinView
                key={c.id}
                coin={c}
                yOf={yOf}
                opacity={anim.coinOps.get(c.id)!}
              />
            ))}
            {levelData.obstacles.map(o => (
              <ObstacleView
                key={o.id}
                obstacle={o}
                theme={theme}
                yOf={yOf}
                sweep={anim.sweeps.get(o.id)}
              />
            ))}
          </Animated.View>

          {/* ball group — screen-fixed, lanes exact because it shares plane space */}
          <View style={{ position: 'absolute', left: width / 2, top: ballY0 }}>
            <Animated.View style={{ transform: [{ translateX: anim.ballX }] }}>
              {/* ground trail */}
              <Animated.View style={{ opacity: anim.ballOpacity }}>
                {[18, 34, 50].map((off, i) => (
                  <View
                    key={off}
                    style={{
                      position: 'absolute',
                      left: -(14 - i * 3),
                      top: off,
                      width: (14 - i * 3) * 2,
                      height: (14 - i * 3) * 2,
                      borderRadius: 14 - i * 3,
                      backgroundColor: skin.trail,
                      opacity: 0.5 - i * 0.14,
                    }}
                  />
                ))}
              </Animated.View>
              {/* shadow */}
              <Animated.View
                style={{
                  position: 'absolute',
                  left: -22,
                  top: -22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#000000',
                  opacity: anim.shadowOpacity,
                  transform: [{ scale: anim.shadowScale }],
                }}
              />
              {/* billboarded ball */}
              <Animated.View
                style={{
                  position: 'absolute',
                  left: -BALL_SIZE / 2,
                  top: -BALL_SIZE + 6,
                  opacity: anim.ballOpacity,
                  transform: [
                    { rotateX: BILLBOARD },
                    { translateY: anim.ballLift },
                    { scale: anim.ballScale },
                  ],
                }}>
                <BallView skin={skin} rolling={phase === 'running'} />
              </Animated.View>
              {/* crash burst */}
              {burstKey > 0 && (
                <View
                  style={{ position: 'absolute', left: 0, top: -BALL_SIZE / 2 }}>
                  <Burst
                    key={burstKey}
                    color={skin.color}
                    count={14}
                    radius={85}
                  />
                </View>
              )}
            </Animated.View>
          </View>
        </View>

        {/* distance fog */}
        <FogOverlay color={theme.fog} height={height} />
      </Animated.View>

      {/* HUD + overlays */}
      {(phase === 'running' || phase === 'paused' || phase === 'ready') && (
        <HUD score={hudScore} coins={hudCoins} onPause={pause} />
      )}
      {phase === 'ready' && (
        <ReadyOverlay theme={theme} world={world} level={level} />
      )}
      {phase === 'paused' && (
        <PauseOverlay onResume={resume} onRetry={retry} onHome={goHome} />
      )}
      {phase === 'dead' && result && (
        <GameOverOverlay score={result.score} onRetry={retry} onHome={goHome} />
      )}
      {phase === 'won' && result && (
        <LevelCompleteOverlay
          stars={result.stars}
          coins={result.coins}
          score={result.score}
          isLastLevel={isLastLevel}
          width={width}
          height={height}
          onNext={nextLevel}
          onHome={goHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0.4,
  },
  viewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
