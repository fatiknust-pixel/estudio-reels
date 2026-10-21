// Service worker do Framecraft: deixa o app abrir offline e rápido.
// - Página: rede primeiro (pega a versão nova), cache se offline.
// - Arquivos com hash (assets/), fontes e sons: cache primeiro.
// - GitHub (api/uploads) nunca passa pelo cache.
const CACHE = "estudio-reels-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./manifest.webmanifest", "./icones/icone.svg"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.headers.has("range")) return; // vídeo/áudio com range: deixa o navegador cuidar

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req, { cache: "no-cache" }) // ignora o cache HTTP (Pages guarda 10 min) para ver a versão nova na hora
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put("./", copia));
          return r;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }

  if (/\/(assets|fonts|sfx|icones)\//.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((r) => {
            if (r.ok) {
              const copia = r.clone();
              caches.open(CACHE).then((c) => c.put(req, copia));
            }
            return r;
          })
      )
    );
  }
});
