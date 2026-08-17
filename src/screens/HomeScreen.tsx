import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { BALLS, LEVELS_PER_WORLD, UI } from '../theme/theme';
import { useGame } from '../state/GameContext';
import { GameButton, CoinBadge } from '../components/ui';
import { BallView } from '../game/components/BallView';
import { SoundManager } from '../audio/SoundManager';
import { AdBanner } from '../ads/AdBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const game = useGame();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bounce = useRef(new Animated.Value(0)).current;
  const skin = BALLS.find(b => b.id === game.selectedBall) ?? BALLS[0];

  useEffect(() => {
    SoundManager.load();
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 620,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  const playLevel = () => {
    const idx = game.unlockedLevel;
    navigation.navigate('Game', {
      world: Math.floor(idx / LEVELS_PER_WORLD),
      level: idx % LEVELS_PER_WORLD,
    });
  };

  return (
    <View style={styles.root}>
      {/* decorative background circles */}
      <View style={[styles.bgBall, { left: -60, top: 90, width: 180, height: 180, borderRadius: 90 }]} />
      <View style={[styles.bgBall, { right: -50, top: 260, width: 140, height: 140, borderRadius: 70 }]} />
      <View style={[styles.bgBall, { left: width * 0.3, bottom: -70, width: 200, height: 200, borderRadius: 100 }]} />

      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
        <CoinBadge amount={game.coins} />
      </View>

      <View style={styles.hero}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: bounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -34],
                }),
              },
              {
                scaleY: bounce.interpolate({
                  inputRange: [0, 0.12, 1],
                  outputRange: [0.88, 1, 1.04],
                }),
              },
            ],
          }}>
          <View style={styles.heroBall}>
            <BallView skin={skin} rolling />
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.heroShadow,
            {
              opacity: bounce.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.15],
              }),
              transform: [
                {
                  scaleX: bounce.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.6],
                  }),
                },
              ],
            },
          ]}
        />
        <Text style={styles.title}>ROLLING BALL</Text>
        <Text style={styles.subtitle}>ADVENTURE</Text>
      </View>

      <View style={styles.menu}>
        <GameButton label="PLAY" icon="▶" color={UI.green} onPress={playLevel} />
        <GameButton
          label="BALLS"
          icon="⚪"
          color={UI.accent}
          onPress={() => navigation.navigate('Balls')}
          style={styles.menuGap}
        />
        <GameButton
          label="LEVELS"
          icon="🗺"
          color={UI.accent}
          onPress={() => navigation.navigate('Levels')}
          style={styles.menuGap}
        />
        <GameButton
          label="SETTINGS"
          icon="⚙"
          color={UI.cardLight}
          onPress={() => navigation.navigate('Settings')}
          style={styles.menuGap}
        />
      </View>

      <Text style={styles.best}>
        BEST SCORE {game.bestScore} · ⭐{' '}
        {game.stars.reduce((a, b) => a + b, 0)}
      </Text>
      <View style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <AdBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  bgBall: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  topBar: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  hero: {
    alignItems: 'center',
    marginTop: 26,
  },
  heroBall: {
    transform: [{ scale: 1.6 }],
  },
  heroShadow: {
    width: 90,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#000000',
    marginTop: 6,
  },
  title: {
    color: UI.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 22,
  },
  subtitle: {
    color: UI.gold,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 10,
    marginTop: 2,
  },
  menu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  menuGap: {
    marginTop: 14,
  },
  best: {
    color: UI.textDim,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1.5,
    paddingBottom: 12,
  },
});
