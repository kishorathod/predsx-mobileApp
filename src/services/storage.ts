import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY = '@predsx_wallet_address';
const API_KEY = '@predsx_api_key';

export const storage = {
    async saveWallet(address: string) {
        await AsyncStorage.setItem(WALLET_KEY, address);
    },
    async getWallet(): Promise<string | null> {
        return await AsyncStorage.getItem(WALLET_KEY);
    },
    async saveApiKey(key: string) {
        await AsyncStorage.setItem(API_KEY, key);
    },
    async getApiKey(): Promise<string | null> {
        return await AsyncStorage.getItem(API_KEY);
    }
};
