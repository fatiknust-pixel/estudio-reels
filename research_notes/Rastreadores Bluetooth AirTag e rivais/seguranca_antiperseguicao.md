# Anti-stalking protections and security vulnerabilities/abuses of Bluetooth item trackers

Method note: WebFetch could not reach any host (DNS failures), so all findings come from WebSearch result summaries, not full-page reads. Primary pages (Apple Newsroom, Google blogs, IETF datatracker, arXiv) are linked but were not opened directly. Treat figures as search-summary-level and verify before publication.

## How detection works on iOS and Android (Apple alerts, sound timings, Tracker Detect, Android rollout)

### Takeaway
Apple's AirTag chirp-when-separated delay was shortened from 3 days at launch to a random time within 8–24 hours (2021 firmware update). Apple shipped Tracker Detect for Android in Dec 2021. Android's own unknown-tracker alerts began rolling out in July 2023 with a manual "Scan Now" option.

### Cited Findings
- At launch, AirTags chirped after three days of separation from their owner. Apple moved this to a random time inside an 8–24 hour window via a 2021 firmware update. — [Newshub, 2021](https://www.newshub.co.nz/home/technology/2021/06/apple-updates-airtags-after-privacy-concerns-over-tracking-without-consent.html); [Deccan Herald](https://deccanherald.com/technology/apples-airtag-stalker-alert-will-get-faster-and-loud-1080378.html). The search summary said the sources were old, so check Apple's current support page. The randomization rationale (less predictable) is the outlet's inference, not an Apple statement.
- iPhones show a separate on-screen "AirTag Found Moving With You" alert. Apple has not published exactly when it triggers. — [MacStories](https://www.macstories.net/linked/apple-tells-cnet-its-making-privacy-changes-to-airtags-and-has-an-android-app-coming-later-this-year/)
- Apple built a "Tracker Detect" app for Android users to scan for nearby AirTags. The search summary did not confirm its release date, so the "Dec 2021" date is not sourced here. — [MacStories](https://www.macstories.net/linked/apple-tells-cnet-its-making-privacy-changes-to-airtags-and-has-an-android-app-coming-later-this-year/)
- From an iPhone, the user can see the tracker's identifier, make it play a sound, and get instructions for disabling it (remove the battery). — [Tom's Guide](https://www.tomsguide.com/phones/apple-and-google-are-finally-joining-forces-to-stop-unwanted-bluetooth-tracking)
- Google announced unknown tracker alerts at I/O 2023. They began rolling out to Android 6.0+ in July 2023 (post dated July 27, 2023). The system alerts when an unknown Bluetooth tracker separated from its owner travels with the user. The user can view a map of sightings and play a sound on the tracker. — [Google blog](https://blog.google/products-and-platforms/platforms/android/unknown-tracker-alert-google-android/); [Eleven Forum](https://elevenforum.com/t/google-rolling-out-unknown-tracker-alerts-on-android.16732). A CISPA-based summary says "August 2023", which conflicts with Google's July date; Google's own post is more reliable.
- Manual scan on Android: Settings > Safety & emergency > Unknown tracker alerts > "Scan Now". It takes about 10 seconds. Google cautions that results may be misplaced trackers, not stalking devices. — [Android Central](https://androidcentral.com/accessories/how-to-scan-for-unknown-trackers-that-might-be-following-you); [Google Support](https://support.google.com/android/answer/13658562?hl=en-NZ)
- Google held back its broader Find My Device network (the crowdsourced one, later "Find Hub") until Apple implemented iOS protections for third-party trackers. The network launched in April 2024 per the CISPA summary. — [TechCrunch](https://techcrunch.com/?p=2575325); [Eleven Forum](https://elevenforum.com/t/google-rolling-out-unknown-tracker-alerts-on-android.16732)

### Inferences
- The 3-day to 8–24 hour change was a response to the 2021–2022 stalking reports, but no source I found links them explicitly.

### Gaps
- Exact current Apple timings (alert thresholds, sound delay) from Apple's own support docs were not retrieved.
- Release date of Tracker Detect for Android not confirmed.
- Samsung's and Tile's detection behavior on Android was not covered here beyond the Tile material below.

## Cross-industry standard: Apple–Google DULT specification, iOS 17.5 / Android rollout, IETF

### Takeaway
Apple and Google co-authored the "Detecting Unwanted Location Trackers" specification. It was announced May 2023 and shipped in iOS 17.5 and Android in May 2024. It has moved into an IETF working group (DULT).

### Cited Findings
- Joint announcement on May 13, 2024: Apple shipped the spec in iOS 17.5. Google added it for Android 6.0+. Alerts cover AirTags, Find My accessories and third-party trackers. iPhone shows "[Item] Found Moving With You"; Android shows "Tracker traveling with you". — [Google Security Blog](https://security.googleblog.com/2024/05/google-and-apple-deliver-support-for.html); [Apple Newsroom](https://www.apple.com/newsroom/2024/05/apple-and-google-deliver-support-for-unwanted-tracking-alerts-in-ios-and-android/); [Neowin](https://www.neowin.net/news/apple-and-google-launch-unwanted-location-tracking-detection-for-iphone-and-android/)
- Manufacturers named as supporting the draft: Samsung, Tile, Chipolo, eufy Security, Pebblebee. Chipolo, eufy, Jio, Motorola and Pebblebee said future tags would be compatible. — [Pebblebee](https://pebblebee.com/blogs/news/apple-and-google-unite-to-combat-unwanted-tracking-with-industry-specification); [Chipolo](https://chipolo.net/en/blogs/google-and-apple-cooperate-on-unwanted-bluetooth-tracking-alerts); [Android Central](https://androidcentral.com/apps-software/unwanted-tracking-notifications-rolling-out-ios-android)
- Per Wikipedia, a draft appeared in December 2023 and was implemented in iOS 17.5. — [Wikipedia: Find Hub](https://en.wikipedia.org/wiki/Find_Hub). (The May 2023 initial announcement date is from the assignment brief; I did not find it in a source.)
- IETF DULT working group charter: standardize an application protocol between location-tracking accessories and nearby devices, plus actions on detection of unwanted tracking. It would let an accessory advertise in a detectable mode and let nearby devices trigger behavior (e.g. a sound) to help find it. The group coordinates with the Bluetooth SIG and 6lo. Origin: a BoF request for IETF 118 (Nov 2023). — [IETF DULT charter](https://datatracker.ietf.org/doc/charter-ietf-dult/00-03/); [BoF request](https://datatracker.ietf.org/doc/bofreq-danyliw-detecting-unwanted-location-trackers-dult-ietf118/)
- WG drafts include an accessory protocol (draft-ietf-dult-accessory-protocol; a -00 version showed as expired), a "finding" draft, and a threat model (revision 04 dated 26 Feb 2026). — [Datatracker: accessory protocol](https://datatracker.ietf.org/doc/draft-ietf-dult-accessory-protocol); [DULT group page](https://datatracker.ietf.org/wg/dult/about/)
- Cross-platform: an Android phone can alert on an AirTag, and an iPhone can alert on a Find Hub tag. Samsung SmartTags stay within SmartThings and do not work with Find Hub. Chipolo and Pebblebee are Find Hub partners. — [Android Police](https://www.androidpolice.com/i-want-trust-google-find-hub-but-these-tracking-issues-must-be-fixed/); [Seekerity](https://seekerity.com/blogs/blog/apple-find-my-vs-google-find-hub-whats-the-difference) (retailer blog, lower quality)

### Inferences
- The standard is still in draft in the IETF as of early 2026 (threat model -04 in Feb 2026); I found no evidence of an RFC publication.

### Gaps
- Current RFC/last-call status of the DULT drafts could not be verified; datatracker pages were unreachable.
- Whether Samsung actually shipped DULT-compliant SmartTag alerts was not confirmed (only "expressed support").
- No source found for any iOS 26 or 2026 change in unwanted-tracking alerts.

## Abuses: lawsuits, car theft, "silent AirTags"

### Takeaway
AirTags became a widely reported stalking and vehicle-theft tool. Stalking suits against Apple in N.D. Cal. survived a motion to dismiss in 2024 but class certification was denied in March 2026. Modified speaker-less AirTags were sold on Etsy/eBay in Feb 2022.

### Cited Findings
- Two women filed a proposed class action in N.D. California (Dec 2022) alleging inadequate safeguards ("weapon of choice of stalkers"; $29 price). It was expanded to more than three dozen victims and cited 150+ police reports as of April 2022. — [Law Street Media](https://lawstreetmedia.com/?p=20644); [MacTrast](https://www.mactrast.com/2023/10/california-airtag-class-action-lawsuit-widened-to-include-more-stalking-cases/amp/)
- Judge Vince Chhabria (March 2024) let three plaintiffs' negligence and product liability claims proceed and dismissed others. He noted Apple may ultimately be right that California law did not require more. — [PhoneArena](https://www.phonearena.com/news/judge-orders-apple-to-face-class-action-suit-over-airtag-stalking_id156374); [SC Lawyers Weekly](https://sclawyersweekly.com/news/2024/03/20/judge-denies-apples-bid-to-dismiss-airtag-stalking-lawsuit/)
- March 2026: a California federal judge denied certification of three proposed nationwide classes (paywalled, reasoning not read). — [Mealey's](https://www.mealeys.com/mealeys/articles/2451564)
- Car theft: York Regional Police (Ontario) warned thieves hide AirTags in places like fuel-flap doors, tow hitches, bumpers, and external ports, then follow the car home. They counted at least five incidents since September (2023 report). A Global News piece (April 2024) described GPS trackers including AirTags used in auto theft. — [Tom's Guide](https://www.tomsguide.com/news/airtag-car-thefts); [Global News](https://globalnews.ca/news/10400339/airtags-gps-trackers-auto-theft)
- Silent AirTags: in Feb 2022 an Etsy seller (JTEE3D) listed a speaker-disabled AirTag for $77.50 (hole cut beneath the battery to disconnect the speaker). eBay listings were $75 and $82. The seller said it was for bikes, pets and tools and removed the listing. EFF's Eva Galperin noted a secondary market for such mods already existed. — [Gizmodo](https://gizmodo.com/silenced-airtags-with-disabled-speakers-for-sale-online-1848473673); [9to5Mac](https://9to5mac.com/2022/02/03/airtags-with-deactivated-speakers-being-sold/); [Tom's Guide](https://www.tomsguide.com/news/muted-airtags-danger)

### Inferences
- Speaker removal matters because on-device sound is the main fallback for people without a compatible phone, while the phone alert still fires.

### Gaps
- The Dec 2022 vs earlier filing date: the search summary said "December 2022" but also mentions April 2022 police reports; exact docket dates not verified.
- Current status of silent-AirTag listings and Apple response not found.
- No authoritative statistics on stalking cases (e.g. police data) retrieved.

## Vulnerabilities and research (OpenHaystack, Send My, Find You, nRootTag, firmware hacking, Samsung, Tile)

### Takeaway
Researchers repeatedly showed the Find My network and its anti-stalking heuristics can be abused: custom tags (OpenHaystack), data exfiltration (Send My), key-rotating clones (Find You, 2022), and nRootTag (2025). Samsung and Tile systems also have documented privacy flaws.

### Cited Findings
- OpenHaystack: TU Darmstadt (SEEMOO) reverse-engineered Find My offline finding and released a framework to build custom trackable accessories (2021). — [The Hacker News](https://thehackernews.com/2021/05/apples-find-my-network-can-be-abused-to.html); [Threatpost](https://threatpost.com/apple-find-my-exploited-bluetooth/166121/)
- Send My (Fabian Bräunlein, Positive Security, May 2021): data is encoded in the public keys broadcast by a microcontroller; nearby Apple devices upload them, and a Mac app (DataFetcher) retrieves and decodes them. Rate about 3 bytes/s with 16-byte chunks. He called it inherent to the system's privacy design. — [The Hacker News](https://thehackernews.com/2021/05/apples-find-my-network-can-be-abused-to.html); [Tom's Guide](https://www.tomsguide.com/news/apples-find-my-network-can-be-used-to-steal-data-heres-how)
- Find You (Feb 2022): ESP32 clone built on OpenHaystack that cycles through 2,000 preloaded public keys, switching every 30 seconds. It evaded iOS alerts and Tracker Detect, tracking a consenting iPhone user for over five days without notification. Researchers argued Apple should add non-genuine AirTags to its threat model. Third-party AirGuard found it in manual scan mode. — [Positive Security](https://positive.security/blog/find-you); [The Hacker News](https://thehackernews.com/2022/02/experts-create-apple-airtag-clone-that.html); [The Register](https://www.theregister.com/2022/02/22/apple_airtags_protections_bypass/)
- nRootTag (George Mason University; Junming Chen, Qiang Zeng, Lannan Luo; USENIX Security 2025 Distinguished Artifact Award, one of 6 of 2,385 papers): makes a computer/phone appear as a lost AirTag without root. Works on Linux, Windows, Android; tracking success above 90% within minutes at a cost of a few US dollars. Apple was notified in July 2024; as of Feb 2025 not fixed, researchers warned a full fix may take years. — [GMU paper](https://people.cs.gmu.edu/~zeng/papers/2025-security-nrootgag.pdf); [GMU news](https://content.gmu.edu/news/2025-08/bluetooth-blues-george-mason-turns-bug-big-win); [Michael Tsai](https://mjtsai.com/blog/2025/02/27/nroottag). The "any Bluetooth device" framing in the brief is press shorthand; the paper's scope is computers, phones and IoT.
- AirTag firmware hack (stacksmashing, May 2021): voltage glitching of the nRF52832 with a Raspberry Pi Pico (about US$4) plus MOSFET to enter debug mode, dump firmware and reflash it. Demonstrated changing the NFC URL to a non-Apple site (owner must tap the link). Two AirTags were bricked in the process. — [AppleInsider](https://appleinsider.com/articles/21/05/09/airtag-hacked-and-reprogrammed-by-security-researcher); [TechXplore](https://techxplore.com/news/2021-05-jailbreak-apple-airtag.amp)
- Samsung SmartTag (arXiv 2210.14702, Oct 2022): analysis of firmware 1.01.26/1.02.06 and FMM below 7.2.24.12 found GATT server flaws and a registration protocol flaw letting an attacker register someone else's SmartTag without its ECDH private key. Newer versions not examined. — [arXiv](https://arxiv.org/pdf/2210.14702)
- Tile (Georgia Tech, arXiv 2510.00350, Sept/Oct 2025): Tile transmits identifiers in plaintext (MAC address). Servers can learn locations of users and tags. Anti-theft mode only hides tags in the UI while the server still records their IDs, so a modified app can display them. Scan and Secure is manual and needs about 10 minutes of movement. Life360 responded vaguely. — [arXiv](https://arxiv.org/pdf/2510.00350); [Malwarebytes](https://www.malwarebytes.com/pt-br/blog/news/2025/09/tile-trackers-plagued-by-weak-security-researchers-warn); [BGR](https://www.bgr.com/1983580/tile-tracker-security-vulnerability-unencrypted-mac-address/)

### Inferences
- Find You and nRootTag are both attacks on the same weakness: the network cannot tell genuine tags from forged ones, and detection relies on a stable identifier.

### Gaps
- Lost Mode phone-number XSS (Bobby Rauch, Sept 2021): searched, no result found; unverified. Do not state as fact without a source.
- Apple's response or patches to Send My, Find You and nRootTag were not found (nRootTag status after Feb 2025 unknown).
- Find You details (2,000 keys, 30 s) come from secondary reports plus the Positive Security link; the blog itself was not opened.
- Samsung vendor response and fixes not found.

## Remaining limitations of detection

### Takeaway
Detection is weaker on Android than iOS, depends on users noticing alerts, and does not stop spoofed or non-standard devices; Tile relies on manual scanning.

### Cited Findings
- USENIX Security 2025 (Gerhardt et al., CISPA): 50-participant study plus 19-person deception study; unwanted-tracking notifications are significantly more reliable and timely on iOS than on Android; many participants ignored unobtrusive warnings; Find My's UI made locating the tracker harder than necessary. — [USENIX](https://www.usenix.org/conference/usenixsecurity25/presentation/gerhardt); [CISPA](https://cispa.de/en/research/publications/84791-airtag-facilitated-stalking-protection-evaluating-unwanted-tracking-notifications-and-tracker-locating-features)
- Northeastern researchers (2023): iPhone alerts take a few hours and can arrive too late or be bypassed. — [Schneier](https://www.schneier.com/?p=64860) (secondary summary)
- Tile's detection is manual and user-initiated, unlike OS-level detection by other vendors. — [Malwarebytes](https://www.malwarebytes.com/pt-br/blog/news/2025/09/tile-trackers-plagued-by-weak-security-researchers-warn)
- Key-rotating clones (Find You) and nRootTag evade or sidestep the alert design; speaker-removed tags defeat the audible fallback (see sections above).

### Inferences
- The only structural fix would be authentication of tags plus mandatory standard compliance across manufacturers; neither is established by the sources I found.

### Gaps
- No quantitative data on how often alerts fail in the field.
- Google Pixel Tag (reported July 2026) and its anti-stalking behavior was only seen as a headline ([Tech Times](https://www.techtimes.com/articles/322567/20260731/google-pixel-tag-real-first-party-tracker-arrives-34-uwb-still-unconfirmed.htm)); not verified.
