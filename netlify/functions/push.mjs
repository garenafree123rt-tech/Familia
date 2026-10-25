// Envía avisos push para que suene el teléfono aunque la app esté cerrada.
// Guarda en Netlify Blobs: las claves VAPID (se crean solas) y la suscripción de cada persona.
import webpush from 'web-push';
import { getStore } from '@netlify/blobs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const GID = /^[a-f0-9]{64}$/, NAME = /^[a-z0-9]{1,40}$/;

async function vapid() {
  const st = getStore({ name: 'config', consistency: 'strong' });
  let k = await st.get('vapid', { type: 'json' });
  if (!k) { await st.setJSON('vapid', webpush.generateVAPIDKeys()); k = await st.get('vapid', { type: 'json' }); }
  return k;
}

export default async (req) => {
  try {
    const keys = await vapid();
    if (req.method === 'GET') return new Response(keys.publicKey, { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
    if (req.method !== 'POST') return json({ ok: false }, 405);
    const b = await req.json().catch(() => null);
    if (!b || !GID.test(b.gid || '')) return json({ ok: false, reason: 'bad' }, 400);
    const subs = getStore({ name: 'subs', consistency: 'strong' });

    if (b.action === 'register') {
      const s = b.sub;
      if (!NAME.test(b.name || '') || !s || typeof s.endpoint !== 'string' || !s.endpoint.startsWith('https://') || !s.keys || !s.keys.p256dh || !s.keys.auth) return json({ ok: false, reason: 'bad' }, 400);
      await subs.setJSON(`${b.gid}/${b.name}`, { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } });
      return json({ ok: true });
    }

    if (b.action === 'call' || b.action === 'missed') {
      if (!NAME.test(b.to || '')) return json({ ok: false, reason: 'bad' }, 400);
      const k = `${b.gid}/${b.to}`;
      const sub = await subs.get(k, { type: 'json' });
      if (!sub) return json({ ok: false, reason: 'nosub' });
      const from = String(b.from || '').replace(/[\u0000-\u001f]/g, '').slice(0, 20) || 'Alguien';
      const missed = b.action === 'missed';
      webpush.setVapidDetails(new URL(req.url).origin, keys.publicKey, keys.privateKey);
      const payload = JSON.stringify({
        kind: b.action,
        title: missed ? 'Llamada perdida' : `${from} te está llamando`,
        body: missed ? `${from} intentó llamarte` : (b.video ? 'Videollamada · toca para contestar' : 'Llamada · toca para contestar')
      });
      try {
        await webpush.sendNotification(sub, payload, { TTL: missed ? 3600 : 60, urgency: 'high' });
        return json({ ok: true });
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await subs.delete(k);
        return json({ ok: false, reason: 'gone' });
      }
    }
    return json({ ok: false, reason: 'bad' }, 400);
  } catch (e) {
    console.error(e);
    return json({ ok: false, reason: 'error' }, 500);
  }
};
