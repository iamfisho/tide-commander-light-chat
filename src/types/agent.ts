export type AgentStatus = 'idle' | 'working' | 'waiting' | 'waiting_permission' | 'error' | 'offline' | 'orphaned';

export type AgentClass = 'scout' | 'builder' | 'debugger' | 'architect' | 'warrior' | 'support' | 'boss' | string;

export type AgentProvider = 'claude' | 'codex';

export type ClaudeModel = 'sonnet' | 'opus' | 'haiku';

export type PermissionMode = 'bypass' | 'interactive';

export interface Agent {
  id: string;
  name: string;
  class: AgentClass;
  cwd: string;
  status: AgentStatus;
  currentTask?: string;
  currentTool?: string;
  position?: { x: number; y: number; z: number };
  sessionId?: string;
  isBoss?: boolean;
  subordinateIds?: string[];
  skillIds?: string[];
  createdAt: number;
  updatedAt: number;
  provider?: AgentProvider;
  useChrome?: boolean;
  permissionMode?: PermissionMode;
  model?: ClaudeModel;
  customInstructions?: string;
}

export interface ContextStats {
  model: string;
  contextWindow: number;
  totalTokens: number;
  usedPercent: number;
  categories: {
    systemPrompt: { tokens: number; percent: number };
    systemTools: { tokens: number; percent: number };
    messages: { tokens: number; percent: number };
    freeSpace: { tokens: number; percent: number };
    autocompactBuffer: { tokens: number; percent: number };
  };
  lastUpdated: number;
}
