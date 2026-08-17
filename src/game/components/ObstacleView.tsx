import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LANE_WIDTH, Obstacle, TRACK_WIDTH, laneX } from '../types';
import { WorldTheme } from '../../theme/theme';
import { EDGE } from './TrackSurface';

interface Props {
  obstacle: Obstacle;
  theme: WorldTheme;
  yOf: (z: number) => number;
  /** driven by the game loop for hammer / movingBlock sweeps (plane px) */
  sweep?: Animated.Value;
}

const CENTER = EDGE + TRACK_WIDTH / 2;

/** obstacles occupy world z ∈ [z, z+depth] → plane top edge is yOf(z + depth) */
function topOf(o: Obstacle, yOf: (z: number) => number): number {
  return yOf(o.z + o.depth);
}

function Spinner({ obstacle, theme, yOf }: Props) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: obstacle.period,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rot, obstacle.period]);

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: CENTER + laneX(obstacle.lane) - 55,
        top: topOf(obstacle, yOf) + obstacle.depth / 2 - 55,
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate }],
      }}>
      <View style={[styles.blade, { backgroundColor: theme.hazard }]} />
      <View
        style={[
          styles.blade,
          { backgroundColor: theme.hazard, transform: [{ rotate: '90deg' }] },
        ]}
      />
      <View style={[styles.hub, { backgroundColor: theme.hazardDark }]} />
    </Animated.View>
  );
}

function FallingPlatform({ obstacle, yOf }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  return (
    <View
      style={{
        position: 'absolute',
        left: CENTER + laneX(obstacle.lane) - LANE_WIDTH / 2 + 4,
        top: topOf(obstacle, yOf),
        width: LANE_WIDTH - 8,
        height: obstacle.depth,
      }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#f3c53a', opacity, borderRadius: 6 },
        ]}
      />
      <View style={styles.crackA} />
      <View style={styles.crackB} />
    </View>
  );
}

function ObstacleViewInner(props: Props) {
  const { obstacle, theme, yOf, sweep } = props;

  switch (obstacle.type) {
    case 'gap':
      return (
        <View
          style={{
            position: 'absolute',
            left: CENTER + laneX(obstacle.lane) - LANE_WIDTH / 2,
            top: topOf(obstacle, yOf),
            width: LANE_WIDTH,
            height: obstacle.depth,
            backgroundColor: theme.sky,
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderColor: 'rgba(0,0,0,0.35)',
          }}
        />
      );

    case 'spinner':
      return <Spinner {...props} />;

    case 'fallingPlatform':
      return <FallingPlatform {...props} />;

    case 'hammer':
      return (
        <View
          style={{
            position: 'absolute',
            left: EDGE,
            top: topOf(obstacle, yOf),
            width: TRACK_WIDTH,
            height: obstacle.depth,
          }}
          pointerEvents="none">
          <View style={[styles.hammerRail, { backgroundColor: theme.hazardDark }]} />
          <Animated.View
            style={[
              styles.hammerHead,
              {
                backgroundColor: theme.hazard,
                borderColor: theme.hazardDark,
                left: TRACK_WIDTH / 2 - 32,
                transform: sweep ? [{ translateX: sweep }] : [],
              },
            ]}>
            <View style={styles.hammerShine} />
          </Animated.View>
        </View>
      );

    case 'movingBlock':
      return (
        <View
          style={{
            position: 'absolute',
            left: EDGE,
            top: topOf(obstacle, yOf),
            width: TRACK_WIDTH,
            height: obstacle.depth,
          }}
          pointerEvents="none">
          <Animated.View
            style={[
              styles.block,
              {
                backgroundColor: theme.hazard,
                borderColor: theme.hazardDark,
                left: TRACK_WIDTH / 2 - 42,
                transform: sweep ? [{ translateX: sweep }] : [],
              },
            ]}>
            <View style={styles.blockEye} />
            <View style={[styles.blockEye, { left: undefined, right: 16 }]} />
          </Animated.View>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  blade: {
    position: 'absolute',
    width: 110,
    height: 16,
    borderRadius: 8,
  },
  hub: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  crackA: {
    position: 'absolute',
    left: '30%',
    top: '15%',
    width: 3,
    height: '70%',
    backgroundColor: 'rgba(80,50,0,0.45)',
    transform: [{ rotate: '18deg' }],
  },
  crackB: {
    position: 'absolute',
    left: '62%',
    top: '20%',
    width: 3,
    height: '60%',
    backgroundColor: 'rgba(80,50,0,0.45)',
    transform: [{ rotate: '-24deg' }],
  },
  hammerRail: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 8,
    marginTop: -4,
    borderRadius: 4,
    opacity: 0.55,
  },
  hammerHead: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    width: 64,
    height: 56,
    borderRadius: 12,
    borderWidth: 3,
  },
  hammerShine: {
    position: 'absolute',
    left: 8,
    top: 7,
    width: 18,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  block: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 84,
    height: 60,
    borderRadius: 10,
    borderWidth: 3,
  },
  blockEye: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export const ObstacleView = memo(ObstacleViewInner);
