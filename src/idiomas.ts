// Idiomas do Modo 1: o Claude escreve o roteiro direto no idioma, a voz neural (edge-tts) lê nele e a Wikipédia daquele idioma
// é usada para achar as fotos. Só idiomas de alfabeto latino por enquanto (as fontes do vídeo cobrem esses).
export type Idioma = { id: string; nome: string; wiki: string; vozes: [string, string][] };

export const IDIOMAS: Idioma[] = [
  { id: "pt-BR", nome: "Português (Brasil)", wiki: "pt", vozes: [["pt-BR-AntonioNeural", "Antonio (grave)"], ["pt-BR-FranciscaNeural", "Francisca"], ["pt-BR-ThalitaMultilingualNeural", "Thalita"]] },
  { id: "en-US", nome: "English", wiki: "en", vozes: [["en-US-AndrewMultilingualNeural", "Andrew"], ["en-US-ChristopherNeural", "Christopher"], ["en-GB-RyanNeural", "Ryan (UK)"], ["en-US-AriaNeural", "Aria"]] },
  { id: "es-ES", nome: "Español", wiki: "es", vozes: [["es-ES-AlvaroNeural", "Álvaro"], ["es-ES-ElviraNeural", "Elvira"], ["es-MX-JorgeNeural", "Jorge (México)"], ["es-MX-DaliaNeural", "Dalia (México)"]] },
  { id: "fr-FR", nome: "Français", wiki: "fr", vozes: [["fr-FR-HenriNeural", "Henri"], ["fr-FR-DeniseNeural", "Denise"]] },
  { id: "de-DE", nome: "Deutsch", wiki: "de", vozes: [["de-DE-ConradNeural", "Conrad"], ["de-DE-KatjaNeural", "Katja"]] },
  { id: "it-IT", nome: "Italiano", wiki: "it", vozes: [["it-IT-DiegoNeural", "Diego"], ["it-IT-ElsaNeural", "Elsa"]] },
];

export const idiomaDe = (id?: string): Idioma => IDIOMAS.find((i) => i.id === id) ?? IDIOMAS[0];
