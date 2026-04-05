import { Platform } from 'react-native';

export const WS_BASE = Platform.OS === 'android' ? 'ws://10.0.2.2:8080/stream' : 'ws://localhost:8080/stream';

type SubscriberCallback = (data: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private subscribers: Map<string, SubscriberCallback[]> = new Map();
    private reconnectAttempts = 0;
    private mockInterval: any = null;

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log("Connecting to WS:", WS_BASE);
        this.ws = new WebSocket(WS_BASE);

        this.ws.onopen = () => {
            console.log("WebSocket Connected");
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifySubscribers('message', data);
            } catch (e) {
                console.error("WS Parse error", e);
            }
        };

        this.ws.onclose = () => {
            console.log("WebSocket Disconnected");
            this.ws = null;
            this.reconnect();
        };

        this.ws.onerror = (e) => {
            // Silencing generic connection refused errors while backend is off
        };
    }

    private reconnect() {
        const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 10000);
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), delay);
        
        // --- MOCK SIMULATION FOR SHOWCASE ---
        // If the backend is down, let's fire some fake trades so we can see the chart and animations!
        if (!this.ws) {
            if (!this.mockInterval) {
                this.mockInterval = setInterval(() => {
                    const fakePrice = (0.50 + (Math.random() * 0.1 - 0.05)).toFixed(3);
                    const fakeSize = Math.floor(Math.random() * 2000).toString();
                    
                    this.notifySubscribers('message', {
                        type: 'TRADE',
                        data: {
                            market_id: '1', // Hardcoded to match our first mock market
                            price: fakePrice,
                            size: fakeSize,
                            maker_address: '0xmock'
                        }
                    });
                }, 1500); // New trade every 1.5 seconds
            }
        }
    }

    subscribe(event: string, callback: SubscriberCallback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event)?.push(callback);
        
        return () => {
            const current = this.subscribers.get(event) || [];
            this.subscribers.set(event, current.filter(cb => cb !== callback));
        };
    }

    private notifySubscribers(event: string, data: any) {
        const subs = this.subscribers.get(event) || [];
        subs.forEach(cb => cb(data));
    }
}

export const wsService = new WebSocketService();
