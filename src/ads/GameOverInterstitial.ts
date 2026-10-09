import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

// TODO: paste the real interstitial unit from the AdMob console. Until it is
// set, release builds simply never show an interstitial.
const PROD_INTERSTITIAL_UNIT_ID = '';
const UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_UNIT_ID;

/** Show an interstitial on every Nth game over. */
const LOSSES_PER_AD = 3;

let ad: InterstitialAd | null = null;
let loaded = false;
let losses = 0;

function load() {
  if (!UNIT_ID) {
    return;
  }
  if (!ad) {
    ad = InterstitialAd.createForAdRequest(UNIT_ID);
    ad.addAdEventListener(AdEventType.LOADED, () => {
      loaded = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      loaded = false;
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      loaded = false;
      ad?.load(); // preload the next one
    });
  }
  if (!loaded) {
    ad.load();
  }
}

export const GameOverInterstitial = {
  /** Call early (e.g. when a game screen mounts) so the ad is ready in time. */
  preload: load,

  /**
   * Count a loss; on every 3rd one show the ad if it's ready. If it isn't
   * loaded yet the turn is kept, so the next loss tries again.
   */
  onGameOver() {
    losses++;
    if (losses < LOSSES_PER_AD) {
      return;
    }
    if (ad && loaded) {
      losses = 0;
      loaded = false;
      ad.show().catch(() => {});
    } else {
      load();
    }
  },
};
