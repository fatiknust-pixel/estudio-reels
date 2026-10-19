# Samsung Galaxy SmartTag trackers and SmartThings Find (as of 2026-10-19)

Research caveat: WebFetch failed (DNS errors) for arxiv.org, usenix.org, androidauthority.com, androidcentral.com, so all findings come from web-search result summaries only, not full-page reads. Primary sources were not read directly; verify before publishing.

## Hardware per model

### Takeaway
SmartTag and SmartTag+ share BLE 5.0, a CR2032 coin cell and IP52-class protection. SmartTag+ adds UWB. SmartTag2 (Oct 2023, $29.99) moves to BLE 5.3 plus UWB, IP67 and 500/700-day battery life. A SmartTag 3 is rumored only; no confirmed launch found.

### Cited Findings
- SmartTag2: BLE 5.3, Bluetooth range up to 120 m, IP67, 28.8 x 52.44 x 8.0 mm, 13.75 g, replaceable CR2032, up to 500 days battery (Samsung spec page as summarized). Notebookcheck lists BLE 5.0, which conflicts with Samsung's 5.3; prefer Samsung. — [Samsung US B2B page](https://www.samsung.com/us/business/mobile/mobile-accessories/phones/galaxy-smarttag2-white-ei-t5600bwegus/b2bapp/); [Notebookcheck](https://www.notebookcheck.net/Samsung-Galaxy-SmartTag-2-New-object-tracker-showcased-for-under-US-30-with-UWB-and-700-days-battery-life.757713.0.html)
- SmartTag2: up to 700 days in Power Saving Mode, 500 days in normal mode; UWB features need UWB-equipped Galaxy phones (e.g. Note20 Ultra, S21+/Ultra, S22+/Ultra, S23+/Ultra, Z Fold2 and later). — [Droid-Life](https://www.droid-life.com/2023/10/05/30-galaxy-smarttag-2-now-official-with-500-day-battery-life/); [NextPit](https://nextpit.com/samsung-galaxy-smarttag-2-uwb-tracker-battery-launch-price-specs)
- SmartTag2 launch: $29.99, global sales from 11 Oct 2023; redesigned slimmer elongated body with keyring hole; IP67 vs IP53 on earlier models (one aggregator source; Samsung SmartTag+ page says IP52, so earlier-model rating is inconsistent across sources). — [Seeking Tech/comparison results](https://seekingtech.com/galaxy-smarttag-vs-galaxy-smarttag/); [Android Central](https://androidcentral.com/accessories/samsung-galaxy-smarttag-2-announcement)
- SmartTag+: Bluetooth 5.0 (BLE only), UWB, replaceable CR2032, Samsung says IP52-level; battery listed ~100-130 days by Samsung; Android Central estimates ~5 months. UWB range cited as up to 15 m by a low-reliability blog (hotairtag.com, which also claims ~180 days; unconfirmed). — [Samsung Canada SmartTag+ page](https://www.samsung.com/ca/support/apps-services/about-the-galaxy-smarttag-plus/); [Android Central review](https://www.androidcentral.com/samsung-galaxy-smarttag-plus-review); [hotairtag](https://hotairtag.com/samsung-galaxy-smarttag-vs-smarttag-plus/)
- Original SmartTag and SmartTag+ offer ring volume Mute/Normal/Loud; SmartTag2 retains the programmable button (SmartThings automations) per a Samsung community user. — [Seeking Tech](https://seekingtech.com/galaxy-smarttag-vs-galaxy-smarttag/); [Samsung community](https://r1.community.samsung.com/t5/members-star-s-corner/galaxy-smarttag2/td-p/23912872)
- SmartTag3: only rumors (July 2026, Roland Quandt) of a third generation, possibly with Galaxy S26 FE around September 2026, possibly Bluetooth 5.4/UWB; no specs or Samsung confirmation found; may stay Galaxy-only. — [Notebookcheck](https://www.notebookcheck.net/Samsung-s-SmartTag-3-rumored-to-be-launching-alongside-S26-FE.1339851.0.html); [Android Authority](https://androidauthority.com/smarttag-3-rumors-3686524)
- SmartTag2 manual shows last location history for up to 7 days. — [SmartTag2 user manual](https://www.bhphotovideo.com/lit_files/1056749.pdf)

### Inferences
- Reported ~100-130 -> 500/700 day jump is mostly due to BLE 5.3 and firmware power management, but no source confirms chip vendor.

### Gaps
- BLE/UWB chip makers (teardowns) not found. NFC presence per model not confirmed. Original SmartTag launch date/price, speaker specs, SmartTag2 button details not confirmed. Whether SmartTag 3 launched in Sept 2026 unknown.

## How SmartThings Find works

### Takeaway
Tags broadcast BLE; opted-in Galaxy devices ("find nodes") relay sightings to Samsung servers. Samsung says the ID changes every 15 min; the network reached 300 million nodes in May 2023.

### Cited Findings
- Offline Finding uses nearby Galaxy devices detecting lost devices anonymously via Bluetooth; users opt in under Settings or in SmartThings app; optional "Encrypt offline location" requires a 6-digit PIN. — [Samsung support](https://www.samsung.com/us/support/answer/ANS10004549/); [SmartThings support](https://support.smartthings.com/hc/en-us/articles/10863369660052-SmartThings-Find)
- Samsung states each device's ID changes every 15 minutes and is stored anonymously. — same sources as above
- Network: 200 million nodes July 2022; 300 million May 2023. — [SammMobile](https://www.sammobile.com/news/smartthings-find-grew-300-million-devices-worldwide/); [Android Headlines](https://www.androidheadlines.com/2023/05/samsungs-smartthings-find-has-over-300-million-devices-globally.html)
- SmartThings Find debuted ~Oct 2020 with Galaxy Note20 (one source). — [SamMobile](https://www.sammobile.com/news/smartthings-find-grew-300-million-devices-worldwide/)
- SmartThings Find app is Android-only; a German blog says iPhone users cannot set up tags. A community post says non-Galaxy phones depend on Galaxy devices with Offline Finding. — [SmartThings support](https://support.smartthings.com/hc/en-us/articles/10863369660052-SmartThings-Find); [Tink](https://www.tink.de/blog/nie-wieder-suchen-wie-smartthings-find-dein-leben-und-deine-sachen-rettet/); [SmartThings community](https://community.smartthings.com/t/smarttag2-connectivity/280859)
- A third-party comparison cites 300M network vs Apple's 1B+ (commercial site, low reliability). — [airpinpoint](https://airpinpoint.com/compare/airtags-vs-samsung-smarttag)

### Inferences
- Network size is Galaxy-only, so density depends on opt-in and region; accuracy figures not found.

### Gaps
- Lost mode details, AR/compass UWB search ranges, cryptographic design (from Samsung itself), accuracy numbers, newer node counts after 2023: not verified.

## Security research

### Takeaway
ANU researchers (Yu, Henderson, Tiu, Haines) found privacy and tampering flaws in Samsung's Offline Finding; serious server-side flaws were fixed (CVE-2022-33707).

### Cited Findings
- Preprint "Privacy Analysis of Samsung's Crowd-Sourced Bluetooth Location Tracking System" arXiv:2210.14702, Oct 2022; published at USENIX Security 2024 as "Security and Privacy Analysis of..." (not 2023 as the brief states; a sec23winter prepub file exists). Tested: tracking via BLE, unwanted tracking, vendor deanonymization, tampering. Authors fully impersonated a SmartTag to the network; critical server-side issues in tag registration and location reporting were fixed; CVE-2022-33707. — [arXiv](https://arxiv.org/pdf/2210.14702); [USENIX](https://www.usenix.org/conference/usenixsecurity24/presentation/yu-tingfeng)
- DFRWS 2025 forensics paper: reverse engineering firmware/APK identified device and owner information, tracked and manipulated tag location. — [DFRWS](https://dfrws.org/wp-content/uploads/2025/03/DFRWS_EU_Samsung-Tracking-Tag-Application-Forensics-in-Criminal-Investigations.pdf)

### Gaps
- Specific attack names and which flaws remain unfixed (design-level ones, e.g. server deanonymization) not confirmed since full paper unread.

## Unknown tag alerts and cross-platform

### Takeaway
Samsung offers unknown tag alerts (Galaxy) and manual scan on Android and iOS apps; only SmartThings-compatible tags are detected; no confirmed standard cross-platform alerts.

### Cited Findings
- Setup: SmartThings > Life > Find > Settings > Unknown tag alerts; detects only SmartThings Find compatible tags; manual "Search for unknown tags near you" with signal gauge. — [Samsung UAE support](https://www.samsung.com/ae/support/mobile-devices/how-to-disable-smarttag-2-location-tracking/)
- Samsung says Android and iOS users can manually scan. — [Samsung newsroom feed](https://news.samsung.com/in/tag/smarttag/feed)
- Academic study: SmartThings available on both OSes but only detects SmartTags and background scanning only on Galaxy phones; in tests the app did not find a Galaxy SmartTag. — [arXiv 2312.07157](https://arxiv.org/html/2312.07157v1)
- Samsung's anti-stalking update (April 2021). — [MacRumors](https://www.macrumors.com/2021/04/20/samsung-smartthings-prevent-tracker-stalking/)

### Gaps
- Whether SmartTag supports Google's Unwanted Tracker Alerts / IETF DULT interoperability: not found.
