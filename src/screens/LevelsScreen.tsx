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
import { LEVELS_PER_WORLD, UI, WORLDS } from '../theme/theme';
import { useGame } from '../state/GameContext';
import { levelIndex } from '../game/levelGen';
import { SoundManager } from '../audio/SoundManager';
import { BackHeader } from '../components/BackHeader';
import { AdBanner } from '../ads/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

export default function LevelsScreen({ navigation }: Props) {
  const game = useGame();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <BackHeader title="LEVELS" onBack={() => navigation.goBack()} coins={game.coins} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {WORLDS.map(worldTheme => (
          <View key={worldTheme.id} style={[styles.world, { borderColor: UI.outline }]}>
            <View style={styles.worldHeader}>
              <View style={[styles.worldSwatch, { backgroundColor: worldTheme.track }]}>
                <Text style={styles.worldEmoji}>{worldTheme.emoji}</Text>
              </View>
              <Text style={styles.worldName}>{worldTheme.name}</Text>
            </View>
            <View style={styles.levelRow}>
              {Array.from({ length: LEVELS_PER_WORLD }).map((_, lv) => {
                const idx = levelIndex(worldTheme.id, lv);
                const unlocked = idx <= game.unlockedLevel;
                const stars = game.stars[idx] ?? 0;
                return (
                  <Pressable
                    key={lv}
                    disabled={!unlocked}
                    onPress={() => {
                      SoundManager.play('click', 0.7);
                      navigation.navigate('Game', {
                        world: worldTheme.id,
                        level: lv,
                      });
                    }}
                    style={[
                      styles.level,
                      {
                        backgroundColor: unlocked ? worldTheme.track : UI.card,
                        opacity: unlocked ? 1 : 0.45,
                      },
                    ]}>
                    <Text style={styles.levelNum}>
                      {unlocked ? lv + 1 : '🔒'}
                    </Text>
                    <View style={styles.starRow}>
                      {[0, 1, 2].map(s => (
                        <Text
                          key={s}
                          style={[
                            styles.levelStar,
                            { opacity: s < stars ? 1 : 0.22 },
                          ]}>
                          ★
                        </Text>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  world: {
    backgroundColor: UI.card,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  worldSwatch: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  worldEmoji: {
    fontSize: 20,
  },
  worldName: {
    color: UI.text,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  level: {
    width: 56,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
  },
  starRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  levelStar: {
    color: UI.gold,
    fontSize: 11,
    marginHorizontal: 0.5,
  },
  footerPad: {
    height: 40,
  },
});
