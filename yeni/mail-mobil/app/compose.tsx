import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../lib/api';
import { s } from '../lib/ui';

const split = (v: string) => v.split(/[,;]/).map((x) => x.trim()).filter(Boolean);

export default function Compose() {
  const p = useLocalSearchParams<{ to?: string; subject?: string; in_reply_to?: string; quote?: string }>();
  const router = useRouter();
  const [to, setTo] = useState(p.to ?? '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(p.subject ?? '');
  const [body, setBody] = useState(p.quote ? `\n\n${p.quote}` : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      await api.send({ to: split(to), cc: split(cc), subject, body, in_reply_to: p.in_reply_to || undefined });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Kime</Text>
      <TextInput style={s.input} value={to} onChangeText={setTo} autoCapitalize="none"
        keyboardType="email-address" autoCorrect={false} />
      <Text style={s.label}>Bilgi (Cc)</Text>
      <TextInput style={s.input} value={cc} onChangeText={setCc} autoCapitalize="none"
        keyboardType="email-address" autoCorrect={false} />
      <Text style={s.label}>Konu</Text>
      <TextInput style={s.input} value={subject} onChangeText={setSubject} />
      <Text style={s.label}>Mesaj</Text>
      <TextInput style={[s.input, { minHeight: 200, textAlignVertical: 'top' }]} value={body}
        onChangeText={setBody} multiline />
      {error ? <Text style={s.err}>{error}</Text> : null}
      <TouchableOpacity style={[s.btn, busy && { opacity: 0.5 }]} disabled={busy} onPress={send}>
        <Text style={s.btnText}>{busy ? 'Gönderiliyor...' : 'Gönder'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
