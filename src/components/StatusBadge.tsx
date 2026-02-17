import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgentStatus } from '@/types';
import { getStatusColor } from '@/utils/colors';

interface StatusBadgeProps {
  status: AgentStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const color = getStatusColor(status);
  const statusText = status.replace('_', ' ').toUpperCase();

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall]}>
      <View style={[styles.dot, { backgroundColor: color }, size === 'small' && styles.dotSmall]} />
      <Text style={[styles.text, size === 'small' && styles.textSmall]}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  textSmall: {
    fontSize: 10,
  },
});
