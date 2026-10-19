import { Composition } from "remotion";
import { Video } from "./Video";
import { NARRACAO } from "./dados";
import "./tema";

// O mesmo vídeo em dois formatos: cada cena reorganiza o layout conforme a proporção da tela.
export const Root = () => (
  <>
    <Composition id="ReelsPromo" component={Video} durationInFrames={NARRACAO.total} fps={NARRACAO.fps} width={1920} height={1080} />
    <Composition id="ReelsPromoVertical" component={Video} durationInFrames={NARRACAO.total} fps={NARRACAO.fps} width={1080} height={1920} />
  </>
);
