import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View,
} from 'react-native';
import { api, Folder, MessageSummary } from '../lib/api';
import { loadSettings } from '../lib/settings';
import { s } from '../lib/ui';

const PAGE = 30;

export default function Inbox() {
  const router = useRouter();
  const [folder, setFolder] = useState('INBOX');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pick, setPick] = useState(false);
  const [items, setItems] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const done = useRef(false);

  const load = useCallback(async (f: string, more: boolean) => {
    if (loading && more) return;
    setLoading(true);
    setError('');
    try {
      const { url, token } = await loadSettings();
      if (!url || !token) { router.push('/settings'); return; }
      const before = more && items.length ? items[items.length - 1].uid : undefined;
      const page = await api.messages(f, before, PAGE);
      done.current = page.length < PAGE;
      setItems((cur) => (more ? [...cur, ...page] : page));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [items, loading, router]);

  useFocusEffect(useCallback(() => {
    load(folder, false);
    api.folders().then(setFolders).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]));

  const choose = (name: string) => { setPick(false); setItems([]); setFolder(name); };

  return (
    <View style={s.screen}>
      <Stack.Screen options={{
        title: folder,
        headerLeft: () => (
          <TouchableOpacity onPress={() => setPick(true)}><Text>Klasörler</Text></TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => router.push('/compose')}><Text>Yaz</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}><Text>Ayarlar</Text></TouchableOpacity>
          </View>
        ),
      }} />
      {error ? <Text style={s.err}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(m) => String(m.uid)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(folder, false); }} />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => { if (!done.current && items.length) load(folder, true); }}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        ListEmptyComponent={!loading && !error ? <Text style={[s.muted, s.pad]}>Mail yok.</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
            onPress={() => router.push({ pathname: '/message/[uid]', params: { uid: String(item.uid), folder } })}>
            <Text numberOfLines={1} style={{ fontWeight: item.seen ? '400' : '700', fontSize: 15 }}>{item.from}</Text>
            <Text numberOfLines={1} style={{ fontWeight: item.seen ? '400' : '700', marginTop: 2 }}>{item.subject || '(konu yok)'}</Text>
            <Text numberOfLines={2} style={[s.muted, { marginTop: 2 }]}>{item.snippet}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal visible={pick} animationType="slide" onRequestClose={() => setPick(false)}>
        <View style={[s.screen, { paddingTop: 56 }]}>
          <FlatList
            data={folders}
            keyExtractor={(f) => f.name}
            renderItem={({ item }) => (
              <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => choose(item.name)}>
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={s.btn} onPress={() => setPick(false)}>
            <Text style={s.btnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
