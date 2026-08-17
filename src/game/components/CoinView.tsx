import React, { memo } from 'react';
import { Animated, View } from 'react-native';
import { Coin, TRACK_WIDTH, laneX } from '../types';
import { EDGE } from './TrackSurface';

interface Props {
  coin: Coin;
  yOf: (z: number) => number;
  opacity: Animated.Value;
}

const SIZE = 30;
const CENTER = EDGE + TRACK_WIDTH / 2;

function CoinViewInner({ coin, yOf, opacity }: Props) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: CENTER + laneX(coin.lane) - SIZE / 2,
        top: yOf(coin.z) - SIZE / 2,
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: '#ffce3d',
        borderWidth: 3,
        borderColor: '#d9a415',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
      pointerEvents="none">
      <View
        style={{
          width: SIZE * 0.45,
          height: SIZE * 0.45,
          borderRadius: SIZE * 0.225,
          backgroundColor: '#ffe58a',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 5,
          top: 4,
          width: 8,
          height: 5,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.8)',
          transform: [{ rotate: '-30deg' }],
        }}
      />
    </Animated.View>
  );
}

export const CoinView = memo(CoinViewInner);
