// Etiqueta de rastreio — protótipo (ESP32-C3 SuperMini)
//
// O que faz:
//  - Anuncia pelo Bluetooth (BLE) com o nome da máquina, para o celular achar.
//  - Quando o celular conecta, mede a força do sinal (RSSI) da ligação e manda para o app
//    3–4 vezes por segundo. O app usa isso no medidor quente/frio e na seta experimental.
//  - Comando "tocar": apita o buzzer e pisca o LED por até 20 s (ou até o celular mandar parar,
//    ou alguém apertar o botão BOOT da placa).
//
// Placa: ESP32-C3 SuperMini (Arduino IDE, núcleo "esp32" da Espressif 3.x, placa "ESP32C3 Dev Module",
// "USB CDC On Boot: Enabled"). Ligações em rastreador/README.md.

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
// O núcleo 3.x usa Bluedroid ou NimBLE conforme o chip (no ESP32-C3 do núcleo 3.3, NimBLE).
// Só a leitura do sinal (RSSI) muda entre os dois.
#if defined(CONFIG_BLUEDROID_ENABLED)
#include <esp_gap_ble_api.h>
#else
#include <host/ble_gap.h>
#endif

// ---------- Ajuste por máquina ----------
const char* NOME_MAQUINA = "MAQ-001";   // aparece no app; troque em cada etiqueta

// ---------- Pinos ----------
const int PINO_BUZZER = 4;              // buzzer ativo (de preferência por um transistor ou módulo)
const bool BUZZER_ATIVO_EM_ALTO = true; // módulo que liga com nível baixo? mude para false
const int PINO_LED = 8;                 // LED azul da própria SuperMini (acende com nível baixo)
const bool LED_ATIVO_EM_ALTO = false;
const int PINO_BOTAO = 9;               // botão BOOT da placa: para o alarme

// ---------- Protocolo (o app usa os mesmos UUIDs) ----------
#define UUID_SERVICO "7a1e0001-5c3b-4e8a-9d2f-6b0c8a4f1e01"
#define UUID_COMANDO "7a1e0002-5c3b-4e8a-9d2f-6b0c8a4f1e01"  // escrita: 0x01 tocar, 0x00 parar
#define UUID_ESTADO  "7a1e0003-5c3b-4e8a-9d2f-6b0c8a4f1e01"  // notificação: [rssi int8, flags] (bit0 = tocando)

const uint32_t DURACAO_ALARME_MS = 20000;
const uint32_t INTERVALO_RSSI_MS = 250;

BLECharacteristic* caracEstado = nullptr;
volatile bool conectado = false;
#if defined(CONFIG_BLUEDROID_ENABLED)
esp_bd_addr_t enderecoCelular;
#else
volatile uint16_t conexaoCelular = 0;
#endif
volatile int8_t ultimoRssi = 0;
volatile bool rssiNovo = false;
volatile bool pedidoTocar = false;
volatile bool pedidoParar = false;

bool tocando = false;
uint32_t inicioAlarme = 0;

void saida(int pino, bool ativoEmAlto, bool ligado) {
  digitalWrite(pino, (ligado == ativoEmAlto) ? HIGH : LOW);
}

#if defined(CONFIG_BLUEDROID_ENABLED)
// Bluedroid: a resposta do pedido de RSSI (esp_ble_gap_read_rssi) chega por aqui.
void tratarGap(esp_gap_ble_cb_event_t evento, esp_ble_gap_cb_param_t* p) {
  if (evento == ESP_GAP_BLE_READ_RSSI_COMPLETE_EVT && p->read_rssi_cmpl.status == ESP_BT_STATUS_SUCCESS) {
    ultimoRssi = p->read_rssi_cmpl.rssi;
    rssiNovo = true;
  }
}
#endif

void pedirRssi() {
#if defined(CONFIG_BLUEDROID_ENABLED)
  esp_ble_gap_read_rssi(enderecoCelular);
#else
  int8_t rssi;
  if (ble_gap_conn_rssi(conexaoCelular, &rssi) == 0) { ultimoRssi = rssi; rssiNovo = true; }
#endif
}

class Conexao : public BLEServerCallbacks {
#if defined(CONFIG_BLUEDROID_ENABLED)
  void onConnect(BLEServer* s, esp_ble_gatts_cb_param_t* param) override {
    memcpy(enderecoCelular, param->connect.remote_bda, sizeof(esp_bd_addr_t));
    conectado = true;
  }
#else
  void onConnect(BLEServer* s, ble_gap_conn_desc* desc) override {
    conexaoCelular = desc->conn_handle;
    conectado = true;
  }
#endif
  void onDisconnect(BLEServer* s) override {
    conectado = false;
    BLEDevice::startAdvertising();  // volta a aparecer para o próximo celular
  }
};

class Comando : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) override {
    if (c->getLength() < 1) return;
    if (c->getData()[0] == 0x01) pedidoTocar = true;
    else pedidoParar = true;
  }
};

void enviarEstado() {
  if (!conectado || !caracEstado) return;
  uint8_t dados[2] = { (uint8_t)ultimoRssi, (uint8_t)(tocando ? 1 : 0) };
  caracEstado->setValue(dados, sizeof(dados));
  caracEstado->notify();
}

void pararAlarme() {
  tocando = false;
  saida(PINO_BUZZER, BUZZER_ATIVO_EM_ALTO, false);
  saida(PINO_LED, LED_ATIVO_EM_ALTO, false);
  enviarEstado();
}

void setup() {
  Serial.begin(115200);
  pinMode(PINO_BUZZER, OUTPUT);
  pinMode(PINO_LED, OUTPUT);
  pinMode(PINO_BOTAO, INPUT_PULLUP);
  saida(PINO_BUZZER, BUZZER_ATIVO_EM_ALTO, false);
  saida(PINO_LED, LED_ATIVO_EM_ALTO, false);

  BLEDevice::init(NOME_MAQUINA);
#if defined(CONFIG_BLUEDROID_ENABLED)
  BLEDevice::setCustomGapHandler(tratarGap);
#endif

  BLEServer* servidor = BLEDevice::createServer();
  servidor->setCallbacks(new Conexao());

  BLEService* servico = servidor->createService(UUID_SERVICO);
  BLECharacteristic* caracComando = servico->createCharacteristic(
      UUID_COMANDO, BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  caracComando->setCallbacks(new Comando());
  caracEstado = servico->createCharacteristic(
      UUID_ESTADO, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
#if defined(CONFIG_BLUEDROID_ENABLED)
  caracEstado->addDescriptor(new BLE2902());  // no NimBLE esse descritor é criado sozinho
#endif
  servico->start();

  BLEAdvertising* anuncio = BLEDevice::getAdvertising();
  anuncio->addServiceUUID(UUID_SERVICO);
  anuncio->setScanResponse(true);  // o nome vai na resposta (o UUID de 128 bits ocupa o anúncio)
  BLEDevice::startAdvertising();

  // Duas piscadas: ligou.
  for (int i = 0; i < 2; i++) {
    saida(PINO_LED, LED_ATIVO_EM_ALTO, true); delay(120);
    saida(PINO_LED, LED_ATIVO_EM_ALTO, false); delay(120);
  }
  Serial.printf("Etiqueta %s pronta\n", NOME_MAQUINA);
}

void loop() {
  uint32_t agora = millis();

  if (pedidoTocar) {
    pedidoTocar = false;
    tocando = true;
    inicioAlarme = agora;
    enviarEstado();
  }
  if (pedidoParar || (tocando && digitalRead(PINO_BOTAO) == LOW) ||
      (tocando && agora - inicioAlarme > DURACAO_ALARME_MS)) {
    pedidoParar = false;
    if (tocando) pararAlarme();
  }

  // Bipe intermitente: 200 ms ligado / 200 ms desligado.
  if (tocando) {
    bool fase = ((agora - inicioAlarme) / 200) % 2 == 0;
    saida(PINO_BUZZER, BUZZER_ATIVO_EM_ALTO, fase);
    saida(PINO_LED, LED_ATIVO_EM_ALTO, fase);
  }

  // Mede o sinal da ligação com o celular e manda para o app.
  static uint32_t ultimaLeitura = 0;
  if (conectado && agora - ultimaLeitura >= INTERVALO_RSSI_MS) {
    ultimaLeitura = agora;
    pedirRssi();
  }
  if (rssiNovo) {
    rssiNovo = false;
    enviarEstado();
  }

  delay(10);
}
