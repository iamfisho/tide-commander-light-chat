import { Agent, ContextStats } from './agent';
import { AgentOutput, AgentActivity } from './message';

// WebSocket Events (Server -> Client)
export type WebSocketServerEvent =
  | { type: 'agents_update'; data: Agent[] }
  | { type: 'agent_created'; data: Agent }
  | { type: 'agent_updated'; data: Agent }
  | { type: 'agent_deleted'; data: { id: string } }
  | { type: 'output'; data: AgentOutput }
  | { type: 'activity'; data: AgentActivity }
  | { type: 'command_started'; data: { agentId: string; command: string } }
  | { type: 'session_updated'; data: { agentId: string } }
  | { type: 'context_stats'; data: { agentId: string; stats: ContextStats } }
  | { type: 'agent_notification'; data: AgentNotification };

// WebSocket Commands (Client -> Server)
export interface SendCommandMessage {
  agentId: string;
  command: string;
}

export interface RequestContextStatsMessage {
  agentId: string;
}

export interface AgentNotification {
  agentId: string;
  agentName: string;
  title: string;
  message: string;
  timestamp: number;
}
