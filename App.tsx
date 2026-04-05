import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import MarketsScreen from './src/screens/MarketsScreen';
import MarketDetailScreen from './src/screens/MarketDetailScreen';
import { colors } from './src/theme/colors';

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
          name="Markets" 
          component={MarketsScreen} 
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
