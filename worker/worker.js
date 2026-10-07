// Cloudflare Worker: CORS-прокси для Yandex Wordstat API.
// Пробрасывает запрос на api.wordstat.yandex.net и добавляет CORS-заголовки.
// Токен не хранится — приходит в заголовке Authorization от страницы.
const UPSTREAM = 'https://api.wordstat.yandex.net';
// Укажите свой адрес GitHub Pages, например 'https://USER.github.io'
const ALLOWED_ORIGIN = '*';

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/v1/')) return new Response('Not found', { status: 404, headers: cors });
    const res = await fetch(UPSTREAM + url.pathname, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: await req.text(),
    });
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
    return out;
  },
};
