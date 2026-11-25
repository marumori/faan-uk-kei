# 返屋企 · 互動示範（Demo POC）

A playable prototype of 返屋企 (Faan Uk Kei), "The Connected Family Home", built for pitches and user testing. You steer a character through a side-on cutaway of a small Hong Kong flat (《屋邨日常》 style), stop at familiar objects and open them.

> All data is fictional (陳家 — 示範家庭). This is a demo, not a product: there are no accounts, no sync, no encryption and no real integrations.

## Run locally

No build step. Any static file server will do:

```bash
# from the repository root
python3 -m http.server 8000
# open http://localhost:8000/demo/
```

Opening `index.html` straight from disk (`file://`) won't work, because the code uses ES modules and a service worker.

## Deploy

The repo's `wrangler.jsonc` already serves the whole repository folder as static assets, so the demo goes live at `/demo/` with no config change:

```bash
npx wrangler deploy
# → https://<your-worker>.workers.dev/demo/
```

Any other static host (Cloudflare Pages, GitHub Pages, Netlify) works the same way. Publish the repo and open `/demo/`.

## Controls

| | Desktop | Touch |
|---|---|---|
| Walk | WASD / arrow keys. Up/down steps toward the wall or toward you | On-screen arrow pad, or tap anywhere on the floor |
| Go to an object | Click it, press **1–6**, or click a stop in the bottom bar | Tap it, or tap a stop in the bottom bar |
| Open | **E** or **Enter** when the cue appears | Tap the brown cue button |
| Close | **Esc** or 關閉 | 關閉 |

**Magnetic stops:** when you let go of the keys, the character walks itself to the nearest object, so no precise movement is needed. If furniture blocks the way, the character slides around it automatically.

**Senior-friendly path:** 簡易選單 (top bar), or 直接去某個位置 on the entry screen, lists every object as a big button. Pick one and the character walks there and opens it. 大字 enlarges all text, and 減少動畫 turns off motion (it also follows the OS reduced-motion setting).

## Pitch walkthrough (3–5 minutes)

1. Entry screen → **我返嚟喇**. The door opens into the flat.
2. Walk right with the arrow keys and let go near the sofa. The character settles at the coffee table. **E** opens the family album, and ← → turn the pages. Show 加一段回憶.
3. Stop **窗** (4): hold the button to slide out the private drawer. Point out the 🔒 私人 label, the time-capsule date and the explicit 我想分享畀…… chooser.
4. Stop **床** (6): the character walks through the bedroom door. **E** → hold to crouch → pull the red mooncake tin out → lift the lid → the legacy index. Point out the "prototype, not a secure vault" notice, and add an index card.
5. Stop **雪** (5): the note on the fridge door becomes the grave-location card. Tap 儲存離線版.
6. Stop **連** (3): the router opens the connector showcase. Every card is labelled Concept or Prototype, and no account is connected.
7. 重設示範 resets everything before the next audience.

## Architecture

```
demo/
├─ index.html            shell: entry screen, HUD, cue, stops bar, panel container
├─ css/app.css           all UI styling (large text, high contrast, reduced motion)
├─ js/main.js            boots Phaser and wires the HTML UI to the scene
├─ js/bus.js             small event bus between the scene and the UI
├─ js/player.js          character controller: input, movement, collision, idle/walk, auto-walk paths
├─ js/scenes/
│  ├─ BootScene.js       generates the character sprite sheet in code
│  └─ HomeScene.js       world, camera, keyboard/pointer input, stops, room changes
├─ js/world/
│  ├─ layout.js          world coordinates, the two zones, blocking geometry
│  ├─ objects.js         data-driven interactable registry (id, sceneId, interactionPoint, radius, visibility, action…)
│  └─ art.js             all scene art, drawn in code (no image assets)
├─ js/ui/
│  ├─ panel.js           panel open/close, Esc, focus trap, pause/resume
│  ├─ views.js           object content and hands-on moments (album, drawer, bed→tin, grave card, connectors)
│  └─ illustrations.js   original SVG album illustrations
├─ js/data/
│  ├─ demo-data.js       fictional seed data
│  └─ store.js           IndexedDB persistence with in-memory fallback and reset
├─ sw.js                 service worker (offline cache)
└─ vendor/phaser.min.js  Phaser 3.80.1 (MIT), vendored so the demo works offline
```

- **Rendering:** Phaser 3 draws a side-view cutaway with a shallow depth lane (`depth` 0 = against the wall, 1 = nearest the viewer). Objects are depth-sorted by their front edge.
- **Interaction model:** every object in `objects.js` is also a "stop". Adding an object means one registry entry, one blocker in `layout.js`, a drawing in `art.js` and a view in `views.js`. The scene itself doesn't change.
- **UI:** all content is HTML/CSS. When a panel is open, the scene pauses and the camera shifts so the character stays visible beside the panel.

## Data, privacy and storage

- Every person, place, story and document reference is fictional. Grave directions, transport routes and facility names are invented.
- The legacy index stores **where** something is kept, never the document, account number or credentials. Its form warns against entering passwords, bank details or OTPs.
- Saved changes (new memories, new or edited index cards) live only in this browser's **IndexedDB**. That is not encrypted, not a vault, and not shared with anyone. 重設示範 restores the seed data.
- Private items (drawer, private index cards) are labelled 🔒 私人 · 預設唔分享. Sharing is an explicit, per-person choice, and in the demo it is simulated only.
- Display preferences (large text, reduced motion) use `localStorage`.

## Offline

Offline support is promised **for the grave-location card only**:

- The service worker caches the demo's static files on the first visit. The card's data sits in IndexedDB.
- Tested in headless Chromium: load the page, tap 儲存離線版, switch the browser offline, reload, and the card opens with its saved data and an "offline" status line.
- Still to do by hand before claiming it in a pitch: airplane mode on a real phone, and a full browser restart.
- The map button is disabled and labelled as unavailable. No external links work offline.

## Assets and licensing

| Asset | Source | Licence |
|---|---|---|
| All scene art, character, furniture, icons | Drawn in code for this project (`art.js`, `illustrations.js`, `icon.svg`) | Project-owned |
| Phaser 3.80.1 | npm `phaser` | MIT (`vendor/PHASER-LICENSE.md`) |
| Fonts | System fonts only (Noto Sans HK / PingFang HK / Microsoft JhengHei fallbacks) | n/a |

No sound effects, photos or third-party images are used.

## Known limitations

- Two zones only (living/dining and bedroom). No kitchen, and the entrance is part of the living room.
- Movement is left/right along the flat plus a shallow front/back lane. It is not free 2D roaming, by design, following the stop-based interaction model.
- The character is a simple drawn sprite with 4 walk frames per view, plus idle breathing and a crouch pose. There is no avatar customisation.
- Voice notes are simulated playback bars. There is no real audio.
- Photo import is a local preview only. Nothing is uploaded or stored.
- The connector cards are concepts. Nothing connects to FEHD, iAM Smart, WhatsApp or any other service.
- No accounts, roles or multi-user sync. The privacy labels are visual demonstrations, not access control.
- Only one home style (《屋邨日常》). The optional 《舊邨光陰》 style isn't built.
- Time of day only tints the window sky and the room at dusk and night.
- No AI features. Every story is pre-written.
- Tested in headless Chromium (desktop 1280×760 and iPhone 13 emulation). Not yet tested on real Safari or Firefox, or with a screen reader.
