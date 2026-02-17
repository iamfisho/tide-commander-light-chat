import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Agent } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getClassEmoji, getClassColor } from '@/utils/colors';
import { formatRelativeTime } from '@/utils/date';

interface AgentCardProps {
  agent: Agent;
  onPress: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onPress }) => {
  const emoji = getClassEmoji(agent.class);
  const classColor = getClassColor(agent.class);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: classColor + '20' }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {agent.name}
          </Text>
          <StatusBadge status={agent.status} size="small" />
        </View>

        <Text style={styles.cwd} numberOfLines={1}>
          📁 {agent.cwd}
        </Text>

        {agent.currentTask && (
          <Text style={styles.task} numberOfLines={2}>
            {agent.currentTask}
          </Text>
        )}

        {!agent.currentTask && (
          <Text style={styles.waiting}>Waiting for task...</Text>
        )}

        <Text style={styles.timestamp}>
          Updated {formatRelativeTime(agent.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  cwd: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  task: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  waiting: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
