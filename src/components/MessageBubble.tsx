import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { ChatMessage } from '@/types';
import { formatTimestamp } from '@/utils/date';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = !message.isAgent;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom render rules to make markdown text selectable
  const renderRules = {
    text: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.text}>
        {node.content}
      </Text>
    ),
    paragraph: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.paragraph}>
        {children}
      </Text>
    ),
    heading1: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.heading1}>
        {children}
      </Text>
    ),
    heading2: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.heading2}>
        {children}
      </Text>
    ),
    heading3: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.heading3}>
        {children}
      </Text>
    ),
    code_inline: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.code_inline}>
        {node.content}
      </Text>
    ),
    code_block: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.code_block}>
        {node.content}
      </Text>
    ),
    fence: (node: any, children: any, parent: any, styles: any) => (
      <Text key={node.key} selectable={true} style={styles.fence}>
        {node.content}
      </Text>
    ),
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
        {message.toolName && (
          <View style={styles.toolBadge}>
            <Text style={styles.toolText}>🔧 {message.toolName}</Text>
          </View>
        )}

        {/* Render markdown for agent messages, plain text for user messages */}
        {isUser ? (
          <Text style={[styles.text, styles.userText]} selectable={true}>
            {message.text}
          </Text>
        ) : (
          <Markdown
            style={markdownStyles}
            mergeStyle={true}
            rules={renderRules}
          >
            {message.text}
          </Markdown>
        )}

        {message.isStreaming && (
          <View style={styles.streamingIndicator}>
            <Text style={styles.streamingText}>●●●</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.agentTimestamp]}>
            {formatTimestamp(message.timestamp)}
          </Text>

          {/* Copy button only for agent messages */}
          {!isUser && (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={styles.copyButtonText}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  agentContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  agentText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#DBEAFE',
  },
  agentTimestamp: {
    color: '#9CA3AF',
  },
  toolBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  toolText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  streamingIndicator: {
    marginTop: 4,
  },
  streamingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
});

// Markdown styles for agent messages
const markdownStyles = StyleSheet.create({
  body: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
    marginBottom: 3,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
    marginBottom: 2,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: '#E5E7EB',
    color: '#DC2626',
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  fence: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bullet_list_icon: {
    marginRight: 8,
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 20,
  },
  ordered_list_icon: {
    marginRight: 8,
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 20,
  },
  hr: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: '#F3F4F6',
  },
  tbody: {},
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  th: {
    flex: 1,
    padding: 8,
    fontWeight: '600',
    color: '#111827',
  },
  td: {
    flex: 1,
    padding: 8,
    color: '#111827',
  },
});
