# Radio and positioning technologies in item trackers: BLE, UWB, Bluetooth Channel Sounding, NFC

Research limits: WebFetch failed with DNS errors for every host (bluetooth.com, novelbits, eetimes, hubble), so only search-result snippets were available. No primary spec (Bluetooth SIG, IEEE 802.15.4z, Apple Find My accessory spec) could be opened. Unsourced background knowledge is deliberately kept out of the Cited Findings and is listed under Gaps/Inferences as "to verify".

## BLE advertising, RSSI proximity, energy budget on a CR2032

### Takeaway
Legacy BLE advertising sends tiny (max 31 byte) packets on channels 37/38/39 at a fixed interval; battery life is basically capacity divided by average current, so longer intervals buy proportionally longer life. RSSI is a poor ranging signal beyond a few metres because of multipath, body shadowing and sampling bias.

### Cited Findings
- Legacy advertising uses channels 37-39; the advertiser sends on all three in turn, then waits for the next interval. Legacy payload is limited to 31 bytes; Bluetooth 5 extended advertising allows up to 1650 bytes using secondary channels 0-36 — [Espressif ESP-IDF BLE device discovery](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/ble/get-started/ble-device-discovery.html)
- Battery life = battery capacity / average current; a 10x longer advertising interval gives roughly 10x battery life (nRF52832 example, not AirTag) — [Hubble BLE interval vs battery guide](https://hubble.com/community/guides/ble-advertising-interval-vs-battery-life-how-to-model-the-tradeoff-before-you-build/) (snippet only)
- Apple rates AirTag at about one year, defined as roughly four sound alerts and one Precision Finding search per day — [AirTag battery life summary results](https://airpinpoint.com/en/blog/airtag-battery-life-guide) (third-party restatement of Apple's claim)
- A battery-testing vendor claims AirTags broadcast about every 1.5 s, with spikes of several mA and microamp sleep current; this is a vendor claim, not an Apple spec — [Airpinpoint](https://airpinpoint.com/en/solutions/airtag-battery-life-data)
- A vendor test of 8 CR2032 brands found a 2.5x difference in life between best and worst — [Eufy](https://www.eufy.com/blogs/smart-tracker/how-long-does-airtag-battery-life-last) (vendor claim, as reported in search summary)
- RSSI errors: multipath adds constructive/destructive combining that depends on environment, not distance; human tissue can attenuate by 19.2 dB (chest to back); at a few metres mean RSSI stops tracking distance; packet loss ~10% at 1 m LOS and ~50% at 3 m — [Identifying the BLE Advertising Channel for Reliable Distance Estimation on Smartphones (arXiv)](https://arxiv.org/pdf/2006.09099)
- ESP32 study: reliable within 4 m with <25% error in LOS; beyond 5 m RSSI fluctuated and overestimated; concluded RSSI alone is unreliable for precise tracking — [CEUR-WS paper](https://ceur-ws.org/Vol-3248/paper15.pdf) (as summarized by search)
- Kalman filtering corrected distance error by 27.48% in an obstacle-rich environment — search result summary of [Indonesian journal paper](https://journals2.ums.ac.id/index.php/emitor/article/view/2355)
- Bayesian filtering is another mitigation — [Improving BLE Beacon Proximity Estimation through Bayesian Filtering](https://arxiv.org/pdf/2001.02396)
- Nordic nRF52832/33/40 are supported for Apple Find My network accessories; Find My uses BLE broadcasts picked up by nearby Apple devices — [Nordic Find My network](https://www.nordicsemi.com/Products/Find-My-network)

### Inferences
- With ~1.5 s interval and CR2032 (nominal ~225-240 mAh, unsourced), a ~1 year life implies an average current in the low tens of microamps; this is arithmetic, not a measured figure.

### Gaps
- Not verified from sources: legacy interval range 20 ms-10.24 s (believed from the Core Spec), BLE TX power range (typically about -20 to +8 dBm), and typical range figures (tens of metres). Writer should treat as unverified.
- Apple's actual Find My advertising interval and TX power are in MFi-gated spec; not found.
- CR2032 chemistry (Li-MnO2, 3 V), capacity and pulse-current limits not sourced.
- Motion sensor (accelerometer) power saving in trackers: no source found.

## UWB ranging, angle of arrival, Apple Precision Finding

### Takeaway
UWB (IEEE 802.15.4z HRP) measures time of flight with two-way ranging and gets direction from phase difference across phone antennas, giving centimetre-class accuracy. Apple Precision Finding is described by third parties as fusing UWB with camera/ARKit and motion sensors; Apple's own pipeline details were not found.

### Cited Findings
- 802.15.4z HRP UWB PHY has three bands: one 499 MHz sub-GHz channel, four mid-band channels (3.1-4.8 GHz), eleven high-band channels (6.0-10.6 GHz) — [Microwave Journal](https://microwavejournal.com/articles/print/36765-uwb-reloaded-test-and-certification-of-uwb-devices-according-to-ieee802154z) / [MathWorks 802.15.4z example](https://www.mathworks.com/help/comm/ug/uwb-ranging-using-ieee-802.15.4z.html) (as surfaced in search)
- 802.15.4z adds integrity and accuracy via scrambled timestamp sequence (STS), a ciphered sequence known only to the two ranging devices — [Samsung patent text, USPTO](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11454714)
- DS-TWR: both devices estimate distance using frames in both directions, cancelling clock offsets — [MathWorks](https://www.mathworks.com/help/comm/ug/uwb-ranging-using-ieee-802.15.4z.html)
- Smartphone UWB study: all tested devices used 62.40 MHz PRF — [Smartphones with UWB: accuracy and reliability (arXiv 2303.11220)](https://arxiv.org/pdf/2303.11220)
- AoA is computed from signal/phase differences between antenna pairs, depending on antenna spacing — [Airpinpoint UWB glossary](https://airpinpoint.com/en/glossary/uwb)
- Precision Finding reportedly fuses UWB with camera, ARKit, accelerometer and gyroscope, with sound/haptic/visual guidance (third-party claim) — [Nocturnal Cloud](https://www.nocturnalcloud.com/what-is-precision-finding-on-apple-airtags-and-how-does-it-work/)
- Apple patent application covers factoring user motion into AoA estimates (patent, not confirmation of shipping) — [USPTO 12085657](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12085657)
- Apple Nearby Interaction Accessory Protocol Spec defines UWB session setup between accessory and Apple device; Find My and Nearby Interaction are separate frameworks — [Apple Developer Forums](https://developer.apple.com/forums/thread/766556)
- Apple announced a UWB draft spec for chipset makers for U1 devices, with "Works with Apple Find My" badge and MFi requirement — [XDA](https://www.xda-developers.com/apple-expands-find-my-network-to-third-party-companies/)
- 2026 UWB trackers include AirTag 2nd gen, Motorola Moto Tag 2, Xiaomi Tag, ChangHong NeoTag — teardown referenced in [Novel Bits](https://newsletter.novelbits.io/archive/channel-sounding-lands-in-a-29-tracker/) (search summary)

### Inferences
- Channels 5 and 9 both lie in the 6-10.6 GHz high band; centre frequencies (6.5 and 8.0 GHz) and 500 MHz bandwidth come from background knowledge, not sources.

### Gaps
- No per-channel or per-device accuracy figures (centimetre accuracy claim unsourced beyond a vague "few centimeters").
- FiRa Consortium, Apple U1/U2, NXP/Qorvo chip details, UWB TX power limit (-41.3 dBm/MHz) and UWB energy per ranging not found.
- Apple's fusion pipeline not documented in found sources.

## Bluetooth Channel Sounding (Bluetooth 6.0+) and device support

### Takeaway
Channel Sounding combines phase-based ranging (PBR, primary) with round-trip time (RTT, security cross-check) on ordinary 2.4 GHz radios. By mid-2026 it is arriving in consumer products (Pixel Tag, iPhone 17 via iOS 27), but vendor accuracy claims vary widely (10-50 cm up to 0.3-1 m).

### Cited Findings
- Per Bluetooth SIG (via EE Times), PBR is the primary accurate method, RTT secondary — [EE Times](https://www.eetimes.eu/?p=38852)
- PBR measures phase across up to 72 channels; PBR and RTT can be used independently or together; RTT acts as secure distance bounding to cross-check PBR; up to 4 antenna paths can improve estimate; accuracy target 0.3-1 m — [u-blox](https://www.u-blox.com/en/technologies/bluetooth-channel-sounding)
- RTT mitigates man-in-the-middle distance manipulation — [TI SWRA791](https://ti.com/lit/swra791)
- Claimed 10-50 cm typical, centimetre-level — [Minew](https://www.minew.com/bluetooth-channel-sounding-overview/); about ±50 cm — [Feasycom](https://www.feasycom.com/ms/bluetooth-ble-module-vehicle-key-channel-sounding-application/) (marketing sources, conflicting)
- Implementation needs tight RF timing, antenna switching, sampling and calibration — [CSEM report](https://yoda.csem.ch/server/api/core/bitstreams/a0886d12-673b-4eff-91af-2bbe92248404/content)
- Google Pixel Tag announced 12 Aug 2026, $29 (or $99 for 4), on shelves 11 Nov; uses Channel Sounding alongside UWB — [Novel Bits](https://newsletter.novelbits.io/archive/channel-sounding-lands-in-a-29-tracker/) (search summary)
- iOS 27 adds Channel Sounding for third-party accessories; accessory must support Bluetooth 6.3; only iPhone 17 line (N1 chip) supports it; few 6.3 accessories exist — [Novel Bits](https://newsletter.novelbits.io/archive/ios-27-brings-channel-sounding-to-the-iphone/), [Apple NIDeviceCapability docs](https://developer.apple.com/documentation/nearbyinteraction/nidevicecapability/supportsbluetoothchannelsounding.md), [TechBuzz](https://techbuzz.ai/articles/apple-s-ios-27-adds-bluetooth-6-3-tracking-with-a-catch)
- Android 16 has Channel Sounding ranging API; Pixel 10 officially supports it (Silicon Labs slide) — [Silicon Labs presentation](https://www.silabs.com/documents/login/presentations/tech-talks-apac-bluetooth-channel-sounding-performance-and-applications-korean.pdf); Pixel Watch 3 gained support in 2025 — [Notebookcheck](https://www.notebookcheck.com/Google-Pixel-Watch-3-erhaelt-ueberraschend-Support-fuer-Bluetooth-6-0-Channel-Sounding.1046340.0.html)

### Inferences
- Channel Sounding looks aimed at cheap trackers without UWB, but both flagship trackers found still pair it with UWB.

### Gaps
- Spec-level numbers (2.4 GHz 1 MHz steps, RTT timing resolution, energy cost) not retrieved. Independent accuracy measurements not found. Samsung/other phone support unconfirmed.

## NFC and finder-phone geolocation

### Takeaway
NFC is a passive, short-range (few cm) way for a finder to read an owner's Lost Mode message from any NFC phone; the tag's location on the map is simply the location of a crowdsourced finder phone, so the error is the finder's own fix plus BLE range.

### Cited Findings
- Owner enables Lost Mode with phone number; a finder taps an NFC phone on the tag and gets a URL with message and phone number (also serial number) — [MacRumors](https://macrumors.com/how-to/airtag-lost-mode), [AppleInsider](https://appleinsider.com/articles/21/04/21/android-users-can-read-an-airtags-lost-mode-message-via-nfc); contradicted by [ForestVPN](https://forestvpn.com/en/blog/technology/how-to-identify-and-return-a-found-airtag/) claiming only the last four digits show
- Apple: Lost Mode message viewable on any NFC-capable phone including Android — [AppleInsider](https://appleinsider.com/articles/21/04/21/android-users-can-read-an-airtags-lost-mode-message-via-nfc)
- If no Apple device is nearby, Find My shows only the last-seen location; otherwise location is relayed by others' devices through the Find My network — [MacRumors](https://macrumors.com/how-to/airtag-lost-mode)

### Inferences
- Reported tag position = finder phone's GPS/Wi-Fi/cell fix at the time of the BLE sighting, so accuracy is the phone's fix plus up to the BLE range (tens of metres, unsourced).

### Gaps
- NFC frequency (13.56 MHz) and passive operation are background knowledge, not sourced. Encryption/rotating-key details of finder reports, and GPS/Wi-Fi/cell accuracy numbers not researched.
