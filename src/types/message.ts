export interface ChatMessage {
  id: string;
  agentId: string;
  text: string;
  timestamp: number;
  isAgent: boolean;
  isStreaming?: boolean;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  uuid?: string;
}

export interface AgentActivity {
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
}

export interface AgentOutput {
  agentId: string;
  text: string;
  isStreaming: boolean;
  timestamp: number;
  isDelegation?: boolean;
  skillUpdate?: any;
  subagentName?: string;
  uuid?: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
}
