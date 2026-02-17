import { useState, useEffect } from 'react';
import { AppConfig, DEFAULT_CONFIG } from '@/types';
import { StorageService } from '@/services/storage';

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await StorageService.getConfig();
      setConfig(savedConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      await StorageService.saveConfig(updatedConfig);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
      throw error;
    }
  };

  const resetConfig = async () => {
    try {
      await StorageService.clearConfig();
      setConfig(DEFAULT_CONFIG);
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw error;
    }
  };

  return {
    config,
    loading,
    updateConfig,
    resetConfig,
  };
};
