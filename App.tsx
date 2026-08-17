import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import { GameProvider } from './src/state/GameContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <RootNavigator />
      </GameProvider>
    </SafeAreaProvider>
  );
}

export default App;
