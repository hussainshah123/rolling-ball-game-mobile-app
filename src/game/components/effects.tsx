import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/** Radial particle burst — runs once on mount. Re-key to replay. */
export function Burst({
  color,
  size = 9,
  count = 10,
  radius = 70,
  duration = 550,
}: {
  color: string;
  size?: number;
  count?: number;
  radius?: number;
  duration?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [progress, duration]);

  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.8, 0],
  });

  return (
    <View style={styles.burstWrap} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const tx = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius],
        });
        const ty = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity,
              transform: [{ translateX: tx }, { translateY: ty }],
            }}
          />
        );
      })}
    </View>
  );
}

/** Fireworks for the level-complete screen. */
function FireworksInner({ width, height }: { width: number; height: number }) {
  const spots = [
    { x: width * 0.25, y: height * 0.2, c: '#ffce3d', d: 0 },
    { x: width * 0.72, y: height * 0.16, c: '#5fb8ef', d: 260 },
    { x: width * 0.5, y: height * 0.3, c: '#ff7b9c', d: 520 },
    { x: width * 0.82, y: height * 0.36, c: '#3ecf72', d: 780 },
    { x: width * 0.18, y: height * 0.4, c: '#c78bff', d: 1040 },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {spots.map((s, i) => (
        <DelayedBurst key={i} x={s.x} y={s.y} color={s.c} delay={s.d} />
      ))}
    </View>
  );
}

function DelayedBurst({
  x,
  y,
  color,
  delay,
}: {
  x: number;
  y: number;
  color: string;
  delay: number;
}) {
  const [show, setShow] = React.useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!show) {
    return null;
  }
  return (
    <View style={{ position: 'absolute', left: x, top: y }}>
      <Burst color={color} count={14} radius={95} size={7} duration={900} />
    </View>
  );
}

export const Fireworks = memo(FireworksInner);

/** Distance fog fading the track into the horizon. */
function FogOverlayInner({ color, height }: { color: string; height: number }) {
  const bands = [0.5, 0.34, 0.22, 0.12];
  return (
    <View
      style={[styles.fog, { height: height * 0.42 }]}
      pointerEvents="none">
      <View style={{ flex: 1.4, backgroundColor: color }} />
      {bands.map((o, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color, opacity: o }} />
      ))}
    </View>
  );
}

export const FogOverlay = memo(FogOverlayInner);

const styles = StyleSheet.create({
  burstWrap: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fog: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});
