import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { storage } from '../services/storage';
import { API_BASE } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const [apiKey, setApiKey] = useState('');
    const [wallet, setWallet] = useState('');
    const [checking, setChecking] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedKey = await storage.getApiKey();
        const savedWallet = await storage.getWallet();
        if (savedKey) setApiKey(savedKey);
        if (savedWallet) setWallet(savedWallet);
        if (savedKey) checkConnection(savedKey);
    };

    const checkConnection = async (key: string) => {
        setChecking(true);
        try {
            // Real health check with auth header simulation
            const res = await fetch(`${API_BASE}/health`, {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            setIsConnected(res.ok);
        } catch {
            setIsConnected(false);
        }
        setChecking(false);
    };

    const handleSave = async () => {
        if (!wallet.startsWith('0x') || wallet.length < 40) {
            Alert.alert('Invalid Wallet', 'Please enter a valid Polymarket/Ethereum address.');
            return;
        }
        await storage.saveApiKey(apiKey);
        await storage.saveWallet(wallet);
        await checkConnection(apiKey);
        Alert.alert('Success', 'Configuration saved. Portfolio will now sync.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Account Settings</Text>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Identity & Auth</Text>
                </View>
                
                <Text style={styles.label}>POLYNOMIAL WALLET ADDRESS</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="0x..."
                    placeholderTextColor={colors.textSecondary}
                    value={wallet}
                    onChangeText={setWallet}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>PREDSX API KEY</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="v1_sk_..."
                    placeholderTextColor={colors.textSecondary}
                    value={apiKey}
                    onChangeText={setApiKey}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save Configuration</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.statusSection}>
                <Text style={styles.label}>ENGINE STATUS</Text>
                <View style={styles.statusRow}>
                    {checking ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.bid : colors.ask }]} />
                    )}
                    <Text style={styles.statusText}>
                        {isConnected ? 'Connected to Production /v1' : 'Disconnected (Offline Mode Enabled)'}
                    </Text>
                </View>
                <Text style={styles.hint}>
                    When offline, the app uses high-fidelity local simulation for development.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    headerTitle: { color: colors.text, fontSize: 32, fontWeight: 'bold', marginVertical: 24 },
    
    section: { backgroundColor: colors.card, padding: 24, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    
    label: { color: colors.textSecondary, fontSize: 11, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
    input: { backgroundColor: colors.cardSolid, color: colors.text, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20, fontSize: 14 },
    
    button: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: colors.primary, shadowRadius: 10, shadowOpacity: 0.3, elevation: 5 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    statusSection: { paddingHorizontal: 8 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 12 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    statusText: { color: colors.text, fontSize: 15, fontWeight: '600' },
    hint: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 }
});
