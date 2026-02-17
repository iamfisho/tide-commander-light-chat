import { Agent, AgentOutput, AgentActivity, ContextStats } from '@/types';

export type WebSocketEventHandler = {
  onAgentsUpdate?: (agents: Agent[]) => void;
  onAgentCreated?: (agent: Agent) => void;
  onAgentUpdated?: (agent: Agent) => void;
  onAgentDeleted?: (data: { id: string }) => void;
  onOutput?: (output: AgentOutput) => void;
  onActivity?: (activity: AgentActivity) => void;
  onCommandStarted?: (data: { agentId: string; command: string }) => void;
  onSessionUpdated?: (data: { agentId: string }) => void;
  onContextStats?: (data: { agentId: string; stats: ContextStats }) => void;
  onAgentNotification?: (data: {
    agentId: string;
    agentName: string;
    title: string;
    message: string;
    timestamp: number;
  }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
};

type ServerMessage = {
  type: string;
  payload: any;
};

type ClientMessage = {
  type: string;
  payload: any;
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: WebSocketEventHandler = {};
  private serverUrl: string = '';
  private authToken?: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {}

  connect(serverUrl: string, authToken?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.serverUrl = serverUrl;
    this.authToken = authToken;

    try {
      // Convert http(s) to ws(s) and add /ws path
      const wsUrl = serverUrl.replace(/^http/, 'ws') + '/ws';

      // Add auth token as query parameter if provided
      const url = authToken ? `${wsUrl}?token=${authToken}` : wsUrl;

      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.handlers.onConnect?.();

        // Start ping interval to keep connection alive
        this.startPingInterval();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.stopPingInterval();
        this.handlers.onDisconnect?.();

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handlers.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onmessage = (event) => {
        try {
          if (!event.data) {
            console.warn('Received empty WebSocket message');
            return;
          }

          const message = JSON.parse(event.data) as ServerMessage;

          // Validate message structure
          if (!message || typeof message !== 'object' || !message.type) {
            console.warn('Received invalid WebSocket message structure:', message);
            return;
          }

          this.handleServerMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error, event.data);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handlers.onError?.(error as Error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.serverUrl, this.authToken);
    }, delay);
  }

  private startPingInterval() {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', payload: {} }));
      }
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleServerMessage(message: ServerMessage) {
    try {
      const { type, payload } = message;

      // Validate payload exists for message types that require it
      if (!payload && type !== 'ping' && type !== 'pong') {
        console.warn(`Received ${type} message without payload`);
        return;
      }

      switch (type) {
        case 'agents_update':
          if (Array.isArray(payload)) {
            this.handlers.onAgentsUpdate?.(payload);
          } else {
            console.warn('agents_update payload is not an array:', payload);
          }
          break;
        case 'agent_created':
          if (payload && typeof payload === 'object') {
            this.handlers.onAgentCreated?.(payload);
          }
          break;
        case 'agent_updated':
          if (payload && typeof payload === 'object') {
            this.handlers.onAgentUpdated?.(payload);
          }
          break;
        case 'agent_deleted':
          if (payload && payload.id) {
            this.handlers.onAgentDeleted?.(payload);
          }
          break;
        case 'output':
          if (payload && payload.agentId) {
            this.handlers.onOutput?.(payload);
          } else {
            console.warn('output message missing agentId:', payload);
          }
          break;
        case 'activity':
          this.handlers.onActivity?.(payload);
          break;
        case 'command_started':
          this.handlers.onCommandStarted?.(payload);
          break;
        case 'session_updated':
          this.handlers.onSessionUpdated?.(payload);
          break;
        case 'context_stats':
          this.handlers.onContextStats?.(payload);
          break;
        case 'agent_notification':
          this.handlers.onAgentNotification?.(payload);
          break;
        case 'pong':
          // Pong response to keep-alive ping
          break;
        default:
          // Ignore unknown message types
          console.debug('Unknown message type:', type);
          break;
      }
    } catch (error) {
      console.error('Error handling server message:', error, message);
    }
  }

  disconnect() {
    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopPingInterval();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  setHandlers(handlers: WebSocketEventHandler) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Send commands to server
  sendCommand(agentId: string, command: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const message: ClientMessage = {
      type: 'send_command',
      payload: { agentId, command },
    };

    this.ws?.send(JSON.stringify(message));
  }

  requestContextStats(agentId: string) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const message: ClientMessage = {
      type: 'request_context_stats',
      payload: { agentId },
    };

    this.ws?.send(JSON.stringify(message));
  }
}
