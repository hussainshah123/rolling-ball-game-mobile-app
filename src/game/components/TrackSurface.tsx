import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LevelData, TRACK_WIDTH } from '../types';
import { WorldTheme } from '../../theme/theme';

interface Props {
  level: LevelData;
  theme: WorldTheme;
  planeH: number;
  /** world z -> plane-local top coordinate */
  yOf: (z: number) => number;
}

const EDGE = 10;
export const PLANE_WIDTH = TRACK_WIDTH + EDGE * 2;

function TrackSurfaceInner({ level, theme, planeH, yOf }: Props) {
  const stripes: React.ReactElement[] = [];
  for (let z = -600; z < level.length + 2000; z += 480) {
    stripes.push(
      <View
        key={`s${z}`}
        style={[
          styles.stripe,
          { top: yOf(z + 240), backgroundColor: theme.trackAlt },
        ]}
      />,
    );
  }

  const checkers: React.ReactElement[] = [];
  const cell = TRACK_WIDTH / 8;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0) {
        continue;
      }
      checkers.push(
        <View
          key={`f${r}-${c}`}
          style={{
            position: 'absolute',
            left: EDGE + c * cell,
            top: yOf(level.length) - cell * 2 + r * cell,
            width: cell,
            height: cell,
            backgroundColor: '#101018',
          }}
        />,
      );
    }
  }

  return (
    <View style={[styles.plane, { height: planeH }]} pointerEvents="none">
      {/* floor */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.track }]} />
      {stripes}
      {/* lane divider lines */}
      <View
        style={[styles.laneLine, { left: EDGE + TRACK_WIDTH / 3, backgroundColor: theme.laneLine }]}
      />
      <View
        style={[
          styles.laneLine,
          { left: EDGE + (TRACK_WIDTH / 3) * 2, backgroundColor: theme.laneLine },
        ]}
      />
      {/* edge rails */}
      <View style={[styles.rail, { left: 0, backgroundColor: theme.trackEdge }]} />
      <View style={[styles.rail, { right: 0, backgroundColor: theme.trackEdge }]} />
      {/* finish band — covers z ∈ [length, length + 2 cells] */}
      <View
        style={{
          position: 'absolute',
          left: EDGE,
          top: yOf(level.length) - (TRACK_WIDTH / 8) * 2,
          width: TRACK_WIDTH,
          height: (TRACK_WIDTH / 8) * 2,
          backgroundColor: '#f5f5f5',
        }}
      />
      {checkers}
      {/* start line */}
      <View
        style={{
          position: 'absolute',
          left: EDGE,
          top: yOf(0),
          width: TRACK_WIDTH,
          height: 8,
          backgroundColor: theme.trackEdge,
          opacity: 0.85,
        }}
      />
      {/* side decorations */}
      {level.decorations.map(d => {
        const left = d.side === -1 ? -14 - d.size : PLANE_WIDTH + 14;
        if (d.kind === 0) {
          return (
            <View
              key={d.id}
              style={{
                position: 'absolute',
                left,
                top: yOf(d.z),
                width: d.size,
                height: d.size,
                borderRadius: d.size / 2,
                backgroundColor: theme.decoration,
              }}
            />
          );
        }
        if (d.kind === 1) {
          return (
            <View
              key={d.id}
              style={{
                position: 'absolute',
                left,
                top: yOf(d.z),
                width: d.size,
                height: d.size,
                backgroundColor: theme.decoration,
                transform: [{ rotate: '45deg' }],
              }}
            />
          );
        }
        return (
          <View
            key={d.id}
            style={{
              position: 'absolute',
              left,
              top: yOf(d.z),
              width: d.size * 0.6,
              height: d.size * 1.6,
              borderRadius: 4,
              backgroundColor: theme.decoration,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  plane: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PLANE_WIDTH,
  },
  stripe: {
    position: 'absolute',
    left: EDGE,
    width: TRACK_WIDTH,
    height: 240,
  },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.7,
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: EDGE,
  },
});

export const TrackSurface = memo(TrackSurfaceInner);
export { EDGE };
