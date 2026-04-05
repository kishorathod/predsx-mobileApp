import { Platform } from 'react-native';
import { storage } from './storage';

export const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export interface Market {
    ID: string;
    Question: string;
    ConditionID: string;
    Active: boolean;
    YesTokenAddress: string;
    NoTokenAddress: string;
    Category?: string;
    Liquidity?: string;
    Volume24h?: string;
}

export interface Position {
    MarketID: string;
    Side: 'YES' | 'NO';
    Size: string;
    AverageEntryPrice: string;
    CurrentValue: string;
    UnrealizedPnl?: string;
    RealizedPnl?: string;
}

export interface Signal {
    Rsi: number;
    Macd: string;
    Trend: 'Bullish' | 'Bearish' | 'Neutral';
    Confidence: number;
}

const mockMarkets: Market[] = [
    { ID: '1', Question: 'Will Go 1.24 be released in 2024?', ConditionID: 'abc', Active: true, YesTokenAddress: '0x1', NoTokenAddress: '0x2', Category: 'Tech', Liquidity: '450k', Volume24h: '12k' },
    { ID: '2', Question: 'Bitcoin to hit $100k by December?', ConditionID: 'def', Active: true, YesTokenAddress: '0x3', NoTokenAddress: '0x4', Category: 'Crypto', Liquidity: '2.4M', Volume24h: '150k' },
];

const getHeaders = async () => {
    const key = await storage.getApiKey();
    return {
        'Content-Type': 'application/json',
        'Authorization': key ? `Bearer ${key}` : '',
    };
};

export const fetchMarkets = async (status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'): Promise<Market[]> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        // Switching from /debug to /v1/markets with server-side filtering
        const res = await fetch(`${API_BASE}/v1/markets?status=${status}&limit=50`, { 
            signal: controller.signal,
            headers: await getHeaders()
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) return mockMarkets.filter(m => m.Active === (status === 'ACTIVE'));
        return await res.json();
    } catch {
        return mockMarkets.filter(m => m.Active === (status === 'ACTIVE'));
    }
};

export const fetchOrderbook = async (marketId: string) => {
    try {
        const res = await fetch(`${API_BASE}/v1/markets/${marketId}/orderbook`, {
            headers: await getHeaders()
        });
        if (!res.ok) throw new Error('Orderbook fetch failed');
        return await res.json();
    } catch (e) {
        return null;
    }
};

export const fetchPositions = async (): Promise<Position[]> => {
    const wallet = await storage.getWallet();
    if (!wallet) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE}/v1/positions?wallet=${wallet}`, { 
            signal: controller.signal,
            headers: await getHeaders()
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("Fallback");
        return await res.json();
    } catch {
        return [
            { MarketID: '1', Side: 'YES', Size: '500', AverageEntryPrice: '0.45', CurrentValue: '0.52', UnrealizedPnl: '35.00' },
        ];
    }
}

export const fetchClosedPositions = async (): Promise<Position[]> => {
    const wallet = await storage.getWallet();
    if (!wallet) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE}/v1/positions/closed?wallet=${wallet}`, { 
            signal: controller.signal,
            headers: await getHeaders()
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("Fallback");
        return await res.json();
    } catch {
        return [
            { MarketID: '3', Side: 'YES', Size: '2000', AverageEntryPrice: '0.80', CurrentValue: '1.00', RealizedPnl: '400.00' },
        ];
    }
}

export const fetchPriceHistory = async (marketId: string): Promise<any[]> => {
    try {
        const res = await fetch(`${API_BASE}/v1/markets/${marketId}/price-history?resolution=1h`, {
            headers: await getHeaders()
        });
        if (!res.ok) throw new Error("Fallback");
        const data = await res.json();
        return data.map((d: any) => ({ value: parseFloat(d.avg_price) || 0.5 }));
    } catch {
        return [{value: 0.45}, {value: 0.50}, {value: 0.48}, {value: 0.52}, {value: 0.55}];
    }
}

export const fetchSignals = async (marketId: string): Promise<Signal> => {
    try {
        const res = await fetch(`${API_BASE}/v1/markets/${marketId}/signals`, {
            headers: await getHeaders()
        });
        if (!res.ok) throw new Error("Fallback");
        return await res.json();
    } catch {
        return { Rsi: 62.5, Macd: 'Bullish Crossover', Trend: 'Bullish', Confidence: 85 };
    }
}

export const fetchMarketTrades = async (marketId: string): Promise<any[]> => {
    try {
        const res = await fetch(`${API_BASE}/v1/markets/${marketId}/trades?limit=20`, {
            headers: await getHeaders()
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}
