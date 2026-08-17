import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UI } from '../theme/theme';
import { CoinBadge } from './ui';
import { SoundManager } from '../audio/SoundManager';

export function BackHeader({
  title,
  onBack,
  coins,
}: {
  title: string;
  onBack: () => void;
  coins?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <Pressable
        onPress={() => {
          SoundManager.play('click', 0.7);
          onBack();
        }}
        style={styles.backBtn}
        hitSlop={10}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {coins !== undefined ? (
        <CoinBadge amount={coins} />
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: UI.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: -4,
  },
  title: {
    color: UI.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  spacer: {
    width: 40,
  },
});
