# Rastreador de máquinas — protótipo

Uma etiqueta Bluetooth para colar na parafusadeira e uma página web que funciona como app no celular:

- **Distância estimada** e medidor **quente/frio** (com bipe e vibração que aceleram quando você chega perto).
- **🔔 Tocar:** a etiqueta apita e pisca o LED por até 20 s. Para pelo app ou pelo botão BOOT da placa.
- **Seta (experimental):** você gira 360° com o celular deitado na frente do peito. O seu corpo bloqueia o
  sinal que vem de trás, e o app aponta para o lado onde o sinal foi mais forte. É menos precisa que a seta
  do AirTag, que usa UWB; ver "Próximos passos".

```
[ESP32-C3 + buzzer]  ── Bluetooth ──▶  [Celular: página web]
  anuncia "MAQ-001"                      conecta, recebe o sinal (RSSI) 4×/s,
  mede o sinal da ligação                mostra distância, quente/frio e seta,
  apita quando mandam                    manda "tocar" / "parar"
```

## 1. Peças (≈ R$ 40–70)

| Peça | Observação |
|---|---|
| **ESP32-C3 SuperMini** | ~R$ 20–35 (Mercado Livre, AliExpress, lojas de eletrônica). Já tem LED e botão BOOT. |
| **Módulo buzzer ativo 3,3–5 V** (com transistor, 3 pinos: VCC, GND, I/O) | ~R$ 5–10. "Ativo" = apita sozinho quando recebe energia. |
| Cabo USB-C | Para gravar e alimentar. |
| Power bank pequeno **ou** bateria LiPo 3,7 V + módulo carregador TP4056 | Para deixar a etiqueta solta pela casa. |
| Jumpers fêmea-fêmea | Para ligar o buzzer sem solda. |

> Um buzzer sem módulo, ligado direto no pino, também funciona por pouco tempo, mas puxa corrente demais do
> ESP32. Prefira o módulo ou um transistor (BC547/2N2222 + resistor de 1 kΩ na base).

## 2. Ligações

| Módulo buzzer | ESP32-C3 SuperMini |
|---|---|
| VCC | 3V3 |
| GND | GND |
| I/O (ou S) | **GPIO 4** |

Se o buzzer **apitar sem parar** assim que ligar, o módulo aciona com nível baixo: no firmware, troque
`BUZZER_ATIVO_EM_ALTO = true` para `false`.

## 3. Gravar o firmware

1. Instale a **Arduino IDE 2**.
2. *Arquivo → Preferências → URLs adicionais*:
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
3. *Ferramentas → Placa → Gerenciador de placas*: instale **esp32** (Espressif), versão 3.x.
4. Abra `firmware/etiqueta/etiqueta.ino`.
5. *Ferramentas*: Placa **ESP32C3 Dev Module**, **USB CDC On Boot: Enabled**, e a porta da placa.
6. Clique em **Carregar**. Se não gravar, segure **BOOT**, aperte e solte **RESET** e solte **BOOT**; depois
   tente de novo.
7. Ao ligar, o LED azul pisca 2 vezes. No Monitor Serial (115200) aparece `Etiqueta MAQ-001 pronta`.

Para mais de uma máquina, mude `NOME_MAQUINA` antes de gravar cada etiqueta.

## 4. Abrir o app no celular

A página precisa estar em **https** (é uma exigência do Bluetooth web). Como o repositório é público, dá para
abrir direto por este endereço:

`https://raw.githack.com/fatiknust-pixel/estudio-reels/claude/rastreador-prototipo/rastreador/app/index.html`

- **Android:** abra no **Chrome**. Ative o Bluetooth e a **Localização** (o Android pede localização para
  procurar aparelhos Bluetooth).
- **iPhone (inclusive SE):** o Safari não tem Bluetooth web. Instale o app gratuito **Bluefy** e abra o
  endereço nele. A bússola da seta pede permissão de "Movimento e orientação".

Dica: no Chrome, use *⋮ → Adicionar à tela inicial* para abrir como um app.

## 5. Testar

1. Ligue a etiqueta e toque em **Procurar** → escolha **MAQ-001**.
2. **Calibre:** fique a 1 metro da etiqueta e toque em **📏 Estou a 1 metro**. Isso melhora a estimativa de
   distância do seu celular.
3. Esconda a etiqueta em outro cômodo, ligue o **bipe de proximidade** e ande até ela: o bipe acelera e a
   barra vai de azul para vermelho.
4. Perto, toque em **🔔 Tocar** para ouvir onde ela está.
5. **Seta:** a uns 5–15 m, segure o celular deitado colado ao peito, toque em **↻ Girar** e dê uma volta
   inteira devagar (~20 s). A seta aparece e acompanha o giro do celular. Ande alguns metros e gire de novo
   para corrigir.

### O que esperar (honestamente)
- A distância por força de sinal **varia bastante**: paredes, metal e o próprio corpo mudam a leitura em
  vários dB. Use como "mais perto / mais longe", não como trena.
- A seta funciona melhor em espaço aberto, a média distância. Muito perto (< 2 m) o sinal é forte em todas
  as direções e a confiança fica baixa; aí use o apito.
- O alcance em casa costuma ser de 10–30 m, dependendo das paredes.

## Arquivos

| Arquivo | O quê |
|---|---|
| `firmware/etiqueta/etiqueta.ino` | Firmware da etiqueta (ESP32-C3, Arduino). |
| `app/index.html` | App web (página única, sem instalação). |
| `../.github/workflows/rastreador-firmware.yml` | Compila o firmware no GitHub a cada mudança (artefato `.bin`). |

## Próximos passos (versão para os galpões)
1. **Pilha:** trocar o ESP32-C3 por um chip Nordic nRF52 (consome ~100× menos) para durar 1–2 anos numa CR2032.
2. **8 receptores ESP32** nos galpões + servidor + painel: "MAQ-147 está no Galpão 3, visto há 2 min".
3. **Seta de verdade:** etiqueta com UWB (ex.: Qorvo DWM3001C) e celular Android com UWB (Galaxy S Ultra,
   Pixel Pro). Mede distância e ângulo, como o AirTag.
