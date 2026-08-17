import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BALLS, UI } from '../theme/theme';
import { useGame } from '../state/GameContext';
import { BallView } from '../game/components/BallView';
import { BackHeader } from '../components/BackHeader';
import { SoundManager } from '../audio/SoundManager';
import { AdBanner } from '../ads/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Balls'>;

export default function BallsScreen({ navigation }: Props) {
  const game = useGame();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <BackHeader
        title="BALLS"
        onBack={() => navigation.goBack()}
        coins={game.coins}
      />
      <ScrollView contentContainerStyle={styles.grid}>
        {BALLS.map(ball => {
          const owned = game.ownedBalls.includes(ball.id);
          const selected = game.selectedBall === ball.id;
          const affordable = game.coins >= ball.price;
          return (
            <Pressable
              key={ball.id}
              onPress={() => {
                if (owned) {
                  SoundManager.play('click', 0.7);
                  game.selectBall(ball.id);
                } else if (game.buyBall(ball.id)) {
                  SoundManager.play('coin', 0.9);
                } else {
                  SoundManager.play('crash', 0.25);
                }
              }}
              style={[
                styles.card,
                selected && { borderColor: UI.gold, borderWidth: 3 },
              ]}>
              <View style={styles.ballWrap}>
                <BallView skin={ball} rolling={selected} />
              </View>
              <Text style={styles.name}>{ball.name}</Text>
              {selected ? (
                <View style={[styles.tag, { backgroundColor: UI.gold }]}>
                  <Text style={[styles.tagText, { color: '#5c4300' }]}>
                    SELECTED
                  </Text>
                </View>
              ) : owned ? (
                <View style={[styles.tag, { backgroundColor: UI.cardLight }]}>
                  <Text style={styles.tagText}>OWNED</Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: affordable ? UI.green : UI.cardLight,
                      opacity: affordable ? 1 : 0.6,
                    },
                  ]}>
                  <Text style={styles.tagText}>🪙 {ball.price}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
        <View style={styles.footerPad} />
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    width: '48%',
    backgroundColor: UI.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.outline,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 14,
  },
  ballWrap: {
    marginBottom: 12,
    transform: [{ scale: 1.15 }],
  },
  name: {
    color: UI.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    color: UI.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerPad: {
    height: 40,
    width: '100%',
  },
});
