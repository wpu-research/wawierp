import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';
import { registerForPush } from '../lib/push';
import { DEFAULT_URL, saveSettings } from '../lib/settings';

// Ilk acilis: yalniz erisim kodu istenir; API adresi varsayilan gelir.
export default function Login() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!token.trim()) return;
    setBusy(true);
    setError('');
    try {
      await saveSettings({ url: DEFAULT_URL, token: token.trim() });
      await api.folders(); // kod dogru mu?
      registerForPush().catch(() => {});
      router.replace('/');
    } catch {
      await saveSettings({ url: DEFAULT_URL, token: '' });
      setError('Giriş başarısız. Erişim kodunu kontrol et.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>WMail</Text>
      <Text style={s.sub}>Şirket maili</Text>
      <TextInput
        style={s.input}
        placeholder="Erişim kodu"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={token}
        onChangeText={setToken}
        onSubmitEditing={submit}
      />
      {error ? <Text style={s.err}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Giriş yap</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 16 },
  err: { color: '#c62828' },
  btn: { backgroundColor: '#1565c0', borderRadius: 10, padding: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
