import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { UI } from '../theme/theme';
import { useGame } from '../state/GameContext';
import { BackHeader } from '../components/BackHeader';
import { SoundManager } from '../audio/SoundManager';
import { AdBanner } from '../ads/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const game = useGame();
  const insets = useSafeAreaInsets();

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'All coins, balls and level progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => game.resetProgress(),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <BackHeader title="SETTINGS" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>🔊 Sound Effects</Text>
          <Switch
            value={game.soundOn}
            onValueChange={v => {
              game.setSoundOn(v);
              if (v) {
                SoundManager.setEnabled(true);
                SoundManager.play('click', 0.7);
              }
            }}
            trackColor={{ false: UI.cardLight, true: UI.green }}
            thumbColor="#ffffff"
          />
        </View>

        <Pressable style={[styles.row, styles.danger]} onPress={confirmReset}>
          <Text style={[styles.rowLabel, { color: UI.red }]}>
            🗑 Reset Progress
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.about}>
          Rolling Ball Adventure · v1.0{'\n'}Swipe to steer · Tap to jump
        </Text>
      </View>
      <View style={styles.spacer} />
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
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  spacer: {
    flex: 1,
  },
  row: {
    backgroundColor: UI.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.outline,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  danger: {
    borderColor: 'rgba(255,85,96,0.3)',
  },
  rowLabel: {
    color: UI.text,
    fontSize: 16,
    fontWeight: '700',
  },
  chevron: {
    color: UI.textDim,
    fontSize: 24,
    fontWeight: '800',
  },
  about: {
    color: UI.textDim,
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 22,
    fontSize: 13,
  },
});
