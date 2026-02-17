import React, { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Agent, AppConfig, ChatMessage } from '@/types';
import { ApiClient } from '@/api/client';
import { WebSocketClient } from '@/api/websocket';
import { useConfig } from '@/hooks/useConfig';
import { useAgents } from '@/hooks/useAgents';

interface AppContextType {
  // Config
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => Promise<void>;

  // Agents
  agents: Agent[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  agentMessages: Record<string, ChatMessage[]>;
  loadAgents: () => Promise<void>;
  loadAgentHistory: (agentId: string) => Promise<void>;
  sendMessage: (agentId: string, message: string) => Promise<void>;

  // Connection testing
  testConnection: (serverUrl: string, authToken?: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, updateConfig: updateConfigHook } = useConfig();

  // Create API and WebSocket clients
  const apiClient = useMemo(
    () => new ApiClient(config.serverUrl, config.authToken),
    [config.serverUrl, config.authToken]
  );

  const wsClient = useMemo(() => new WebSocketClient(), []);

  // Use agents hook
  const agentsData = useAgents({ apiClient, wsClient });

  // Connect WebSocket when config changes
  useEffect(() => {
    if (config.serverUrl) {
      try {
        wsClient.connect(config.serverUrl, config.authToken);
      } catch (error) {
        console.warn('WebSocket connection failed:', error);
        // Don't crash if connection fails
      }
    }

    return () => {
      try {
        wsClient.disconnect();
      } catch (error) {
        console.warn('WebSocket disconnect failed:', error);
      }
    };
  }, [config.serverUrl, config.authToken, wsClient]);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    await updateConfigHook(newConfig);
    // Update API client with new config
    if (newConfig.serverUrl || newConfig.authToken !== undefined) {
      apiClient.updateConfig(
        newConfig.serverUrl || config.serverUrl,
        newConfig.authToken !== undefined ? newConfig.authToken : config.authToken
      );
    }
  };

  const testConnection = useCallback(
    async (serverUrl: string, authToken?: string): Promise<boolean> => {
      const testClient = new ApiClient(serverUrl, authToken);
      return await testClient.healthCheck();
    },
    []
  );

  const value: AppContextType = {
    config,
    updateConfig,
    ...agentsData,
    testConnection,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
