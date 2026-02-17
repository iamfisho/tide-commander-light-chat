import { AgentStatus, AgentClass } from '@/types';

export const StatusColors: Record<AgentStatus, string> = {
  idle: '#6B7280',      // gray
  working: '#10B981',   // green
  waiting: '#F59E0B',   // amber
  waiting_permission: '#F59E0B', // amber
  error: '#EF4444',     // red
  offline: '#9CA3AF',   // gray-400
  orphaned: '#6B7280',  // gray-500
};

export const ClassColors: Record<string, string> = {
  scout: '#3B82F6',      // blue
  builder: '#10B981',    // green
  debugger: '#EF4444',   // red
  architect: '#8B5CF6',  // purple
  warrior: '#F59E0B',    // amber
  support: '#EC4899',    // pink
  boss: '#F97316',       // orange
  default: '#6B7280',    // gray
};

export const getStatusColor = (status: AgentStatus): string => {
  return StatusColors[status] || StatusColors.idle;
};

export const getClassColor = (agentClass: AgentClass): string => {
  return ClassColors[agentClass] || ClassColors.default;
};

export const getClassEmoji = (agentClass: AgentClass): string => {
  const emojiMap: Record<string, string> = {
    scout: '🔍',
    builder: '🏗️',
    debugger: '🐛',
    architect: '🏛️',
    warrior: '⚔️',
    support: '🛟',
    boss: '👔',
  };
  return emojiMap[agentClass] || '🤖';
};
