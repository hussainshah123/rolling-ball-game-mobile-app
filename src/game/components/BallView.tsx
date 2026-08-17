import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { BALL_SIZE } from '../types';
import { BallSkin } from '../../theme/theme';

interface Props {
  skin: BallSkin;
  rolling: boolean;
}

function BallViewInner({ skin, rolling }: Props) {
  const roll = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rolling) {
      return;
    }
    const anim = Animated.loop(
      Animated.timing(roll, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [roll, rolling]);

  const spin = roll.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* glow */}
      <View
        style={[
          styles.glow,
          { backgroundColor: skin.glow, shadowColor: skin.color },
        ]}
      />
      {/* body */}
      <View style={[styles.body, { backgroundColor: skin.color }]}>
        {/* rolling pattern */}
        <Animated.View style={[styles.pattern, { transform: [{ rotate: spin }] }]}>
          <View
            style={[styles.patternDot, { backgroundColor: 'rgba(0,0,0,0.14)' }]}
          />
          <View
            style={[
              styles.patternDot,
              {
                backgroundColor: 'rgba(0,0,0,0.10)',
                top: undefined,
                bottom: 4,
                left: 6,
              },
            ]}
          />
        </Animated.View>
        {/* fixed highlight */}
        <View style={[styles.highlight, { backgroundColor: skin.highlight }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: BALL_SIZE * 1.55,
    height: BALL_SIZE * 1.55,
    borderRadius: (BALL_SIZE * 1.55) / 2,
    opacity: 0.5,
  },
  body: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    overflow: 'hidden',
  },
  pattern: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    top: 5,
    left: BALL_SIZE / 2 - 7,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  highlight: {
    position: 'absolute',
    left: 8,
    top: 6,
    width: 15,
    height: 10,
    borderRadius: 6,
    opacity: 0.85,
    transform: [{ rotate: '-25deg' }],
  },
});

export const BallView = memo(BallViewInner);
