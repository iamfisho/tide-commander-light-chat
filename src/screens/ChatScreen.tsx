import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessageBubble, StatusBadge } from '@/components';
import { Agent } from '@/types';
import { AppContext } from '@/contexts/AppContext';
import { getClassEmoji } from '@/utils/colors';

type ChatScreenRouteProp = RouteProp<{ Chat: { agent: Agent } }, 'Chat'>;
type NavigationProp = StackNavigationProp<any, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { agent: initialAgent } = route.params;

  const { agents, agentMessages, sendMessage, loadAgentHistory } = useContext(AppContext);

  // Get the latest agent data from context
  const agent = agents.find(a => a.id === initialAgent.id) || initialAgent;

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef({ offset: 0, isNearBottom: true });
  const previousMessageCountRef = useRef(0);
  const hasScrolledInitiallyRef = useRef(false);

  const messages = agentMessages[agent.id] || [];

  useEffect(() => {
    // Load history when screen opens
    loadAgentHistory(agent.id);
    hasScrolledInitiallyRef.current = false;
  }, [agent.id, loadAgentHistory]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!hasScrolledInitiallyRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        scrollPositionRef.current.isNearBottom = true;
        hasScrolledInitiallyRef.current = true;
        console.log('[ChatScreen] Initial scroll to bottom');
      }, 300);
    }
  }, [messages.length]);

  // Only scroll to bottom when a NEW message is added (not when existing messages update)
  // AND user is already near the bottom
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = previousMessageCountRef.current;

    // Check if this is a new message (count increased)
    const isNewMessage = currentMessageCount > previousMessageCount;

    if (isNewMessage && scrollPositionRef.current.isNearBottom) {
      console.log('[ChatScreen] Auto-scrolling to new message');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    // Update previous count
    previousMessageCountRef.current = currentMessageCount;
  }, [messages.length]);

  // Debug: Log messages when they change
  useEffect(() => {
    const ids = messages.map(m => m.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.error('[ChatScreen] 🔴 DUPLICATE KEYS DETECTED IN FLATLIST DATA:', {
        agentId: agent.id,
        agentName: agent.name,
        totalMessages: ids.length,
        uniqueMessages: uniqueIds.size,
        duplicateCount: ids.length - uniqueIds.size,
        duplicateIds: [...new Set(duplicateIds)],
        allIds: ids,
      });
    } else {
      console.log(`[ChatScreen] ✅ Messages valid: ${ids.length} unique messages for agent ${agent.name}`);
    }
  }, [messages, agent.id, agent.name]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const message = inputText.trim();
    setInputText('');
    setSending(true);

    // Force scroll to bottom when user sends a message
    scrollPositionRef.current.isNearBottom = true;

    try {
      await sendMessage(agent.id, message);

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const wasNearBottom = scrollPositionRef.current.isNearBottom;

    try {
      await loadAgentHistory(agent.id);

      // If user was near bottom before refresh, scroll to bottom after
      if (wasNearBottom) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    } catch (error) {
      console.error('Failed to refresh chat:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollOffset = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;

    // Consider "near bottom" if within 100 pixels of the end
    const isNearBottom = maxScroll - scrollOffset < 100;

    scrollPositionRef.current = {
      offset: scrollOffset,
      isNearBottom,
    };

    // console.log('[ChatScreen] Scroll position:', { scrollOffset, maxScroll, isNearBottom });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerEmoji}>{getClassEmoji(agent.class)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1}>
            {agent.name}
          </Text>
          <Text style={styles.headerCwd} numberOfLines={1}>
            {agent.cwd}
          </Text>
        </View>
      </View>
      <StatusBadge status={agent.status} size="small" />
      <TouchableOpacity
        onPress={handleRefresh}
        style={styles.refreshButton}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <Text style={styles.refreshIcon}>↻</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Send a command to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.messageList}
          inverted={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            // Only auto-scroll on content size change if user is near bottom
            // This prevents interrupting manual scrolling when messages update (streaming)
            if (messages.length > 0 && scrollPositionRef.current.isNearBottom) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a command..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!sending}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (inputText.trim() && !sending) {
                handleSend();
              }
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#3B82F6',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerCwd: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '600',
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
