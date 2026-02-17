import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig, DEFAULT_CONFIG } from '@/types';

const CONFIG_KEY = '@tide_mobile_config';

export const StorageService = {
  async getConfig(): Promise<AppConfig> {
    try {
      const value = await AsyncStorage.getItem(CONFIG_KEY);
      if (value !== null) {
        return JSON.parse(value);
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error loading config:', error);
      return DEFAULT_CONFIG;
    }
  },

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  },

  async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONFIG_KEY);
    } catch (error) {
      console.error('Error clearing config:', error);
      throw error;
    }
  },
};
