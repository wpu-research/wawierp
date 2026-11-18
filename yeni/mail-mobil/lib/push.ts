import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** İzin ister, Expo token alır ve API'ye kaydeder. Sonuç metni ekranda gösterilir. */
export async function registerForPush(): Promise<string> {
  if (!Device.isDevice) return 'Push yalnız fiziksel cihazda çalışır.';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Yeni mail',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return 'Bildirim izni verilmedi.';
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const tok = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await api.registerPush(tok.data);
  return 'Bildirimler etkin.';
}
