export interface AppConfig {
  serverUrl: string;
  authToken?: string;
  enableNotifications: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  serverUrl: 'http://192.168.1.100:5174',
  authToken: undefined,
  enableNotifications: true,
};
