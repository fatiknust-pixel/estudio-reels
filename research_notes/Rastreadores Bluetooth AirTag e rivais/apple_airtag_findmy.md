# Apple AirTag (1st and 2nd generation) and the Find My offline-finding protocol

Research caveat: WebFetch could not resolve any host in this environment (DNS errors), so all findings come from WebSearch result summaries, not full-page reads. Primary documents (Apple Platform Security Guide, the Heinrich et al. PDF, iFixit pages) were located but not read in full. Items I recall from training but could not source are listed under Gaps and must not be treated as confirmed.

## AirTag hardware: 1st gen vs 2nd gen

### Takeaway
Gen 1 (announced 20 Apr 2021) pairs a Nordic nRF52832 BLE/NFC SoC with Apple's U1 UWB chip. Gen 2 (announced 26 Jan 2026) keeps the same outer design, CR2032 cell and price, but moves to a Nordic nRF52840 (Bluetooth 5.4 per MacRumors), Apple's U2 UWB chip, a larger and louder speaker and a thinner main PCB.

### Cited Findings
**Generation 1**
- Announced 20 April 2021, available 30 April 2021, $29 single / $99 four-pack — [Wikipedia: AirTag](https://en.wikipedia.org/wiki/AirTag); [MacRumors](https://www.macrumors.com/2021/04/20/airtag-water-rating-battery-life/)
- IP67 under IEC 60529 (max 1 m depth, up to 30 minutes), per Apple's tech specs; resistance may decrease with wear — [Apple Support: AirTag Tech Specs](https://support.apple.com/en-us/111847)
- User-replaceable CR2032 coin cell; Apple claimed more than a year of battery life — [MacRumors](https://www.macrumors.com/2021/04/20/airtag-water-rating-battery-life/)
- Teardown chips: Apple U1 UWB, Nordic nRF52832 BLE SoC (with NFC), 32 MHz and 32.768 kHz crystals, GigaDevice GD25LE32D 32 Mbit serial NOR flash — [EDN teardown](https://www.edn.com/teardown-apple-airtag/); [AppleInsider on iFixit/X-ray](https://appleinsider.com/articles/21/05/02/x-rays-show-how-apple-tightly-packed-airtags-internals)
- iFixit/AppleInsider: layered board with comms silicon, accelerometer, power-delivery chips and a large coiled antenna — [AppleInsider](https://appleinsider.com/articles/21/05/02/x-rays-show-how-apple-tightly-packed-airtags-internals)
- Reverse-engineering notes: nRF52832 has Access Port Protection enabled (blocks SWD debug/flash read); external flash reported unencrypted — [Adam Catley](https://adamcatley.com/AirTag.html); [Colin O'Flynn test-point mapping](https://colinoflynn.com/2021/05/apple-airtag-teardown-test-point-mapping/) suggests the nRF chip is likely vulnerable to a known bypass (as reported there)
- Model number A2187; serial number readable under the battery (10 or 12 digits) — [Apple Support](https://support.apple.com/en-us/102170) (via search summary)
- Nordic lists nRF52832, nRF52833, nRF52840 and nRF54L15 as supported by its Find My sample in nRF Connect SDK — [Nordic: Apple Find My network](https://www.nordicsemi.com/Products/Technologies/Apple-Find-My-network)

**Generation 2**
- Announced 26 January 2026; model A2937; requires iOS/watchOS 26.2.1 or later; $29 / $99 — [Apple Newsroom](https://www.apple.com/newsroom/2026/01/apple-introduces-new-airtag-with-expanded-range-and-improved-findability/); [Apple Support: Tech Specs (2nd gen)](https://support.apple.com/en-us/126203); [9to5Mac](https://9to5mac.com/2026/01/26/apple-launches-airtag-2-with-improved-range-louder-speaker-more/)
- Second-generation UWB chip (same family as iPhone 17 lineup, iPhone Air, Apple Watch Ultra 3 / Series 11; called U2 by press); Precision Finding from up to 50% farther than gen 1; "upgraded Bluetooth chip" with longer Bluetooth range — [Apple Newsroom](https://www.apple.com/newsroom/2026/01/apple-introduces-new-airtag-with-expanded-range-and-improved-findability/)
- Speaker up to 50% louder (Apple claim) — [Mac Observer](https://www.macobserver.com/news/ifixit-airtag-2-teardown-reveals-louder-speaker-and-new-uwb-chip/)
- Teardown: Bluetooth/NFC SoC is the Nordic nRF52840 (Bluetooth 5.4 per MacRumors) which also runs the firmware; also a Bosch accelerometer and an SPI memory part (probably EEPROM) — [Hackaday, 2 Feb 2026](https://hackaday.com/2026/02/02/teardown-of-an-apple-airtag-2-with-die-shots/); [MacRumors via search](https://forums.macrumors.com/threads/teardown-reveals-airtag-2-is-full-of-hidden-changes.2476785/page-2); [TechEBlog](https://www.techeblog.com/apple-airtag-2-teardown/)
- iFixit: new larger speaker mechanism centered in chassis, connected to the board by two fine wires; magnet glued/more firmly secured, but chime still silenced with a soldering iron and the tag keeps working; main PCB visibly thinner; dimensions and lid lock unchanged; CR2032 user-replaceable — [MacRumors](https://www.macrumors.com/2026/02/05/ifixit-shares-airtag-2-teardown/); [iClarified](https://www.iclarified.com/99849/ifixit-teardown-reveals-airtag-2-speaker-can-still-be-disabled-video); [9to5Mac](https://9to5mac.com/2026/01/28/airtag-2-teardown-reveals-the-speaker-is-now-harder-to-remove/)
- Weight 0.42 oz / 11.8 g — [MacRumors](https://www.macrumors.com/2026/01/26/10-things-to-know-about-the-new-airtag-2/)
- Precision Finding now works on Apple Watch (Series 9 / Ultra 2 or later); original was iPhone-only; improved Precision Finding needs iPhone 15 or newer — [MacRumors buyer's guide](https://www.macrumors.com/guide/airtag-1-vs-airtag-2/); [TechCrunch via search](https://techcrunch.com/?p=3085962); [9to5Mac](https://9to5mac.com/2026/02/05/ifixit-tears-down-new-airtag-finds-50-louder-speaker-still-100-easy-to-disable/)
- Independent measurements, conflicting: Macworld measured about 40% wider Precision Finding range — [Macworld](https://www.macworld.com/article/3049223/apple-airtag-2nd-gen-review.html); Airpinpoint (commercial blog, outlier) claims ~15 m to ~60 m and speaker ~85-87 dB vs ~66 dB — [Airpinpoint](https://airpinpoint.com/blog/airtag-two). Apple publishes no meter figure for either.

### Inferences
- Gen 1 nRF52832 (Cortex-M4F, per Nordic generally) to gen 2 nRF52840 is a larger-memory upgrade consistent with the "Bluetooth 5.4" and extended-range claims, but Apple's claimed range gain is unquantified.
- Apple's "50% farther" UWB claim is a relative figure; the 15-to-60 m number should not be used.

### Gaps
- Not found/sourced: antenna design details of gen 2, exact dimensions (recalled ~31.9 mm diameter, 8.0 mm thick; not verified here), exact gen 1 weight (recalled 11 g), accelerometer part for gen 1, battery-life claim for gen 2.
- Speaker-via-case/voice-coil design for gen 1: 9to5Mac 2021 and PhoneArena teardown pages exist but their contents were not read; the "case as diaphragm" description is unverified here.
- Whether gen 2 speaker is in dB per Apple: Apple gives only "50% louder".
- Gen 2 Bluetooth range figure: Apple gives none.

## Offline-finding protocol: keys, advertisement, encryption, privacy

### Takeaway
Owner device generates a P-224 key pair plus a secret; rolling public keys derived from them are broadcast over BLE; finders encrypt their location to the broadcast key and upload it; only the owner, holding the private key, can decrypt. Apple's own statement is that it cannot see offline-device or reporter locations.

### Cited Findings
- Heinrich, Stute, Kornhuber, Hollick, PoPETs 2021(3):227-245: first security/privacy analysis of Apple's offline finding; finder devices encrypt their current location under the rolling public key and send the report to an Apple server; an owner device queries the server with the known rolling public keys — [arXiv 2103.02282](https://arxiv.org/abs/2103.02282); [PETS PDF](https://petsymposium.org/popets/2021/popets-2021-0045.pdf); [Emergencity summary](https://www.emergencity.de/news/who-can-find-my-devices/)
- Paper found the design meets its privacy goals but reported two flaws: location correlation and unauthorized access to location history of the past seven days; one (CVE-2020-9986) was fixed by Apple — [Emergencity](https://www.emergencity.de/news/who-can-find-my-devices/); [owlink.org](https://owlink.org/2021/03/04/who-can-find-my-devices.html)
- Key setup: when offline finding is enabled, an EC P-224 key pair (d, P) and a 256-bit secret are generated on-device, never sent to Apple, synced between the user's devices through end-to-end encrypted iCloud Keychain — [Whistleblowers paper, arXiv 2004.00108](https://arxiv.org/pdf/2004.00108)
- Rolling keys: d_i = u_i·d + v_i (mod curve order), P_i = u_i·P + v_i·G, where u_i, v_i come from a KDF; one source says the KDF is ANSI X9.63 with SHA-256 and the P-224 generator — [Symbolic verification, arXiv 2510.14589](https://arxiv.org/pdf/2510.14589); the older paper describes it as the NIST SP 800-56A concatenation KDF (sources differ, which is largely a naming matter; the two constructions are closely related) — [arXiv 2004.00108](https://arxiv.org/pdf/2004.00108)
- A lost device broadcasts the derived public key P_i for a limited period in a BLE payload — [arXiv 2004.00108](https://arxiv.org/pdf/2004.00108)
- Advertisement layout (from OpenHaystack code and community examples): 29-byte manufacturer data, Apple company ID 0x004C, type 0x12, length 0x19; 22 bytes of public key (key bytes 6..27) in the payload at offset 5, a hint byte from the top two bits of key byte 0 after the key, and a status byte; the first 6 key bytes go into the BLE random MAC address with the top two bits forced to 1 (so 46 bits of key are in the address) — [OpenHaystack Advertisement.swift](https://github.com/seemoo-lab/openhaystack/blob/cf5103f62fab29089c13174976cdb272d472eed5/OpenHaystack/OpenHaystack/HaystackApp/Bluetooth/Advertisement.swift); [Espruino discussion](https://forum.espruino.com/conversations/365832/); OpenHaystack repo — [GitHub](https://github.com/seemoo-lab/openhaystack)
- Apple's claim: Find My network communication is end-to-end encrypted; only the owner can access location; Apple cannot learn identity or location of helper devices — [Apple Newsroom 2021](https://www.apple.com/newsroom/2021/04/apple-introduces-airtag/); [Apple Legal: Find My & Privacy](https://www.apple.com/legal/privacy/data/en/find-my/)
- Rotation of the broadcast identifier roughly every 15 minutes is stated by a secondary source only — [Taglogger](https://taglogger.com/resources/find-my-network-how-it-works/)
- Generic SoK on offline finding protocols (PoPETs 2026) covers epoch-based key rotation; not Apple-specific — [SoK paper](https://petsymposium.org/popets/2026/popets-2026-0113.pdf)
- Independent analysis warns that the key material is shared across the owner's devices and that a lost tag could be analysed — [Adam Catley](https://adamcatley.com/AirTag.html)
- OpenHaystack (SEEMOO) lets nRF5 / ESP32 devices act as Find My tags — [Semantic Scholar entry](https://www.semanticscholar.org/paper/OpenHaystack:-a-framework-for-tracking-personal-via-Heinrich-Stute/093d490e4f5e395ef787b5ad0361b97b0a8f0873)

### Inferences
- Because the BLE address and payload together carry the full 224-bit key and the finder only needs the key (not an identity) to encrypt, a finder learns nothing about the owner; the server stores ciphertext indexed by a key-derived ID.
- Rolling-key linkability is limited to whoever holds the secret (owner devices).

### Gaps
- Recalled but unverified in this session (do not state as fact without checking the PETS paper / Apple Platform Security Guide): rotation every 15 minutes near owner vs once per day when separated (switch at about 4 am local time); keys downloaded by SHA-256 hash of the advertised key; ECIES details (ephemeral key, ANSI X9.63 KDF, AES-GCM); report contents (lat/long, accuracy, timestamp, status); the server's 7-day retention is only supported by the "past seven days" in the paper summary above.
- The Apple Platform Security Guide Find My section was not read; the hash-ID retrieval mechanism and the exact status-byte meaning are unsourced.
- Later versions (after 2021) may differ; Heinrich's follow-up "On Design and Performance of Offline Finding Network" ([ResearchGate](https://www.researchgate.net/publication/373499588_On_Design_and_Performance_of_Offline_Finding_Network)) exists but was not read.

## States, pairing, NFC lookup, Lost Mode, firmware

### Takeaway
Pairing goes through an iPhone/Apple ID; any NFC phone can tap a tag to see its serial number and partially masked owner phone number; firmware updates arrive over the air through a paired iPhone.

### Cited Findings
- NFC tap on the white side of a tag opens a web page with serial number and the last four digits of the owner's phone number; Lost Mode is not needed for this, it only adds an owner-chosen message — [9to5Mac](https://9to5mac.com/2021/05/02/how-to-find-your-airtags-serial-number-and-firmware-version/); [Apple Support](https://support.apple.com/en-us/102170) (via search summaries)
- Firmware updates delivered automatically over the air via the paired iPhone; version history: 1.0.301 (1A301) then 2.0.24 (2A24e, Nov 2022; added Precision Finding for unknown AirTags, iOS 16.2+), 2.0.73 (2A73, 19 March 2024) — [iDownloadBlog](https://www.idownloadblog.com/2022/11/11/airtag-firmware-update-version-2-0-24/); [Wikipedia](https://en.wikipedia.org/wiki/AirTag)
- Gen 1 was discontinued when gen 2 launched, per Wikipedia (not confirmed by Apple in my results) — [Wikipedia](https://en.wikipedia.org/wiki/AirTag)

### Inferences
- The tag only needs to rotate its beacon and update over the paired phone; "separated" behaviour (switch to the find-me beacon, sound alerts for unknown-tracker protection) is Apple-defined firmware logic.

### Gaps
- Separated-state timer (recalled as about 3 hours before an unknown-tracker alert, and 8-24 hours before the tag beeps) is unverified; the Apple Platform Security Guide and the Apple unwanted-tracking alert pages were not read.
- Lost Mode message flow and the "Found" Apple page (found.apple.com) mechanics were not sourced beyond the search summary above.

## Network size, accuracy and latency

### Takeaway
Apple says the Find My network comprises over a billion Apple devices; Apple publishes no latency or update interval, and third-party figures are loose estimates dependent on device density.

### Cited Findings
- "Over a billion" Apple devices — [Apple Support: Use Find My to locate...](https://support.apple.com/en-us/104978); 2021 press wording was "hundreds of millions" — [Apple Newsroom 2021](https://www.apple.com/newsroom/2021/04/apple-introduces-airtag/) (retailer wording; exact Apple wording not confirmed)
- Update frequency estimates range from 1-5 minutes (dense urban/airports) to hours or days (rural); no guaranteed interval — [Airpinpoint](https://airpinpoint.com/tech/how-find-my-network-works); [Reolink](https://reolink.com/blog/how-often-does-airtag-update-location/) (blogs; low confidence)

### Inferences
- Accuracy and latency scale with the density of reporting Apple devices; the BLE-range contact (tens of metres) limits location precision to the finder's position.

### Gaps
- No official Apple latency numbers; no peer-reviewed measurement read in this session.
- Exact Bluetooth detection range not sourced.
