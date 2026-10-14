// Os arquivos públicos (fontes, efeitos sonoros, exemplos) ficam ao lado desta página.
(window as any).__BASE_ARQUIVOS__ = "./";
import("./App");

if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
