import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { UI } from '../theme/theme';
import { SoundManager } from '../audio/SoundManager';

interface ButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  small?: boolean;
  disabled?: boolean;
  icon?: string;
  silent?: boolean;
}

/** Chunky game button with press-down scale animation. */
export function GameButton({
  label,
  onPress,
  color = UI.accent,
  textColor = '#ffffff',
  style,
  textStyle,
  small,
  disabled,
  icon,
  silent,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (v: number) =>
    Animated.spring(scale, {
      toValue: v,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => animateTo(0.94)}
      onPressOut={() => animateTo(1)}
      onPress={() => {
        if (!silent) {
          SoundManager.play('click', 0.7);
        }
        onPress();
      }}>
      <Animated.View
        style={[
          styles.button,
          small && styles.buttonSmall,
          { backgroundColor: color, opacity: disabled ? 0.45 : 1 },
          { transform: [{ scale }] },
          style,
        ]}>
        <View style={styles.buttonShine} />
        <Text
          style={[
            styles.buttonText,
            small && styles.buttonTextSmall,
            { color: textColor },
            textStyle,
          ]}>
          {icon ? `${icon}  ${label}` : label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CoinBadge({ amount, size = 16 }: { amount: number; size?: number }) {
  return (
    <View style={styles.coinBadge}>
      <View
        style={[
          styles.coinDot,
          { width: size, height: size, borderRadius: size / 2 },
        ]}>
        <View
          style={{
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: size * 0.25,
            backgroundColor: '#ffe58a',
          }}
        />
      </View>
      <Text style={[styles.coinText, { fontSize: size * 0.95 }]}>{amount}</Text>
    </View>
  );
}

export function Stars({ count, size = 34 }: { count: number; size?: number }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2].map(i => (
        <Text
          key={i}
          style={{
            fontSize: size,
            marginHorizontal: 4,
            opacity: i < count ? 1 : 0.25,
          }}>
          ⭐
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 210,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.28)',
  },
  buttonSmall: {
    minWidth: 120,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  buttonShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  buttonText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  buttonTextSmall: {
    fontSize: 15,
    letterSpacing: 0.8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  coinDot: {
    backgroundColor: '#ffce3d',
    borderWidth: 2,
    borderColor: '#d9a415',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  coinText: {
    color: '#ffe9ad',
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
