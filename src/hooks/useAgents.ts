import { useState, useEffect, useCallback } from 'react';
import { Agent, ChatMessage, AgentOutput } from '@/types';
import { ApiClient } from '@/api/client';
import { WebSocketClient } from '@/api/websocket';

interface UseAgentsProps {
  apiClient: ApiClient;
  wsClient: WebSocketClient;
}

export const useAgents = ({ apiClient, wsClient }: UseAgentsProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Message history per agent
  const [agentMessages, setAgentMessages] = useState<Record<string, ChatMessage[]>>({});

  // Helper function to remove duplicate messages by ID
  const deduplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>();
    const deduplicated: ChatMessage[] = [];
    const duplicates: string[] = [];

    for (const msg of messages) {
      if (!seen.has(msg.id)) {
        seen.add(msg.id);
        deduplicated.push(msg);
      } else {
        duplicates.push(msg.id);
        console.warn('[deduplicateMessages] ⚠️ DUPLICATE REMOVED:', {
          id: msg.id,
          agentId: msg.agentId,
          toolName: msg.toolName,
          textPreview: msg.text?.substring(0, 50),
          timestamp: msg.timestamp,
          isAgent: msg.isAgent,
        });
      }
    }

    if (duplicates.length > 0) {
      console.error('[deduplicateMessages] 🔴 TOTAL DUPLICATES REMOVED:', duplicates.length, duplicates);
      console.log('[deduplicateMessages] Full message list IDs:', messages.map(m => m.id));
    }

    return deduplicated;
  };

  // Helper function to validate messages array has no duplicates
  const validateNoDuplicates = (messages: ChatMessage[], context: string): boolean => {
    const ids = messages.map(m => m.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      console.error(`[validateNoDuplicates] 🔴 VALIDATION FAILED at ${context}:`, {
        totalMessages: ids.length,
        uniqueMessages: uniqueIds.size,
        duplicateCount: ids.length - uniqueIds.size,
        duplicateIds: [...new Set(duplicateIds)],
        allIds: ids,
      });
      return false;
    }
    return true;
  };

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAgents = await apiClient.getAgents();
      setAgents(fetchedAgents);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
      // Don't crash the app if server is not available
      setError(err.message || 'Failed to load agents');
      setAgents([]); // Set empty array instead of crashing
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const loadAgentHistory = useCallback(async (agentId: string) => {
    try {
      console.log(`[loadAgentHistory] Loading history for agent: ${agentId}`);
      const history = await apiClient.getAgentHistory(agentId, 50);

      console.log(`[loadAgentHistory] Received history:`, {
        agentId,
        isArray: Array.isArray(history),
        length: history?.length || 0,
        firstItem: history?.[0] || null,
      });

      // Validate history is an array
      if (!history || !Array.isArray(history)) {
        console.warn(`[loadAgentHistory] Invalid history format for agent ${agentId}`, history);
        setAgentMessages(prev => ({
          ...prev,
          [agentId]: [],
        }));
        return;
      }

      // Convert history to chat messages
      // Backend returns SessionMessage objects with structure:
      // { type: 'user'|'assistant'|'tool_use'|'tool_result', content: string, timestamp: string, uuid: string, ... }
      const messages: ChatMessage[] = history
        .map((item: any, index: number) => {
          try {
            // Validate message has required fields
            if (!item || typeof item !== 'object') {
              console.warn(`[loadAgentHistory] Skipping invalid message at index ${index}:`, item);
              return null;
            }

            // Parse timestamp with validation
            let timestampMs: number;
            try {
              if (item.timestamp) {
                const parsed = new Date(item.timestamp).getTime();
                timestampMs = isNaN(parsed) ? Date.now() : parsed;
              } else {
                timestampMs = Date.now();
              }
            } catch {
              timestampMs = Date.now();
            }

            // Determine if message is from agent (assistant, tool_use, tool_result)
            const isAgent = item.type === 'assistant' || item.type === 'tool_use' || item.type === 'tool_result';

            // Get content with fallbacks for different formats
            let text = '';
            if (typeof item.content === 'string') {
              text = item.content;
            } else if (item.content && typeof item.content === 'object') {
              // Handle complex content objects (arrays, nested structures)
              try {
                if (Array.isArray(item.content) && item.content[0]?.text) {
                  text = item.content[0].text;
                } else {
                  text = JSON.stringify(item.content);
                }
              } catch {
                text = '[Complex content]';
              }
            } else if (item.text) {
              // Fallback to 'text' field if 'content' doesn't exist
              text = item.text;
            } else {
              text = '[Empty message]';
            }

            // For tool messages, add tool name context
            if (item.type === 'tool_use' && item.toolName) {
              text = `[Tool: ${item.toolName}]\n${text}`;
            } else if (item.type === 'tool_result') {
              text = `[Tool Result]\n${text}`;
            }

            return {
              id: item.uuid || `${agentId}-history-${timestampMs}-${index}`,
              agentId,
              text,
              timestamp: timestampMs,
              isAgent,
              toolName: item.toolName,
              toolInput: item.toolInput,
            };
          } catch (err) {
            console.error(`[loadAgentHistory] Error processing message at index ${index}:`, err, item);
            return null;
          }
        })
        .filter((msg): msg is ChatMessage => msg !== null); // Remove null entries

      console.log(`[loadAgentHistory] Processed ${messages.length} messages for agent ${agentId}`);
      console.log(`[loadAgentHistory] First processed message:`, messages[0]);
      console.log(`[loadAgentHistory] Last processed message:`, messages[messages.length - 1]);

      // Merge strategy: Keep history messages + preserve local messages not in history
      setAgentMessages(prev => {
        const existingMessages = prev[agentId] || [];

        // If no existing messages, just use history (with deduplication)
        if (existingMessages.length === 0) {
          const deduplicated = deduplicateMessages(messages);
          validateNoDuplicates(deduplicated, 'loadAgentHistory (initial)');
          return { ...prev, [agentId]: deduplicated };
        }

        // Get UUIDs from history messages
        const historyUUIDs = new Set(messages.map(m => m.id).filter(id => !id.includes('-user-') && !id.includes('-output-')));

        // Keep local messages that are not in history (recent messages not yet persisted)
        // These are messages with generated IDs (user messages or output messages without UUID)
        const localOnlyMessages = existingMessages.filter(m => {
          // If message has a generated ID (not from history), it's local
          if (m.id.includes('-user-') || m.id.includes('-output-')) {
            return true;
          }
          // If message has UUID but not in history, keep it
          return !historyUUIDs.has(m.id);
        });

        console.log(`[loadAgentHistory] Merging: ${messages.length} history + ${localOnlyMessages.length} local messages`);

        // Combine and sort by timestamp
        const merged = [...messages, ...localOnlyMessages].sort((a, b) => a.timestamp - b.timestamp);

        // Deduplicate the merged list to ensure no duplicates
        const deduplicated = deduplicateMessages(merged);

        console.log(`[loadAgentHistory] After deduplication: ${deduplicated.length} messages`);

        // Final validation before returning
        validateNoDuplicates(deduplicated, 'loadAgentHistory (merge)');

        return { ...prev, [agentId]: deduplicated };
      });
    } catch (err) {
      console.error(`Failed to load history for agent ${agentId}:`, err);
      // Set empty array on error
      setAgentMessages(prev => ({
        ...prev,
        [agentId]: [],
      }));
    }
  }, [apiClient]);

  const sendMessage = useCallback(async (agentId: string, message: string) => {
    try {
      const now = Date.now();
      // Add user message to local state immediately
      // Use performance.now() for more precision to avoid duplicate keys
      const userMessage: ChatMessage = {
        id: `${agentId}-user-${now}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        text: message,
        timestamp: now,
        isAgent: false,
      };

      console.log(`[sendMessage] 📤 Adding user message: ${userMessage.id}`);

      setAgentMessages(prev => {
        const updatedMessages = [...(prev[agentId] || []), userMessage];
        console.log(`[sendMessage] New message count: ${updatedMessages.length}`);

        // Validate no duplicates
        validateNoDuplicates(updatedMessages, 'sendMessage');

        return {
          ...prev,
          [agentId]: updatedMessages,
        };
      });

      // Send via API
      await apiClient.sendMessage(agentId, message);

      // Also send via WebSocket if connected
      if (wsClient.isConnected()) {
        wsClient.sendCommand(agentId, message);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [apiClient, wsClient]);

  // WebSocket event handlers
  useEffect(() => {
    wsClient.setHandlers({
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      onAgentsUpdate: (updatedAgents) => {
        setAgents(updatedAgents);
      },
      onAgentCreated: (agent) => {
        setAgents(prev => [...prev, agent]);
      },
      onAgentUpdated: (agent) => {
        setAgents(prev =>
          prev.map(a => (a.id === agent.id ? agent : a))
        );
      },
      onAgentDeleted: ({ id }) => {
        setAgents(prev => prev.filter(a => a.id !== id));
      },
      onOutput: (output: AgentOutput) => {
        try {
          // Validate output object
          if (!output || !output.agentId) {
            console.warn('[onOutput] Invalid output received:', output);
            return;
          }

          setAgentMessages(prev => {
            try {
              const existingMessages = prev[output.agentId] || [];

              // ALWAYS check if message already exists by UUID first
              if (output.uuid) {
                const existingIndex = existingMessages.findIndex(m => m.id === output.uuid);

                if (existingIndex !== -1) {
                  // Message exists - update it (for streaming)
                  console.log(`[onOutput] 🔄 Updating existing message: ${output.uuid} (index: ${existingIndex})`);
                  const existingMessage = existingMessages[existingIndex];
                  const updatedMessage: ChatMessage = {
                    ...existingMessage,
                    text: output.isStreaming ? existingMessage.text + (output.text || '') : (output.text || existingMessage.text),
                    timestamp: output.timestamp || existingMessage.timestamp,
                    isStreaming: output.isStreaming,
                    toolName: output.toolName || existingMessage.toolName,
                    toolInput: output.toolInput || existingMessage.toolInput,
                    toolOutput: output.toolOutput || existingMessage.toolOutput,
                  };

                  // Replace the existing message
                  const updated = [...existingMessages];
                  updated[existingIndex] = updatedMessage;

                  // Validate after update
                  const isValid = validateNoDuplicates(updated, `onOutput (update message ${output.uuid})`);

                  if (!isValid) {
                    console.error('[onOutput] 🔴 CRITICAL: Duplicates after updating message!', {
                      uuid: output.uuid,
                      existingIndex,
                      totalMessages: updated.length,
                    });
                  }

                  return {
                    ...prev,
                    [output.agentId]: updated,
                  };
                }
              }

              // Generate unique ID for new message
              const uniqueId = output.uuid || `${output.agentId}-output-${output.timestamp || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              // Double-check: verify this ID doesn't already exist (safety check)
              const duplicateCheck = existingMessages.findIndex(m => m.id === uniqueId);
              if (duplicateCheck !== -1) {
                console.warn('[onOutput] DUPLICATE DETECTED! Skipping message:', uniqueId, {
                  agentId: output.agentId,
                  toolName: output.toolName,
                  textPreview: output.text?.substring(0, 50),
                  isStreaming: output.isStreaming,
                  currentListSize: existingMessages.length,
                });
                return prev; // Don't add duplicate
              }

              // Message doesn't exist - add it
              console.log(`[onOutput] ✅ Adding new message: ${uniqueId} (toolName: ${output.toolName}, streaming: ${output.isStreaming})`);
              const newMessage: ChatMessage = {
                id: uniqueId,
                agentId: output.agentId,
                text: output.text || '[No content]',
                timestamp: output.timestamp || Date.now(),
                isAgent: true,
                isStreaming: output.isStreaming,
                toolName: output.toolName,
                toolInput: output.toolInput,
                toolOutput: output.toolOutput,
              };

              const updatedMessages = [...existingMessages, newMessage];

              // Log current state before deduplication
              console.log(`[onOutput] Before deduplication: ${updatedMessages.length} messages`);
              console.log(`[onOutput] Message IDs:`, updatedMessages.map(m => m.id));

              // Final deduplication check on the entire list
              const deduplicated = deduplicateMessages(updatedMessages);

              // Validate no duplicates
              const isValid = validateNoDuplicates(deduplicated, `onOutput (agent: ${output.agentId})`);

              if (!isValid) {
                console.error('[onOutput] 🔴 CRITICAL: Duplicates detected after deduplication!', {
                  agentId: output.agentId,
                  messageCount: deduplicated.length,
                  outputUuid: output.uuid,
                  outputToolName: output.toolName,
                });
              }

              console.log(`[onOutput] ✅ Final message count: ${deduplicated.length}`);

              return {
                ...prev,
                [output.agentId]: deduplicated,
              };
            } catch (err) {
              console.error('[onOutput] Error processing output:', err, output);
              return prev; // Return unchanged state on error
            }
          });
        } catch (err) {
          console.error('[onOutput] Critical error in handler:', err);
        }
      },
      onActivity: (activity) => {
        console.log('Activity:', activity);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError(error.message);
      },
    });
  }, [wsClient]);

  // Load agents on mount only if we have a valid server URL
  useEffect(() => {
    // Don't try to load if there's no server configured
    if (apiClient) {
      loadAgents().catch(err => {
        console.warn('Initial agent load failed:', err);
        // Silently fail - user can configure server in Settings
      });
    }
  }, [loadAgents, apiClient]);

  return {
    agents,
    loading,
    error,
    isConnected,
    agentMessages,
    loadAgents,
    loadAgentHistory,
    sendMessage,
  };
};
