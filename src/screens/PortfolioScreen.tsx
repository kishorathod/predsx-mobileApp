import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPositions, fetchClosedPositions, Position } from '../services/api';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function PortfolioScreen() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        if (activeTab === 'Active') {
            const data = await fetchPositions();
            setPositions(data);
        } else {
            const data = await fetchClosedPositions();
            setPositions(data);
        }
        setLoading(false);
    };

    const renderPerformanceCard = () => (
        <View style={styles.perfRow}>
            <View style={styles.perfCard}>
                <Text style={styles.perfLabel}>WIN RATE</Text>
                <Text style={[styles.perfValue, { color: colors.bid }]}>68.4%</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Master</Text>
                </View>
            </View>
            <View style={styles.perfCard}>
                <Text style={styles.perfLabel}>AVG PROFIT</Text>
                <Text style={styles.perfValue}>$42.10</Text>
                <Text style={styles.perfSubtext}>Per Trade</Text>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Position }) => {
        const pnlValue = activeTab === 'Active' ? parseFloat(item.UnrealizedPnl || '0') : parseFloat(item.RealizedPnl || '0');
        const isProfit = pnlValue >= 0;
        
        return (
            <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.marketId}>Market #{item.MarketID}</Text>
                    <View style={[styles.sideBox, { backgroundColor: item.Side === 'YES' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                        <Text style={[styles.sideText, { color: item.Side === 'YES' ? colors.bid : colors.ask }]}>{item.Side}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                        <Text style={styles.statLabel}>SIZE</Text>
                        <Text style={styles.statVal}>{item.Size}</Text>
                    </View>
                    <View style={styles.statCol}>
                        <Text style={styles.statLabel}>AVG ENTRY</Text>
                        <Text style={styles.statVal}>${item.AverageEntryPrice}</Text>
                    </View>
                    <View style={styles.statCol}>
                        <Text style={styles.statLabel}>{activeTab === 'Active' ? 'CURRENT' : 'SETTLED'}</Text>
                        <Text style={styles.statVal}>${item.CurrentValue}</Text>
                    </View>
                </View>

                <View style={[styles.pnlRow, { borderTopColor: isProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                    <Text style={styles.statLabel}>{activeTab === 'Active' ? 'UNREALIZED PNL' : 'REALIZED PNL'}</Text>
                    <Text style={[styles.pnlText, { color: isProfit ? colors.bid : colors.ask }]}>
                        {isProfit ? '+' : ''}${pnlValue.toFixed(2)}
                    </Text>
                </View>
            </LinearGradient>
        );
    };

    const netValue = activeTab === 'Active' ? '$1,245.50' : '$3,400.00';

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Portfolio Dashboard</Text>
            
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'Active' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('Active')}
                >
                    <Text style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabBtn, activeTab === 'History' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('History')}
                >
                    <Text style={[styles.tabText, activeTab === 'History' && styles.tabTextActive]}>History</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={positions}
                keyExtractor={(item) => item.MarketID + item.Side}
                ListHeaderComponent={() => (
                    <>
                        <LinearGradient
                            colors={['#1E293B', '#0F172A']}
                            style={styles.summaryBox}
                        >
                            <Text style={styles.summaryLabel}>{activeTab === 'Active' ? 'Total Net Value' : 'Lifetime Profit'}</Text>
                            <Text style={[styles.summaryValue, activeTab === 'History' && { color: colors.bid }]}>{netValue}</Text>
                        </LinearGradient>

                        {renderPerformanceCard()}
                        
                        <Text style={styles.sectionTitle}>{activeTab === 'Active' ? 'Current Holdings' : 'Past Successes'}</Text>
                    </>
                )}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={loading ? null : (
                    <View style={styles.emptyView}>
                        <Text style={styles.emptyText}>No positions found here yet.</Text>
                    </View>
                )}
            />
            
            {loading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    headerTitle: { color: colors.text, fontSize: colors.fontSize.xxl, fontWeight: 'bold', marginVertical: 15 },
    
    tabContainer: { flexDirection: 'row', backgroundColor: colors.cardSolid, borderRadius: 12, padding: 6, marginBottom: 20 },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    tabBtnActive: { backgroundColor: colors.card },
    tabText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 14 },
    tabTextActive: { color: colors.text },

    summaryBox: { padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: colors.border },
    summaryLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
    summaryValue: { color: colors.text, fontSize: 36, fontWeight: 'bold' },

    perfRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    perfCard: { flex: 0.48, backgroundColor: colors.card, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    perfLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
    perfValue: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    perfSubtext: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
    badge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    card: { padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    marketId: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    sideBox: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
    sideText: { fontSize: 12, fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statCol: { alignItems: 'flex-start' },
    statLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: 'bold', marginBottom: 6 },
    statVal: { color: colors.text, fontSize: 16, fontWeight: 'bold' },

    pnlRow: { borderTopWidth: 1, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pnlText: { fontSize: 18, fontWeight: 'bold' },

    emptyView: { padding: 40, alignItems: 'center' },
    emptyText: { color: colors.textSecondary, fontSize: 14 },
    loader: { position: 'absolute', top: '50%', alignSelf: 'center' }
});
