import { Platform } from 'react-native';

export const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export interface Market {
    ID: string;
    Question: string;
    ConditionID: string;
    Active: boolean;
    YesTokenAddress: string;
    NoTokenAddress: string;
}

export const fetchMarkets = async (): Promise<Market[]> => {
    try {
        const res = await fetch(`${API_BASE}/v1/markets`);
        if (!res.ok) {
            // fallback to debug endpoint if needed
            const debugRes = await fetch(`${API_BASE}/debug/markets`);
            if (debugRes.ok) {
                return await debugRes.json();
            }
            throw new Error('Network response was not ok');
        }
        return await res.json();
    } catch (e) {
        console.error("fetchMarkets error:", e);
        return [];
    }
};

export const fetchOrderbook = async (marketId: string) => {
    try {
        const res = await fetch(`${API_BASE}/debug/orderbook/${marketId}`);
        if (!res.ok) throw new Error('Orderbook fetch failed');
        return await res.json();
    } catch (e) {
        console.error("fetchOrderbook error:", e);
        return null;
    }
};
