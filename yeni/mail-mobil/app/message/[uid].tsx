import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { api, MessageDetail } from '../../lib/api';
import { s } from '../../lib/ui';

const wrap = (body: string) =>
  `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">` +
  `<style>body{font-family:-apple-system,Roboto,sans-serif;font-size:16px;word-wrap:break-word}img{max-width:100%;height:auto}</style>` +
  `</head><body>${body}</body></html>`;

export default function MessageScreen() {
  const { uid, folder } = useLocalSearchParams<{ uid: string; folder?: string }>();
  const router = useRouter();
  const f = folder ?? 'INBOX';
  const [m, setM] = useState<MessageDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.message(Number(uid), f)
      .then((d) => {
        setM(d);
        if (!d.seen) api.markSeen(d.uid, f).catch(() => {});
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [uid, f]);

  if (error) return <Text style={s.err}>{error}</Text>;
  if (!m) return <ActivityIndicator style={{ margin: 32 }} />;

  const reply = () =>
    router.push({
      pathname: '/compose',
      params: {
        to: m.from,
        subject: /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`,
        in_reply_to: m.message_id,
        quote: m.text.split('\n').map((l) => `> ${l}`).join('\n'),
      },
    });

  return (
    <View style={s.screen}>
      <Stack.Screen options={{
        title: 'Mail',
        headerRight: () => <TouchableOpacity onPress={reply}><Text>Yanıtla</Text></TouchableOpacity>,
      }} />
      <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>{m.subject || '(konu yok)'}</Text>
        <Text style={s.muted}>{m.from}</Text>
        <Text style={s.muted}>{m.date}</Text>
        {m.attachments.length ? (
          <Text style={s.muted}>Ekler: {m.attachments.map((a) => a.filename).join(', ')}</Text>
        ) : null}
      </View>
      {m.html ? (
        <WebView originWhitelist={['about:blank']} source={{ html: wrap(m.html) }}
          javaScriptEnabled={false} style={{ flex: 1 }}
          onShouldStartLoadWithRequest={(r) => r.url === 'about:blank'} />
      ) : (
        <ScrollView contentContainerStyle={s.pad}><Text selectable>{m.text}</Text></ScrollView>
      )}
    </View>
  );
}
