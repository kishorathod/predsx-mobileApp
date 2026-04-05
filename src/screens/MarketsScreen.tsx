import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchMarkets, Market } from '../services/api';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarketsScreen() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        loadMarkets();
    }, []);

    const loadMarkets = async () => {
        setLoading(true);
        const data = await fetchMarkets();
        setMarkets(data);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: Market }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MarketDetail', { marketId: item.ID, marketName: item.Question })}
        >
            <Text style={styles.questionText}>{item.Question}</Text>
            <View style={styles.footer}>
                <Text style={styles.statusText}>{item.Active ? '🟢 Active' : '🔴 Closed'}</Text>
                <Text style={styles.idText}>ID: {item.ID.slice(0,8)}...</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Live Markets</Text>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={markets}
                    keyExtractor={(item) => item.ID}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    questionText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    idText: {
        color: colors.textSecondary,
        fontSize: 12,
    }
});
