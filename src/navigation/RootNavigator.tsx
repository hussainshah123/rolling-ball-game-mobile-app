import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { UI } from '../theme/theme';
import HomeScreen from '../screens/HomeScreen';
import LevelsScreen from '../screens/LevelsScreen';
import BallsScreen from '../screens/BallsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GameScreen from '../game/GameScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: UI.bg,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Levels" component={LevelsScreen} />
        <Stack.Screen name="Balls" component={BallsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
