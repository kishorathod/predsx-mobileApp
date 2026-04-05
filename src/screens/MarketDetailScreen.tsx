import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { wsService } from '../services/websocket';

export default function MarketDetailScreen({ route }: any) {
    const { marketId, marketName } = route.params;
    const [prices, setPrices] = useState<any>({ bid: '0.00', ask: '0.00' });
    const [trades, setTrades] = useState<any[]>([]);

    useEffect(() => {
        wsService.connect();
        
        const unsubscribe = wsService.subscribe('message', (data: any) => {
            if (data.market_id === marketId || (data.data && data.data.market_id === marketId)) {
                const payload = data.data || data;
                if (payload.price !== undefined) {
                    if (data.type === 'TRADE' || payload.maker_address) {
                        setTrades(prev => [payload, ...prev].slice(0, 10)); // keep last 10 trades
                    }
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [marketId]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{marketName}</Text>
            
            <View style={styles.statsContainer}>
                <View style={[styles.statBox, { borderColor: colors.bid }]}>
                    <Text style={styles.statLabel}>Best Bid</Text>
                    <Text style={[styles.statValue, { color: colors.bid }]}>${prices.bid}</Text>
                </View>
                <View style={[styles.statBox, { borderColor: colors.ask }]}>
                    <Text style={styles.statLabel}>Best Ask</Text>
                    <Text style={[styles.statValue, { color: colors.ask }]}>${prices.ask}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Trades (Live)</Text>
            <ScrollView style={styles.tradesContainer}>
                {trades.length === 0 && <Text style={{color: colors.textSecondary}}>Waiting for live trades...</Text>}
                {trades.map((t, idx) => (
                    <View key={idx} style={styles.tradeRow}>
                        <Text style={styles.tradePrice}>${t.price}</Text>
                        <Text style={styles.tradeSize}>Size: {t.size}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.card,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    tradesContainer: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
    },
    tradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tradePrice: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    tradeSize: {
        color: colors.textSecondary,
        fontSize: 16,
    }
});
