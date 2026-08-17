import { Platform } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

export type SoundName = 'coin' | 'jump' | 'crash' | 'win' | 'click' | 'whoosh';

const NAMES: SoundName[] = ['coin', 'jump', 'crash', 'win', 'click', 'whoosh'];

/**
 * react-native-sound v0.13 loads from the native bundle, not Metro assets:
 * - Android: `<name>.wav` resolves to android/app/src/main/res/raw/<name>.wav
 * - iOS: full file:// URL into the app bundle's sounds/ folder
 *   (ios/rollingball/sounds is a folder reference copied into the bundle)
 */
function fileFor(name: SoundName): string {
  if (Platform.OS === 'ios') {
    return `file://${Sound.MAIN_BUNDLE}/sounds/${name}.wav`;
  }
  return `${name}.wav`;
}

class SoundManagerImpl {
  private sounds: Partial<Record<SoundName, Sound>> = {};
  private loaded = false;
  enabled = true;

  load() {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    NAMES.forEach(name => {
      try {
        // callback MUST be the 3rd arg: v0.13 stringifies a function passed
        // as basePath into the file path ("function(){}/coin.wav")
        const s: Sound = new Sound(fileFor(name), undefined, (error: string) => {
          if (error) {
            // missing/failed audio must never break gameplay
            delete this.sounds[name];
          }
        });
        this.sounds[name] = s;
      } catch {
        delete this.sounds[name];
      }
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  play(name: SoundName, volume = 1) {
    if (!this.enabled) {
      return;
    }
    const s = this.sounds[name];
    if (!s || !s.isLoaded()) {
      return;
    }
    s.stop(() => {
      s.setVolume(volume);
      s.play();
    });
  }

  release() {
    NAMES.forEach(name => {
      this.sounds[name]?.release();
    });
    this.sounds = {};
    this.loaded = false;
  }
}

export const SoundManager = new SoundManagerImpl();
