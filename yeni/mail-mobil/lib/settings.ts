import * as SecureStore from 'expo-secure-store';

const K_URL = 'api_url';
const K_TOKEN = 'api_token';

export type Settings = { url: string; token: string };

export async function loadSettings(): Promise<Settings> {
  return {
    url: (await SecureStore.getItemAsync(K_URL)) ?? '',
    token: (await SecureStore.getItemAsync(K_TOKEN)) ?? '',
  };
}

export async function saveSettings(s: Settings): Promise<void> {
  await SecureStore.setItemAsync(K_URL, s.url.trim().replace(/\/+$/, ''));
  await SecureStore.setItemAsync(K_TOKEN, s.token.trim());
}
