import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import MarketsScreen from '../screens/MarketsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 90,
                    paddingBottom: 25,
                    paddingTop: 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 4 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any = 'help-circle';
                    
                    if (route.name === 'MarketsTab') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    else if (route.name === 'PortfolioTab') iconName = focused ? 'wallet' : 'wallet-outline';
                    else if (route.name === 'SettingsTab') iconName = focused ? 'cog' : 'cog-outline';

                    return (
                        <View style={styles.iconContainer}>
                            {focused && (
                                <View style={styles.glowContainer}>
                                    <View style={styles.glow} />
                                </View>
                            )}
                            <Ionicons name={iconName} size={26} color={color} />
                            {focused && <View style={styles.activeLine} />}
                        </View>
                    );
                }
            })}
        >
            <Tab.Screen 
                name="MarketsTab" 
                component={MarketsScreen} 
                options={{ tabBarLabel: 'Markets' }}
            />
            <Tab.Screen 
                name="PortfolioTab" 
                component={PortfolioScreen} 
                options={{ tabBarLabel: 'Portfolio' }}
            />
            <Tab.Screen 
                name="SettingsTab" 
                component={SettingsScreen} 
                options={{ tabBarLabel: 'Settings' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    iconContainer: { alignItems: 'center', justifyContent: 'center' },
    glowContainer: { position: 'absolute', top: -2, bottom: -2, left: -10, right: -10, alignItems: 'center', justifyContent: 'center' },
    glow: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, opacity: 0.1, shadowColor: colors.primary, shadowRadius: 20, shadowOpacity: 1, elevation: 15 },
    activeLine: { 
        position: 'absolute', bottom: -12, width: 20, height: 3, borderRadius: 2, 
        backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 10, elevation: 8 
    }
});
