/**
 * Garoop Novel の Service Worker。
 *
 * 目的は 2 つ。
 *   1. 圏外のときに、真っ白ではなく説明のある画面（/offline.html）を出す
 *      TWA（Google Play）で配るため、オフラインで何も出ないと
 *      「壊れている」と見なされる。
 *   2. ビルドごとに名前が変わる /_next/static と、アイコン類だけを溜めて速くする
 *
 * やらないこと:
 *   - ログイン・認証まわりの画面と通信には一切触らない
 *     （/sso の token、/loginCallBack の code/state を溜めると、
 *      使い捨ての値が端末に残り、戻ったときに同じ値でもう一度交換しに行ってしまう）
 *   - API は溜めない（/api/ も、外部の api.garoop.jp などの他オリジンも）
 *   - RSC（画面遷移時の部分応答）は溜めない。ビルドが変わると中身が合わなくなる
 *
 * 画面の HTML はネットワーク優先。取れたときだけ控えを置き、
 * 圏外のときに一度見たページならその控えを、無ければ offline.html を返す。
 *
 * 中身を変えたら VERSION を上げること。古い版のキャッシュは activate で消える。
 */

const VERSION = 'gnovel-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

// 一度見たページの控えは、この件数を超えたら古いものから捨てる。
const PAGE_CACHE_LIMIT = 30;

// 圏外の画面で使うものだけ。HTML はここに入れない。
const SHELL = ['/offline.html', '/icon-192.webp', '/icon-192.png'];

// ロケール接頭辞（日本語は接頭辞なし）。src/locales/index.ts と合わせる。
const LOCALES = ['en', 'zh', 'fr', 'id', 'it', 'ne'];

// ログイン・認証に関わる画面。ロケール付き（/en/sso など）も同じ扱い。
const AUTH_SEGMENTS = ['sso', 'loginCallBack', 'login', 'logout', 'auth', 'oauth', 'callback'];

function stripLocale(pathname) {
  const parts = pathname.split('/');
  if (parts.length > 1 && LOCALES.includes(parts[1])) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

function isAuthRequest(url) {
  const path = stripLocale(url.pathname);
  const first = path.split('/')[1] || '';
  if (AUTH_SEGMENTS.some((s) => s.toLowerCase() === first.toLowerCase())) return true;
  // 使い捨ての値を運ぶクエリが付いていたら、どの画面でも溜めない。
  for (const key of ['token', 'code', 'state', 'id_token', 'access_token']) {
    if (url.searchParams.has(key)) return true;
  }
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(`${VERSION}-`)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

async function trimPageCache() {
  const cache = await caches.open(PAGE_CACHE);
  const keys = await cache.keys();
  const overflow = keys.length - PAGE_CACHE_LIMIT;
  for (let i = 0; i < overflow; i++) await cache.delete(keys[i]);
}

async function offlineResponse() {
  // キャッシュを消された直後だと offline.html も無いことがある。
  // そこで undefined を返すと respondWith が落ちて、
  // ブラウザ既定のエラー画面すら出せなくなる。
  const cached = await caches.match('/offline.html', { cacheName: SHELL_CACHE });
  return (
    cached ||
    new Response(
      '<!doctype html><meta charset="utf-8"><title>Garoop Novel</title><p>インターネットにつながっていません。</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  );
}

async function handleNavigate(request, url, canStore) {
  try {
    const response = await fetch(request);
    // 正常な HTML だけ控える。リダイレクト後の応答や 404・500 は控えない。
    if (
      canStore &&
      response.ok &&
      response.type === 'basic' &&
      !response.redirected &&
      (response.headers.get('Content-Type') || '').includes('text/html')
    ) {
      const copy = response.clone();
      caches
        .open(PAGE_CACHE)
        .then((cache) => cache.put(url.pathname, copy))
        .then(trimPageCache)
        .catch(() => {});
    }
    return response;
  } catch {
    if (canStore) {
      const cached = await caches.match(url.pathname, { cacheName: PAGE_CACHE });
      if (cached) return cached;
    }
    return offlineResponse();
  }
}

async function handleStatic(request) {
  const cached = await caches.match(request, { cacheName: STATIC_CACHE });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 他サイト（api.garoop.jp、解析、画像 CDN など）には触らない。
  if (url.origin !== self.location.origin) return;

  // API は溜めない。そのままネットワークへ。
  if (url.pathname.startsWith('/api/')) return;

  // 認証付きの通信も溜めない。
  if (request.headers.has('Authorization')) return;

  const auth = isAuthRequest(url);

  if (request.mode === 'navigate') {
    // 認証画面も「圏外なら offline.html」だけは出す。控えは置かない。
    // クエリ付き（?page=2 など）は件数が膨らむので控えない。
    event.respondWith(handleNavigate(request, url, !auth && url.search === ''));
    return;
  }

  if (auth) return;

  // RSC（クライアント遷移時の部分応答）はネットワークに任せる。
  if (request.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) return;

  // ビルドごとにファイル名が変わるので、一度取れば中身は変わらない。
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStatic(request));
    return;
  }

  // アイコン類。名前は変わらないが、差し替えても VERSION を上げれば入れ替わる。
  if (/^\/(icon-[\w-]+\.(png|webp)|favicon\.ico|apple-icon\.png|icon\.png|garuchan\.webp)$/.test(url.pathname)) {
    event.respondWith(handleStatic(request));
    return;
  }

  // それ以外（manifest、/images など）はブラウザ既定のまま。
});
