import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../lib/api';
import { registerForPush } from '../lib/push';
import { loadSettings, saveSettings } from '../lib/settings';
import { s } from '../lib/ui';

export default function Settings() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadSettings().then((v) => { setUrl(v.url); setToken(v.token); });
  }, []);

  const save = async () => {
    try {
      await saveSettings({ url, token });
      await api.folders(); // bağlantı sınaması
      setInfo('Kaydedildi, bağlantı tamam. Push kaydediliyor...');
      setInfo(await registerForPush());
      router.replace('/');
    } catch (e) {
      setInfo(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>API adresi (örn. http://192.168.1.20:8000)</Text>
      <TextInput style={s.input} value={url} onChangeText={setUrl} autoCapitalize="none"
        autoCorrect={false} keyboardType="url" placeholder="http://..." />
      <Text style={s.label}>API token</Text>
      <TextInput style={s.input} value={token} onChangeText={setToken} autoCapitalize="none"
        autoCorrect={false} secureTextEntry placeholder="Bearer anahtarı" />
      <TouchableOpacity style={s.btn} onPress={save}>
        <Text style={s.btnText}>Kaydet ve dene</Text>
      </TouchableOpacity>
      {info ? <Text style={[s.muted, { marginTop: 16 }]}>{info}</Text> : null}
    </ScrollView>
  );
}
