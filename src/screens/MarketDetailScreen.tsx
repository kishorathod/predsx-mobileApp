import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { wsService } from '../services/websocket';
import { LineChart } from 'react-native-gifted-charts';
import { fetchPriceHistory, fetchSignals, fetchMarketTrades, Signal } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const TIME_FILTERS = ['1H', '1D', '1W', '1M', 'ALL'];

export default function MarketDetailScreen({ route, navigation }: any) {
    const { marketId, marketName } = route.params;
    const [trades, setTrades] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([{value: 0.5}]); 
    const [signals, setSignals] = useState<Signal | null>(null);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('1D');

    const [bids, setBids] = useState<any[]>([
        { price: '0.45', size: '1000' }, { price: '0.44', size: '2500' }, { price: '0.42', size: '5000' }
    ]);
    const [asks, setAsks] = useState<any[]>([
        { price: '0.55', size: '1200' }, { price: '0.56', size: '2000' }, { price: '0.58', size: '4000' }
    ]);

    useEffect(() => {
        fetchPriceHistory(marketId).then(history => {
            if (history && history.length > 0) {
                setChartData(history);
            }
        });

        fetchSignals(marketId).then(data => {
            if (data) setSignals(data);
        });

        fetchMarketTrades(marketId).then(data => {
            if (data && data.length > 0) setTrades(data);
        });

        wsService.connect();
        
        const unsubscribe = wsService.subscribe('message', (data: any) => {
            if (data.market_id === marketId || (data.data && data.data.market_id === marketId)) {
                const payload = data.data || data;
                
                if (data.type === 'TRADE' || payload.maker_address) {
                    const newTrade = { ...payload, id: Math.random().toString() };
                    setTrades(prev => [newTrade, ...prev].slice(0, 8));
                    
                    if (payload.price) {
                        setChartData(prev => [...prev, { value: parseFloat(payload.price) }].slice(-20));
                    }
                }

                if (data.type === 'l2update' || payload.bids) {
                    if (payload.bids) setBids(payload.bids.slice(0, 5));
                    if (payload.asks) setAsks(payload.asks.slice(0, 5));
                }
            }
        });

        return () => unsubscribe();
    }, [marketId]);

    const bestBid = parseFloat(bids[0]?.price || '0.50');
    const bestAsk = parseFloat(asks[0]?.price || '0.51');
    const probability = Math.round(((bestBid + bestAsk) / 2) * 100);

    const renderOrderbookRow = (item: any, type: 'bid' | 'ask') => {
        const depthPercent = Math.min((parseInt(item.size || '1000') / 8000) * 100, 100);
        
        return (
            <View key={item.price + item.size} style={styles.orderRow}>
                <View style={[styles.depthBar, { 
                    width: `${depthPercent}%`, 
                    backgroundColor: type === 'bid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    [type === 'bid' ? 'right' : 'left']: 0 
                }]} />
                <Text style={[styles.orderPrice, { color: type === 'bid' ? colors.bid : colors.ask }]}>
                    ${item.price}
                </Text>
                <Text style={styles.orderSize}>{item.size}</Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Market Details</Text>
                <TouchableOpacity style={styles.backBtn}>
                    <Ionicons name="share-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <Text style={styles.mainQuestion}>{marketName}</Text>
            
            <View style={styles.chartSection}>
                <View style={styles.timeFilterRow}>
                    {TIME_FILTERS.map(f => (
                        <TouchableOpacity 
                            key={f} 
                            style={[styles.timeFilter, selectedTimeFilter === f && styles.timeFilterActive]}
                            onPress={() => setSelectedTimeFilter(f)}
                        >
                            <Text style={[styles.timeFilterText, selectedTimeFilter === f && styles.timeFilterTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.chartBox}>
                    <LineChart
                        areaChart
                        data={chartData}
                        width={screenWidth - 60}
                        hideDataPoints
                        spacing={screenWidth / (chartData.length + 1)}
                        color={colors.primary}
                        thickness={3}
                        startFillColor={colors.primary}
                        endFillColor="transparent"
                        startOpacity={0.4}
                        endOpacity={0}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        hideRules
                        initialSpacing={0}
                        curved
                    />
                </View>
            </View>

            <View style={styles.probabilitySection}>
                <View style={styles.probLabelRow}>
                    <Text style={styles.probLabelTitle}>Current Probability</Text>
                    <Text style={styles.probPercent}>{probability}% YES</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <LinearGradient
                        colors={[colors.bid, '#34D399']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${probability}%` }]}
                    />
                </View>
                <Text style={styles.probSubtext}>Users are highly confident in this outcome based on current volume.</Text>
            </View>

            <View style={styles.quickTradeRow}>
                <Pressable android_ripple={{color: 'rgba(255,255,255,0.1)'}} style={[styles.tradeButton, { backgroundColor: colors.bid }]}>
                    <Text style={styles.tradeButtonText}>Buy YES</Text>
                    <Text style={styles.tradeButtonSubtext}>${bestBid.toFixed(2)}</Text>
                </Pressable>
                <Pressable android_ripple={{color: 'rgba(255,255,255,0.1)'}} style={[styles.tradeButton, { backgroundColor: colors.ask }]}>
                    <Text style={styles.tradeButtonText}>Buy NO</Text>
                    <Text style={styles.tradeButtonSubtext}>${bestAsk.toFixed(2)}</Text>
                </Pressable>
            </View>

            <View style={styles.aiInsightsCard}>
                <View style={styles.aiHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="bulb-outline" size={20} color={colors.text} style={{marginRight: 8}} />
                        <Text style={styles.sectionTitle}>AI Insights</Text>
                    </View>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>
                <Text style={styles.aiDescription}>
                    Market leaning {probability > 50 ? 'bullish' : 'bearish'} due to {trades.length > 5 ? 'high' : 'low'} tactical volume. 
                    Key signals: {signals?.Macd || 'Stable MACD'}, trend is {signals?.Trend.toLowerCase() || 'neutral'}.
                </Text>
                <View style={styles.insightBadges}>
                    <View style={styles.insightBadge}>
                        <Ionicons name="pulse-outline" size={12} color={colors.textSecondary} style={{marginBottom: 4}} />
                        <Text style={styles.insightLabel}>RSI</Text>
                        <Text style={[styles.insightValue, { color: (signals?.Rsi || 0) > 70 ? colors.ask : colors.bid }]}>{signals?.Rsi ?? '--'}</Text>
                    </View>
                    <View style={styles.insightBadge}>
                        <Ionicons name="shield-checkmark-outline" size={12} color={colors.textSecondary} style={{marginBottom: 4}} />
                        <Text style={styles.insightLabel}>CONFIDENCE</Text>
                        <Text style={styles.insightValue}>{signals?.Confidence ?? '--'}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.orderbookSection}>
                <Text style={styles.sectionTitle}>Orderbook Depth</Text>
                <View style={styles.orderbookBox}>
                    <View style={styles.orderbookSide}>
                        <Text style={styles.sideHeader}>BIDS (YES)</Text>
                        {bids.map((b, idx) => renderOrderbookRow(b, 'bid'))}
                    </View>
                    <View style={styles.vDivider} />
                    <View style={styles.orderbookSide}>
                        <Text style={styles.sideHeader}>ASKS (NO)</Text>
                        {asks.map((a, idx) => renderOrderbookRow(a, 'ask'))}
                    </View>
                </View>
            </View>

            <View style={styles.tradesSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {trades.length === 0 ? (
                    <Text style={styles.emptyTrades}>Waiting for live trades...</Text>
                ) : (
                    trades.map((t, idx) => (
                        <View key={t.id || idx} style={styles.tradeRow}>
                            <View style={styles.tradeInfo}>
                                <View style={[styles.sideIndicator, { backgroundColor: t.side === 'BUY' ? colors.bid : colors.ask }]} />
                                <Text style={styles.tradeSize}>{t.size || t.amount || '0'} tokens</Text>
                            </View>
                            <Text style={styles.tradePrice}>${parseFloat(t.price).toFixed(3)}</Text>
                        </View>
                    ))
                )}
            </View>
            
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardSolid, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    headerTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

    mainQuestion: { color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 24, lineHeight: 30 },

    chartSection: { backgroundColor: colors.card, borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
    timeFilterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    timeFilter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    timeFilterActive: { backgroundColor: colors.cardSolid },
    timeFilterText: { color: colors.textSecondary, fontWeight: '800', fontSize: 11 },
    timeFilterTextActive: { color: colors.primary },
    chartBox: { alignItems: 'center' },

    probabilitySection: { marginBottom: 24 },
    probLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
    probLabelTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: 'bold' },
    probPercent: { color: colors.bid, fontSize: 24, fontWeight: 'bold' },
    progressBarBg: { height: 12, backgroundColor: colors.cardSolid, borderRadius: 6, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 6 },
    probSubtext: { color: colors.textSecondary, fontSize: 12, marginTop: 10, fontStyle: 'italic', lineHeight: 18 },

    quickTradeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    tradeButton: { flex: 0.48, paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    tradeButtonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    tradeButtonSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2, fontWeight: '600' },

    aiInsightsCard: { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' },
    aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bid, marginRight: 6 },
    liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    aiDescription: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 18 },
    insightBadges: { flexDirection: 'row' },
    insightBadge: { flex: 1, backgroundColor: colors.cardSolid, padding: 16, borderRadius: 16, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    insightLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    insightValue: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 4 },

    orderbookSection: { marginBottom: 40 },
    orderbookBox: { flexDirection: 'row', backgroundColor: colors.cardSolid, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border },
    orderbookSide: { flex: 1 },
    sideHeader: { color: colors.textSecondary, fontSize: 11, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
    vDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 20 },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, position: 'relative' },
    depthBar: { position: 'absolute', top: 0, bottom: 0 },
    orderPrice: { fontWeight: '900', fontSize: 13, zIndex: 1, marginLeft: 4 },
    orderSize: { color: colors.text, fontSize: 13, fontWeight: '500', zIndex: 1, marginRight: 4 },

    tradesSection: { marginBottom: 40 },
    tradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    tradeInfo: { flexDirection: 'row', alignItems: 'center' },
    sideIndicator: { width: 4, height: 16, borderRadius: 2, marginRight: 12 },
    tradeSize: { color: colors.text, fontSize: 14, fontWeight: '600' },
    tradePrice: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    emptyTrades: { color: colors.textSecondary, fontSize: 14, marginTop: 10, fontStyle: 'italic' }
});
