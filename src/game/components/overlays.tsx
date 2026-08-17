import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameButton, Stars } from '../../components/ui';
import { UI, WorldTheme } from '../../theme/theme';
import { Fireworks } from './effects';

export function HUD({
  score,
  coins,
  onPause,
}: {
  score: number;
  coins: number;
  onPause: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.hud, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      pointerEvents="box-none">
      <Pressable onPress={onPause} style={styles.pauseBtn} hitSlop={10}>
        <View style={styles.pauseBar} />
        <View style={styles.pauseBar} />
      </Pressable>
      <View style={styles.hudPill}>
        <Text style={styles.hudLabel}>SCORE</Text>
        <Text style={styles.hudValue}>{score}</Text>
      </View>
      <View style={styles.hudPill}>
        <Text style={styles.hudCoin}>🪙</Text>
        <Text style={styles.hudValue}>{coins}</Text>
      </View>
    </View>
  );
}

function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          {
            translateY: v.interpolate({
              inputRange: [0, 1],
              outputRange: [26, 0],
            }),
          },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
        ],
      }}>
      {children}
    </Animated.View>
  );
}

export function ReadyOverlay({
  theme,
  world,
  level,
}: {
  theme: WorldTheme;
  world: number;
  level: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.readyWrap} pointerEvents="none">
      <FadeIn>
        <Text style={styles.worldTitle}>
          {theme.emoji} {theme.name}
        </Text>
        <Text style={styles.levelTitle}>
          LEVEL {world + 1}-{level + 1}
        </Text>
      </FadeIn>
      <Animated.Text
        style={[
          styles.tapToRoll,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.45, 1],
            }),
          },
        ]}>
        TAP TO ROLL
      </Animated.Text>
      <Text style={styles.hint}>swipe ◀ ▶ to steer · swipe ▲ or tap to jump</Text>
    </View>
  );
}

export function GameOverOverlay({
  score,
  onRetry,
  onHome,
}: {
  score: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  return (
    <View style={styles.dim}>
      <FadeIn>
        <Text style={styles.bigEmoji}>💀</Text>
        <Text style={styles.overlayTitle}>GAME OVER</Text>
        <Text style={styles.overlaySub}>Score {score}</Text>
      </FadeIn>
      <FadeIn delay={140}>
        <GameButton label="RETRY" icon="↻" color={UI.green} onPress={onRetry} />
      </FadeIn>
      <FadeIn delay={240}>
        <GameButton
          label="HOME"
          icon="⌂"
          color={UI.cardLight}
          onPress={onHome}
          style={styles.gapTop}
        />
      </FadeIn>
    </View>
  );
}

export function LevelCompleteOverlay({
  stars,
  coins,
  score,
  isLastLevel,
  width,
  height,
  onNext,
  onHome,
}: {
  stars: number;
  coins: number;
  score: number;
  isLastLevel: boolean;
  width: number;
  height: number;
  onNext: () => void;
  onHome: () => void;
}) {
  return (
    <View style={styles.dim}>
      <Fireworks width={width} height={height} />
      <FadeIn>
        <Text style={styles.overlayTitle}>LEVEL COMPLETE</Text>
      </FadeIn>
      <FadeIn delay={160}>
        <Stars count={stars} size={40} />
      </FadeIn>
      <FadeIn delay={300}>
        <Text style={styles.overlaySub}>
          🪙 +{coins} · Score {score}
        </Text>
      </FadeIn>
      <FadeIn delay={430}>
        <GameButton
          label={isLastLevel ? 'ALL DONE!' : 'NEXT LEVEL'}
          icon="▶"
          color={UI.green}
          onPress={onNext}
        />
      </FadeIn>
      <FadeIn delay={520}>
        <GameButton
          label="HOME"
          icon="⌂"
          color={UI.cardLight}
          onPress={onHome}
          style={styles.gapTop}
        />
      </FadeIn>
    </View>
  );
}

export function PauseOverlay({
  onResume,
  onRetry,
  onHome,
}: {
  onResume: () => void;
  onRetry: () => void;
  onHome: () => void;
}) {
  return (
    <View style={styles.dim}>
      <Text style={styles.overlayTitle}>PAUSED</Text>
      <GameButton label="RESUME" icon="▶" color={UI.green} onPress={onResume} />
      <GameButton
        label="RETRY"
        icon="↻"
        color={UI.accent}
        onPress={onRetry}
        style={styles.gapTop}
      />
      <GameButton
        label="HOME"
        icon="⌂"
        color={UI.cardLight}
        onPress={onHome}
        style={styles.gapTop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  pauseBar: {
    width: 5,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 7,
  },
  hudLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hudValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  hudCoin: {
    fontSize: 15,
  },
  readyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  worldTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  levelTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 6,
  },
  tapToRoll: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 40,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 2 },
  },
  hint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 14,
    letterSpacing: 0.4,
  },
  dim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,10,20,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigEmoji: {
    fontSize: 54,
    textAlign: 'center',
    marginBottom: 8,
  },
  overlayTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 14,
  },
  overlaySub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 26,
  },
  gapTop: {
    marginTop: 14,
  },
});

export default memo(HUD);
