import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const open = (r: Notifications.NotificationResponse) => {
      const d = r.notification.request.content.data as { uid?: number; folder?: string };
      if (d?.uid) {
        router.push({ pathname: '/message/[uid]', params: { uid: String(d.uid), folder: d.folder ?? 'INBOX' } });
      }
    };
    Notifications.getLastNotificationResponseAsync().then((r) => { if (r) open(r); });
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Gelen Kutusu' }} />
      <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
      <Stack.Screen name="message/[uid]" options={{ title: 'Mail' }} />
      <Stack.Screen name="compose" options={{ title: 'Yeni Mail', presentation: 'modal' }} />
    </Stack>
  );
}
