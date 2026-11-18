import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  pad: { padding: 16 },
  label: { fontSize: 13, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, color: '#111',
  },
  btn: { backgroundColor: '#1a56db', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  err: { color: '#b00020', padding: 12 },
  muted: { color: '#666' },
});
