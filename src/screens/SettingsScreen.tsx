import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '@/contexts/AppContext';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { config, updateConfig, isConnected, testConnection } = useContext(AppContext);

  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [authToken, setAuthToken] = useState(config.authToken || '');
  const [enableNotifications, setEnableNotifications] = useState(config.enableNotifications);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testConnection(serverUrl, authToken || undefined);
      if (success) {
        Alert.alert('Success', 'Connected to Tide Commander server!');
      } else {
        Alert.alert('Error', 'Failed to connect to server. Please check the URL and token.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Server URL is required');
      return;
    }

    setSaving(true);
    try {
      await updateConfig({
        serverUrl: serverUrl.trim(),
        authToken: authToken.trim() || undefined,
        enableNotifications,
      });
      Alert.alert('Success', 'Settings saved successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Connection</Text>

        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected to server' : 'Not connected'}
          </Text>
        </View>

        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          placeholder="http://192.168.1.100:5174"
          placeholderTextColor="#9CA3AF"
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Enter the IP address and port of your Tide Commander server
        </Text>

        <Text style={styles.label}>Auth Token (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter auth token if required"
          placeholderTextColor="#9CA3AF"
          value={authToken}
          onChangeText={setAuthToken}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Text style={styles.hint}>
          Only needed if your server has AUTH_TOKEN configured
        </Text>

        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={handleTestConnection}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.testButtonText}>Test Connection</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>Push Notifications</Text>
            <Text style={styles.hint}>
              Get notified when agents complete tasks or encounter errors
            </Text>
          </View>
          <Switch
            value={enableNotifications}
            onValueChange={setEnableNotifications}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={enableNotifications ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Tide Mobile v1.0.0</Text>
        <Text style={styles.aboutText}>
          Mobile companion app for Tide Commander
        </Text>
        <Text style={styles.aboutText}>
          Monitor and control your Claude agents from anywhere
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  testButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 40,
  },
});
