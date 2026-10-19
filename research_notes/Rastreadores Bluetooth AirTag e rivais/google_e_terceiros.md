# Google Find Hub network and third-party tracker ecosystem (Tile, Chipolo, Pebblebee, Eufy, Moto Tag, Works with Apple Find My)

Note: WebFetch and curl were blocked (DNS/proxy 403) during this session, so all findings below come from WebSearch result summaries, not full-page reads. Several primary sources (Google spec, support pages) were seen only as search hits. Items are labelled where a primary page was only surfaced, not read.

## Google Find Hub network: launch, encryption, Fast Pair extension, aggregation, UWB, scale, accuracy

### Takeaway
Google launched the upgraded Find My Device network on 8 April 2024 (US/Canada first), using 1B+ Android 9+ devices as crowdsourced finders, with E2EE keyed to the owner's screen lock and a Fast Pair extension (FHN spec) for third-party tags. Default behavior requires multiple nearby devices before reporting, which hurt reliability in 2025 but testing in 2026 shows improvement. Renamed Find Hub in 2025; UWB arrived via Moto Tag, and Google's own Pixel Tag launched August 2026.

### Cited Findings
- Rollout began 8 April 2024 in the US and Canada, with worldwide expansion planned; third-party tags from Chipolo and Pebblebee were slated for May 2024; Eufy, Motorola and Jio tags were to follow later in 2024 — [9to5Google](https://9to5google.com/2024/04/08/find-my-device-network-launch/), [TechCrunch](https://techcrunch.com/2024/04/08/google-launches-find-my-device-network-us-canada/amp/), [PhoneArena](https://www.phonearena.com/news/googles-new-find-my-device-network-goes-live-third-party-bluetooth-tag-support-coming-in-may_id157088) (summarized via search; Android Authority [article](https://www.androidauthority.com/google-find-my-device-network-3432217/) is the source for the Eufy/Motorola/Jio list).
- Network uses "over a billion" Android 9+ devices; Pixel 8/8 Pro can be located even when powered off or battery dead, other Android 9+ devices need power — [Android Authority](https://www.androidauthority.com/google-find-my-device-network-3432217/), [Android Police](https://www.androidpolice.com/android-find-my-device-bluetooth-tracker-rollout/). Google still cites "over 1 billion Android devices" for Pixel Tag launch (Aug 2026) — [Android Central](https://www.androidcentral.com/accessories/the-pixel-tag-takes-googles-find-hub-network-to-the-next-level).
- Default aggregation: the network requires multiple nearby Android devices to detect a tag before reporting its location to the owner; works best in busier places, prioritizing anti-stalking safety — [Android Authority](https://www.androidauthority.com/google-find-my-device-network-3432217/); Android Authority's June 2025 testing attributes poor reliability to this design (a single passing device does not trigger a report) — [Android Authority](https://www.androidauthority.com/p-3647618/) (search-result summary; the article URLs are the "shipped Apple/Google/Tile trackers" test pieces).
- Encryption: Google says item locations are encrypted with a key only the owner can access by entering the Android device PIN/pattern/password, using the same technology as Google Password Manager; Google cannot identify the owners of devices that reported locations. A screen lock must be set to use the network. Link-sharing keeps locations encrypted but adds a key accessible to any signed-in Google account holder who opens the link — [Google Support: How Find Hub protects your data](https://support.google.com/android/answer/14796936?hl=en-en); [Android Authority](https://www.androidauthority.com/google-find-my-device-network-3432217/).
- Fast Pair extension: Google's "Find Hub Network Accessory Specification" (FMDN) is an extension to Fast Pair defining an E2EE approach for tracking beaconing BLE devices; location data can travel via periodic advertising or the Fast Pair message stream; unwanted-tracking prevention is core and DULT (IETF Detecting Unwanted Location Trackers) compliance is required — [Google developers spec](https://developers.google.com/nearby/fast-pair/specifications/extensions/fmdn) (seen via search snippet only; rotating Ephemeral ID details not retrieved).
- Rename: "Find My Device" became "Find Hub" in 2025 (announced May 2025; app also added UWB tag finding "Search Hub"/Find Hub) — [9to5Google, 18 May 2025](https://9to5google.com/2025/05/18/google-find-my-device-android-name-airtags/), [Gigazine](https://gigazine.net/gsc_news/en/20250514-find-my-device-into-find-hub).
- UWB: Motorola Moto Tag was the first/only Find Hub tracker with built-in UWB (per Dec 2025 and Feb 2026 reports); UWB-enabling update for Moto Tag reported around 11 Aug 2025 (Jetstream blog); Moto Tag 2 leaked Dec 2025 and expected 2026 with better battery and Find Hub tracking — [9to5Google Dec 2025](https://9to5google.com/2025/12/08/moto-tag-2-android-find-hub-tracker-leak/), [9to5Google Feb 2026](https://9to5google.com/2026/02/15/android-find-hub-trackers-uwb/), [Jetstream](https://jetstream.blog/tag/find-my-device/).
- Google Pixel Tag (first-party): launched with Pixel 11 in August 2026, $29 single / $99 four-pack, on sale 11 November; uses UWB and Bluetooth Channel Sounding (needs Android 16 and Bluetooth 6.0 phone); UWB precision finding works up to ~50 m — [Android Central](https://www.androidcentral.com/accessories/the-pixel-tag-takes-googles-find-hub-network-to-the-next-level), [9to5Google](https://9to5google.com/2026/02/15/android-find-hub-trackers-uwb/). Only Galaxy S26 series and a Z Fold model have Bluetooth 6.0, per one reviewer (single source).
- Accuracy/reliability: June 2025 Android Authority tests found Find Hub much less reliable than Apple or Samsung networks; a March 2026 European shipping test found Pebblebee on Find Hub often fresher than others, with Apple Find My lagging 7 to 41 minutes and Tile sometimes many hours — [Android Authority 2026 test](https://www.androidauthority.com/shipped-apple-google-tile-bluetooth-trackers-europe-3647618/) (search summary; single reviewer, not controlled).

### Inferences
- The multi-device threshold is a deliberate anti-stalking trade-off; improved results in 2026 likely reflect network/policy changes plus denser device counts, but I did not find Google confirming a change in the threshold.

### Gaps
- Exact Ephemeral ID rotation interval, EIK/key derivation, and Google's description of the "high-traffic areas" setting names (e.g., "All areas" vs "High-traffic areas only") could not be retrieved; direct page fetches failed. Wording "aggregated" and a user-selectable setting were not confirmed.
- Whether Google changed the aggregation default after 2025 is unconfirmed.
- Moto Tag original launch date/price not retrieved (one source says "launched in 2024"; another says "released last year" in a Feb 2026 piece, conflicting; likely 2024 announced with Android availability and UWB later).

## Apple Find My Network Accessory Program (MFi) and third-party implementation

### Takeaway
Apple opened Find My to third-party accessories in April 2021 via the MFi program; makers must be MFi licensees, pass certification, and carry the "Works with Apple Find My" badge. Third parties are limited to Bluetooth; UWB precision finding stays Apple-only.

### Cited Findings
- Program announced at WWDC 2020, launched April 2021; extension of MFi; accessories must follow Apple's E2EE design; Find My Certification Assistant app is for MFi licensees only — [AppleInsider](https://appleinsider.com/articles/21/04/07/apple-announces-find-my-network-for-third-party-accessories), [9to5Mac](https://9to5mac.com/2021/04/06/apple-launches-find-my-certification-app/).
- Launch products: VanMoof S3/X3 e-bikes, Belkin Soundform Freedom earbuds, Chipolo ONE Spot — [TechSpot](https://www.techspot.com/community/topics/apple-expands-find-my-tracking-network-to-third-party-accessories.268638/).
- Apple's own key rotation is reported at 15 minutes (reverse-engineering, not an Apple publication) — [The Hacker News](https://thehackernews.com/2021/05/apples-find-my-network-can-be-abused-to.html).
- Chips: Nordic nRF52832, nRF52833 and nRF52840 are supported by the Find My network sample in nRF Connect SDK — [Nordic](https://www.nordicsemi.com/Products/Find-My-network).
- Apple restricts UWB to its own hardware; the only route for third-party Find My trackers is Bluetooth; Pebblebee's CEO said a UWB-on-Android-only version would confuse customers — [9to5Google](https://9to5google.com/2026/02/15/android-find-hub-trackers-uwb/) (via search summary). A single comparison article says Apple replaced AirTag with an "AirTag 2" with U2 chip, Precision Finding ~74 ft vs ~50 ft (unverified, single source) — same search results.

### Inferences
- Third-party precision finding on Apple remains unavailable as far as found; I found no Apple statement opening UWB to third parties.

### Gaps
- Pebblebee and Eufy SmartTrack certification dates, Eufy chip choices, and Apple spec details (key schedule) were not found in sources read.
- Whether Apple has since opened Precision Finding to third parties: no evidence found, not definitively ruled out.

## Tile (Life360): network, security research, anti-theft mode

### Takeaway
Tile's network is crowdsourced through Tile app users (also tied to Amazon Sidewalk). Georgia Tech research (reported September 2025) found Tile tags broadcast a static, unencrypted MAC alongside a rotating ID, enabling fingerprinting, replay, and server-side exposure without E2EE.

### Cited Findings
- Georgia Tech researchers (Kumar, Raymaker, Specter) found Tile broadcasts unencrypted fixed MAC plus rotating ID that can be predicted; replay attacks possible; Tile servers collect location, MAC, unique ID without E2EE; disclosed to Life360 November 2024, which replied it made unspecified "improvements" — [Malwarebytes, Sept 2025](https://www.malwarebytes.com/blog/news/2025/09/tile-trackers-plagued-by-weak-security-researchers-warn), [eSecurity Planet](https://www.esecurityplanet.com/news/tile-tracker-flaws-stalking-risks/), [Hackmag](https://hackmag.com/news/tile-flaws).
- Tile rotates only its identifier, unlike AirTag and SmartTag which also rotate the address — same Malwarebytes coverage.
- Anti-Theft Mode (2023): tracker hidden from Scan and Secure Bluetooth scans, no alerts to the carrier; requires ID submission and biometric facial verification; criticized for enabling stalking — [Life360](https://www.life360.com/blog/how-does-tile-anti-theft-mode-work), [GizChina](https://www.gizchina.com/2023/02/18/tile-trackers-new-anti-theft-mode-makes-life-difficult-for-thieves/).
- Tile connects to Amazon Sidewalk — GizChina above.
- Tile ran many hours behind in the 2026 Android Authority test — link above.

### Inferences
- Tile's lack of E2EE and MAC rotation is the main security contrast with Apple/Google networks.

### Gaps
- Tile network size/number of app users not found. Life360 acquired Tile in 2021 (not sourced here). Whether Life360 fixed the flaws is unconfirmed. Conference venue of the Georgia Tech paper not retrieved.

## Dual-network trackers and hardware

### Takeaway
Chipolo Pop and Pebblebee Universal work with Apple Find My or Google Find Hub, but only one network at a time; switching needs a reset.

### Cited Findings
- Pebblebee Universal (announced Oct 2024) supports both services; cannot use both simultaneously; switching needs a factory reset — [Mezha](https://mezha.ua/en/2024/10/02/pebblebee-introduced-trackers-that-support-apple-find-my-and-google-find-my-device-services/), [Yahoo Tech](https://tech.yahoo.com/article/best-bluetooth-tracker-140028377.html).
- Chipolo Pop announced April 2025, works with Apple Find My or Find Hub — [Notebookcheck](https://www.notebookcheck.net/Chipolo-Pop-A-colorful-Bluetooth-tracker-that-works-with-both-Apple-and-Android-devices.999129.0.html), [Chipolo](https://chipolo.net/products/chipolo-pop). Chipolo Point (ONE Point/CARD Point) = Google variant.
- Batteries: Chipolo ONE Spot uses replaceable CR2032, up to ~1 year; Chipolo CARD Spot up to 2 years; Pebblebee Clip rechargeable via USB-C ~6 months; Pebblebee Card ~12 months (Macworld) vs 18 months (Chipolo claim); Eufy SmartTrack Link CR2032; SmartTrack Card T87B1 rechargeable, T87B2 sealed — [Chipolo support](https://support.chipolo.net/hc/en-us/articles/10445056001053), [Macworld Clip](https://www.macworld.com/article/812892/review-pebblebee-clip.html), [Macworld Card](https://www.macworld.com/article/812911/pebblebee-card-review.html), [Eufy support](https://service.eufy.com/article-description/Is-the-SmartTrack-Card-Link-rechargeable).

### Inferences
- Nordic nRF52-class BLE SoCs are the likely common silicon for Apple-certified trackers, but no source confirms which chips Chipolo/Pebblebee/Eufy use.

### Gaps
- Specific SoC for each product, and Moto Tag battery/specs, not found.
