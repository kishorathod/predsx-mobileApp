import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Animated, Pressable } from 'react-native';
import { fetchMarkets, Market } from '../services/api';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
    { name: 'All', icon: 'apps' },
    { name: 'Crypto', icon: 'logo-bitcoin' },
    { name: 'Politics', icon: 'business' },
    { name: 'Tech', icon: 'phone-portrait' },
    { name: 'Sports', icon: 'football' }
];

export default function MarketsScreen({ navigation }: any) {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Animated value for the sliding toggle background
    const toggleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadMarkets();
    }, [filterActive]);

    useEffect(() => {
        Animated.spring(toggleAnim, {
            toValue: filterActive ? 0 : 1,
            useNativeDriver: false,
            bounciness: 8
        }).start();
    }, [filterActive]);

    const loadMarkets = async () => {
        const data = await fetchMarkets(filterActive ? 'ACTIVE' : 'CLOSED');
        setMarkets(data);
    };

    useEffect(() => {
        const result = markets.filter(m => {
            const matchesSearch = m.Question.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'All' || m.Category === selectedCategory;
            return matchesSearch && matchesCat;
        });
        setFilteredMarkets(result);
    }, [markets, searchQuery, selectedCategory]);

    const translateX = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 160] // Adjusted for toggle size
    });

    const renderItem = ({ item }: { item: Market }) => {
        const prob = Math.floor(20 + (parseInt(item.ID) * 7) % 65); 
        const isBullish = prob > 50;
        
        return (
            <Pressable
                onPress={() => navigation.navigate('MarketDetail', { marketId: item.ID, marketName: item.Question })}
                style={({ pressed }) => [
                    styles.cardContainer,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]}
            >
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIndicatorRow}>
                            <View style={styles.heatBadge}>
                                <Ionicons name="flame" size={10} color={colors.ask} style={{marginRight: 4}} />
                                <Text style={styles.heatText}>Trending</Text>
                            </View>
                            <View style={styles.timeLeftContainer}>
                                <Ionicons name="time-outline" size={12} color={colors.textSecondary} style={{marginRight: 4}} />
                                <Text style={styles.timeLeft}>{Math.floor(Math.random() * 20)+1}d left</Text>
                            </View>
                        </View>
                        <Text style={styles.questionText}>{item.Question}</Text>
                        <View style={styles.aiInsightSummaryContainer}>
                            <Ionicons name="bulb-outline" size={12} color={colors.textSecondary} style={{marginRight: 6, marginTop: 2}} />
                            <Text style={styles.aiInsightSummary}>
                                {isBullish ? 'Market leaning bullish due to high volume' : 'Low conviction, consolidating at current levels'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.probContainer}>
                        <View style={styles.probLabelRow}>
                            <Text style={styles.probLabel}>YES Probability</Text>
                            <Text style={[styles.probValue, { color: isBullish ? colors.bid : colors.ask }]}>{prob}% YES</Text>
                        </View>
                        <View style={styles.probTrack}>
                            <LinearGradient
                                colors={[isBullish ? colors.bid : colors.ask, 'rgba(255,255,255,0.4)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.probBar, { width: `${prob}%` }]}
                            />
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.metaRow}>
                            <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={{marginRight: 6}} />
                            <Text style={styles.participation}>{Math.floor(Math.random()*3000)+500} traders</Text>
                        </View>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.miniButton, { borderColor: colors.bid }]}>
                                <Text style={[styles.miniButtonText, { color: colors.bid }]}>YES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.miniButton, { borderColor: colors.ask, marginLeft: 8 }]}>
                                <Text style={[styles.miniButtonText, { color: colors.ask }]}>NO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live Markets</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.avatarText}>JD</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search markets..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.categoryScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity 
                            key={cat.name} 
                            style={[styles.categoryPill, selectedCategory === cat.name && styles.categoryPillActive]}
                            onPress={() => setSelectedCategory(cat.name)}
                        >
                            <Ionicons 
                                name={cat.icon as any} 
                                size={14} 
                                color={selectedCategory === cat.name ? '#fff' : colors.textSecondary} 
                                style={{marginRight: 6}}
                            />
                            <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextActive]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.animatedToggleBg}>
                <Animated.View style={[styles.activeSlider, { transform: [{ translateX }] }]} />
                <TouchableOpacity style={styles.toggleTextBtn} onPress={() => setFilterActive(true)}>
                    <View style={styles.toggleContentRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.bid }]} />
                        <Text style={[styles.toggleText, filterActive && styles.toggleTextActive]}>Active</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toggleTextBtn} onPress={() => setFilterActive(false)}>
                    <View style={styles.toggleContentRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.textSecondary }]} />
                        <Text style={[styles.toggleText, !filterActive && styles.toggleTextActive]}>Closed</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {filteredMarkets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="search" size={64} color={colors.cardSolid} />
                    <Text style={styles.emptyTitle}>No Markets Found</Text>
                    <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
                </View>
            ) : (
                <FlatList 
                    data={filteredMarkets}
                    keyExtractor={(item) => item.ID}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
    headerTitle: { color: colors.text, fontSize: colors.fontSize.xxl, fontWeight: 'bold' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { marginRight: 15, position: 'relative' },
    notifDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ask, borderWidth: 1.5, borderColor: colors.background },
    profileAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    avatarText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    searchContainer: { marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: 14, zIndex: 1 },
    searchInput: { flex: 1, backgroundColor: colors.card, color: colors.text, paddingHorizontal: 44, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, fontSize: colors.fontSize.m },
    
    categoryScroll: { marginBottom: 20 },
    categoryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.cardSolid, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    categoryPillActive: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6 },
    categoryText: { color: colors.textSecondary, fontWeight: '700', fontSize: colors.fontSize.s },
    categoryTextActive: { color: '#fff' },

    animatedToggleBg: { flexDirection: 'row', marginBottom: 20, backgroundColor: colors.cardSolid, borderRadius: 16, height: 56, borderWidth: 1, borderColor: colors.border, position: 'relative', alignItems: 'center' },
    activeSlider: { position: 'absolute', height: 48, width: 156, backgroundColor: colors.card, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    toggleTextBtn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    toggleContentRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    toggleText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 13 },
    toggleTextActive: { color: colors.text },

    cardContainer: { marginBottom: 16, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardSolid, elevation: 5, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12 },
    cardGradient: { padding: 20 },
    cardHeader: { marginBottom: 16 },
    cardIndicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    heatBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
    heatText: { color: colors.ask, fontSize: 10, fontWeight: 'bold' },
    timeLeftContainer: { flexDirection: 'row', alignItems: 'center' },
    timeLeft: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
    questionText: { color: colors.text, fontSize: 18, fontWeight: 'bold', lineHeight: 26, marginBottom: 8 },
    aiInsightSummaryContainer: { flexDirection: 'row', alignItems: 'flex-start' },
    aiInsightSummary: { flex: 1, color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' },
    
    probContainer: { marginBottom: 20 },
    probLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    probLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
    probValue: { fontWeight: 'bold', fontSize: 14 },
    probTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
    probBar: { height: '100%', borderRadius: 4 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    participation: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },

    actionRow: { flexDirection: 'row' },
    miniButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    miniButtonText: { fontSize: 13, fontWeight: 'bold' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
    emptyTitle: { color: colors.text, fontSize: colors.fontSize.xl, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
    emptySubtitle: { color: colors.textSecondary, fontSize: colors.fontSize.m, textAlign: 'center' }
});
