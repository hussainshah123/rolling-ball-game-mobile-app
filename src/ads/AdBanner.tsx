import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Real banner unit from AdMob console. Swapped for Google's test unit in
// dev builds so local testing never risks the account on invalid traffic.
const PROD_BANNER_UNIT_ID = 'ca-app-pub-9318693466829633/4390292793';
const BANNER_UNIT_ID = __DEV__ ? TestIds.BANNER : PROD_BANNER_UNIT_ID;

/**
 * Anchored banner for menu screens. Reserves its height up front so the
 * layout doesn't jump when the ad finishes loading, and simply renders
 * nothing if the ad fails to load (no error UI, never blocks the screen).
 */
export function AdBanner() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
