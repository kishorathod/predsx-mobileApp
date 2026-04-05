import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

import TabNavigator from './src/navigation/TabNavigator';
import MarketDetailScreen from './src/screens/MarketDetailScreen';
import { colors } from './src/theme/colors';

// Crucial UI Polish: Silence noisy developer warnings 
// about WebSocket connection timeouts while testing without a locally running backend.
LogBox.ignoreLogs(['WebSocket Error', 'Possible Unhandled Promise Rejection']);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
             backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen 
          name="RootTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MarketDetail" 
          component={MarketDetailScreen}
          options={{ title: 'Market Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
