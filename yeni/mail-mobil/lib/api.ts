import { loadSettings } from './settings';

export type Folder = { name: string; flags: string[] };
export type MessageSummary = {
  uid: number; from: string; subject: string; date: string; seen: boolean; snippet: string;
};
export type Attachment = { index: number; filename: string; content_type: string; size: number };
export type MessageDetail = {
  uid: number; folder: string; message_id: string; from: string; to: string; cc: string;
  subject: string; date: string; seen: boolean; text: string; html: string; attachments: Attachment[];
};
export type SendBody = {
  to: string[]; cc: string[]; subject: string; body: string; in_reply_to?: string;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, token } = await loadSettings();
  if (!url || !token) throw new Error('Önce Ayarlar ekranından API adresi ve token girin.');
  const res = await fetch(url + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).detail ?? ''; } catch { /* yoksay */ }
    throw new Error(`Hata ${res.status}${detail ? ': ' + detail : ''}`);
  }
  return (await res.json()) as T;
}

const q = encodeURIComponent;

export const api = {
  folders: () => call<Folder[]>('/folders'),
  messages: (folder: string, beforeUid?: number, limit = 30) =>
    call<MessageSummary[]>(
      `/messages?folder=${q(folder)}&limit=${limit}${beforeUid ? `&before_uid=${beforeUid}` : ''}`),
  message: (uid: number, folder: string) =>
    call<MessageDetail>(`/messages/${uid}?folder=${q(folder)}`),
  markSeen: (uid: number, folder: string) =>
    call<{ ok: boolean }>(`/messages/${uid}/seen?folder=${q(folder)}`, { method: 'POST' }),
  send: (b: SendBody) => call<{ sent: boolean }>('/send', { method: 'POST', body: JSON.stringify(b) }),
  registerPush: (expo_token: string) =>
    call<{ ok: boolean }>('/push/register', { method: 'POST', body: JSON.stringify({ expo_token }) }),
};
