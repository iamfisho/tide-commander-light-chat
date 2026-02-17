import axios, { AxiosInstance } from 'axios';
import { Agent, ChatMessage } from '@/types';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, authToken?: string) {
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000, // Reduced timeout to 10s
      headers: authToken
        ? { Authorization: `Bearer ${authToken}` }
        : {},
    });

    // Add error interceptor to handle network errors gracefully
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          console.warn('Network error - server may be offline');
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Agent operations
  async getAgents(): Promise<Agent[]> {
    const response = await this.client.get<Agent[]>('/agents');
    return response.data;
  }

  async getAgent(id: string): Promise<Agent> {
    const response = await this.client.get<Agent>(`/agents/${id}`);
    return response.data;
  }

  async getAgentHistory(
    agentId: string,
    limit?: number,
    offset?: number
  ): Promise<any[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const response = await this.client.get(`/agents/${agentId}/history`, {
      params,
    });

    console.log(`[ApiClient.getAgentHistory] Response for agent ${agentId}:`, {
      hasData: !!response.data,
      hasMessages: !!response.data?.messages,
      messagesLength: response.data?.messages?.length || 0,
      sessionId: response.data?.sessionId,
      totalCount: response.data?.totalCount,
      hasMore: response.data?.hasMore,
      fullResponse: response.data,
    });

    // Backend returns { messages: [], sessionId, totalCount, hasMore, ... }
    // Extract just the messages array
    return response.data?.messages || [];
  }

  async sendMessage(agentId: string, message: string): Promise<void> {
    await this.client.post(`/agents/${agentId}/message`, {
      message,
    });
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const response = await this.client.patch<Agent>(`/agents/${id}`, updates);
    return response.data;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.client.delete(`/agents/${id}`);
  }

  // Update baseURL and auth token
  updateConfig(baseURL: string, authToken?: string) {
    this.client.defaults.baseURL = `${baseURL}/api`;
    if (authToken) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }
}
