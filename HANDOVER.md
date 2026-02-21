# NX Satnav Prototype Handover

Project path: `/Users/k_ncube/Documents/New project`  
Date: February 14, 2026

## 0. Phone Test Plan (Step-by-Step)

### A) Best for tomorrow driving test (works away from home Wi-Fi): Cloudflare tunnel

1. On your Mac, open Terminal #1:
```bash
cd "/Users/k_ncube/Documents/New project"
python3 -m http.server 8080
```
2. Leave Terminal #1 running.
3. Open Terminal #2:
```bash
cloudflared tunnel --url http://localhost:8080
```
4. Look for a line like:
`https://something.trycloudflare.com`
5. On your phone (mobile data or any network), open that URL.
6. Allow location + motion/audio permissions when prompted.
7. In the app:
   - type destination/postcode/duty in the top search,
   - confirm map pans to the destination pin,
   - tap `Start` to begin route + guidance.
8. Keep both terminals running while testing. If either stops, phone access stops.

### B) If phone is on same Wi-Fi as your Mac (local-only)

1. On Mac, run:
```bash
cd "/Users/k_ncube/Documents/New project"
python3 -m http.server 8080
```
2. Get Mac local IP:
```bash
ipconfig getifaddr en0
```
3. On phone browser, open:
`http://<YOUR_MAC_IP>:8080` (example: `http://192.168.1.252:8080`)
4. Accept location permission.

### C) Safety + practical test checklist

1. Mount phone securely before moving.
2. Start route while parked.
3. Test scenarios:
   - postcode search,
   - road/building name search,
   - duty selection,
   - voice on/off toggle,
   - off-route auto-reroute.
4. Do not interact with UI while driving; stop safely to change settings.

### D) If location says “permission denied”

1. iPhone: `Settings -> Safari -> Location -> Allow` (or `Ask Next Time` then allow in browser prompt).
2. Android: app/site permissions -> Location -> Allow.
3. Ensure URL is `http://localhost`, `http://<LAN-IP>`, or `https://...trycloudflare.com` (not `file://`).
4. Reload page and tap `Start` again.

---

## 1. What We’ve Built

### High-level overview

This is a browser-based satnav prototype for National Express-style driving workflows:
- driver enters one target (duty ID, postcode, or place),
- app starts from current GPS location,
- app builds a route (coach/HGV aware when ORS key is present),
- app shows stop sequence + directions,
- app follows live phone position and auto-reroutes off-route.

### Current features that work

- Single search input for duty, postcode, or place.
- Destination preview pin and map recenter before navigation.
- National Express stop picker (optional intermediate stops).
- Duty route loading from parsed duty cards (`duties.json`).
- Duty timeline display with A6 outbound/return split.
- Live GPS tracking marker with selectable vehicle icon (`Coach`, `Truck`, `Car`).
- Turn-by-turn text instructions.
- Voice guidance (speaker toggle + speed control).
- Auto-reroute (configurable).
- Settings panel:
  - miles/yards vs km/meters,
  - route color,
  - voice on/off + rate,
  - auto-reroute,
  - avoid motorways/tolls/ferries.
- Basemap switching: Road and Satellite.
- Street View quick-open links.

### Tech stack and why

- HTML/CSS/JavaScript (vanilla):
  - simple prototype stack, no build tooling needed, runs anywhere quickly.
- Leaflet:
  - lightweight map rendering and marker/polyline control.
- OpenRouteService API:
  - supports `driving-hgv` with vehicle restrictions.
- OSRM public router fallback:
  - route fallback when ORS key/profile fails.
- Nominatim + postcodes.io:
  - UK-friendly geocoding for postcodes and free text.
- Browser Geolocation API:
  - live GPS without native app.
- Web Speech API:
  - built-in voice prompts.
- Python scripts:
  - extract/normalize data from Excel/PDF into JSON for the app.

---

## 2. How It Works (smart-user explanation)

### Architecture

1. Data prep layer (offline scripts):
   - `scripts/extract_stops.py` -> `stops.json`
   - `scripts/extract_duties.py` -> `duties.json`
2. Frontend app layer:
   - `index.html`: UI structure.
   - `styles.css`: responsive map-first UI.
   - `app.js`: app logic/state/events/routing/guidance.
3. External services:
   - map tiles,
   - geocoding,
   - routing engine(s).

### Data flow when user searches and starts nav

1. User types in top search.
2. App tries to interpret text as:
   - duty ID, else
   - known NX stop, else
   - postcode/place geocode query.
3. App geocodes target and drops a preview pin; map centers on it.
4. On `Start`, app gets current GPS location (this is always start point).
5. App builds route points:
   - current GPS,
   - optional selected NX stops,
   - destination (or duty stop sequence if duty chosen).
6. App requests route:
   - ORS HGV first (if key),
   - ORS car fallback,
   - OSRM fallback.
7. App draws route polyline and numbered stop markers.
8. App starts `watchPosition` GPS loop:
   - moves driver marker,
   - snaps current location to nearest route segment,
   - computes next instruction + distance,
   - speaks prompts (if enabled),
   - triggers reroute if off-route.

### Map rendering

- Leaflet map initialized once.
- OSM Road layer + Esri Satellite layer selectable.
- Route is `L.polyline(...)`.
- Stops are custom numbered markers.
- Driver marker uses emoji icon in a styled badge.

### Routing

- Primary: OpenRouteService `/v2/directions/driving-hgv/geojson` with restrictions (height/width/length/weight).
- Secondary: ORS driving-car.
- Fallback: OSRM public `route/v1/driving`.
- Guidance steps are normalized to common internal format with cumulative distances.

### Location tracking

- Start point uses `navigator.geolocation.getCurrentPosition`.
- Live guidance uses `watchPosition`.
- Every GPS update:
  - find nearest point on planned polyline,
  - estimate progress along route,
  - compute maneuver distance and remaining distance,
  - update nav status and voice.

### Other critical technical pieces

- Local cache:
  - geocode results and settings in browser `localStorage`.
- Settings schema migration:
  - older red route colors are migrated to blue default.
- Duty simplification:
  - PDF timelines are reduced to primary operational legs for cleaner routing.

---

## 3. Key Decisions and Tradeoffs

### Important choices and why

1. Browser app instead of native app:
   - fastest way to prototype and test with real drivers.
2. ORS + OSRM dual routing:
   - better resilience when keys fail or profile unavailable.
3. Always start from current GPS:
   - matches real satnav behavior and avoids stale “start stop” inputs.
4. Single search box:
   - simpler operational workflow for drivers.
5. Parsed duty cards into structured JSON:
   - enables route/duty loading without manual route coding each time.

### What didn’t work cleanly (and response)

1. Localhost directly on phone when not same network:
   - solved with Cloudflare tunnel.
2. “First instruction” voice phrasing:
   - removed from speech output.
3. Occasional stale/cached JS on phone:
   - solved via script version bump (cache-busting).
4. Raw duty PDF timelines causing loops/noise:
   - added route rules + stop simplification + timeline filtering.

### Known limitations / compromises

1. Not a native app, so browser permission/model quirks apply.
2. Uses public/free routing/geocoding endpoints; rate limits and reliability vary.
3. No real-time traffic ingestion yet.
4. No persistent backend (everything is static files + browser state).
5. Voice depends on browser speech quality and available voices.

---

## 4. The Code

### File structure

- `/Users/k_ncube/Documents/New project/index.html`
  - UI shell and controls.
- `/Users/k_ncube/Documents/New project/styles.css`
  - floating map UI, responsive mobile layout.
- `/Users/k_ncube/Documents/New project/app.js`
  - state, event handlers, routing/geocoding/navigation logic.
- `/Users/k_ncube/Documents/New project/stops.json`
  - normalized stops.
- `/Users/k_ncube/Documents/New project/duties.json`
  - duty definitions, stop IDs, timeline events.
- `/Users/k_ncube/Documents/New project/scripts/extract_stops.py`
  - XLSX -> JSON parser (no external deps).
- `/Users/k_ncube/Documents/New project/scripts/extract_duties.py`
  - PDF -> duty/timeline extraction with route rules.

### Key functions in `app.js` (most important)

- App setup/state:
  - `init`, `loadSettings`, `sanitizeSettings`, `handleSettingsInputChange`
- Search/preview:
  - `queueDestinationPreview`, `resolvePreviewTarget`, `setDestinationPreview`
- Route planning:
  - `handlePlanRoute`, `resolveDestinationTarget`, `routeBetweenPoints`
- Geocoding:
  - `geocodeQuery`, `geocodeStop`, `pickBestNominatimResult`
- Drawing/render:
  - `drawRoute`, `renderSummary`, `renderDirections`, `renderDutyTimeline`
- Live nav:
  - `startLiveGuidance`, `handleLivePosition`, `updateLiveGuidanceFromPoint`
- Reroute:
  - `maybeTriggerAutoReroute`, `triggerAutoReroute`, `getRemainingTargets`
- Voice:
  - `maybeSpeakGuidance`, `speakInitialInstruction`

### External dependencies/services

- Leaflet JS/CSS (CDN): map rendering.
- OSM + Esri tiles: basemaps.
- OpenRouteService: coach/HGV-capable routing.
- OSRM: fallback routing.
- postcodes.io: high-accuracy UK postcode lookup.
- Nominatim: general place/address lookup.
- Google Maps URL scheme: Street View launch.

---

## 5. Fragile Bits and Gotchas

### Likely break points

1. Third-party API limits/outages:
   - symptoms: geocode/routing errors.
2. Mobile browser permission state:
   - symptoms: “Location permission denied.”
3. Duty PDF format changes:
   - can break extraction regex/token assumptions.
4. Tunnel session dropped:
   - phone test URL dies if `cloudflared` terminal closes.

### Performance bottlenecks

1. Frequent geocoding on rapid typing:
   - mitigated with short debounce + cache.
2. Live reroute on noisy GPS:
   - throttled by cooldown and off-route threshold.
3. Very long routes with many steps:
   - instruction list is truncated for UI sanity.

### Edge cases handled

- Duty ID vs place-name ambiguity.
- Exact UK postcode boost and token scoring.
- Missing ORS key -> OSRM fallback.
- ORS avoid-road options invalid for fallback -> retry without excludes.
- Empty/invalid GPS values ignored.
- A6 timeline split into Outbound/Return display.

### Edge cases not fully handled yet

- Weak GPS in urban canyons/tunnels can cause false off-route.
- No offline maps/routing.
- No live ETA/traffic updates.
- No secure backend key management (key is client-side).

### Weird but deliberate behavior

1. `Start` always reanchors to current GPS, even if preview was elsewhere.
   - deliberate: satnav should start from where vehicle actually is.
2. Preview and navigation camera behave differently:
   - preview centers destination; navigation follows driver marker.
3. Route simplification in duty extraction:
   - intentionally drops noisy non-driving loops for cleaner prototype behavior.

---

## 6. Next Steps

### What still needs building

1. True production nav engine quality:
   - stronger map matching, lane-level guidance where possible.
2. Real-time traffic + incident-aware rerouting.
3. Better ETA model (traffic + dwell times + duty constraints).
4. Route/duty admin interface (upload/manage without editing JSON files).
5. Native mobile packaging (PWA/native shell) for reliability.

### Technical debt

1. Single large `app.js` (high coupling).
2. No automated tests (routing logic, extractors, UI state).
3. Client-side API key handling only.
4. Regex-heavy PDF parsing can be brittle over time.

### Recommended priorities

1. Split `app.js` into modules:
   - `routing.js`, `geocode.js`, `nav.js`, `ui.js`, `settings.js`.
2. Add smoke tests for:
   - duty extraction outputs,
   - route-plan flow,
   - reroute trigger behavior.
3. Add lightweight backend proxy:
   - protects API keys, adds request logging/rate control.
4. Add “drive test logging mode”:
   - record GPS trace + reroute events to debug real-world runs.
5. Build import pipeline for new duty cards:
   - validation report of unmatched stop events.

---

## Quick Debug Playbook

### “It doesn’t load on phone”

1. Check server terminal still running (`python3 -m http.server 8080`).
2. Check tunnel terminal still running (`cloudflared tunnel --url http://localhost:8080`).
3. Reopen URL in private tab.

### “No location”

1. Re-check browser location permission.
2. Verify you opened via `localhost`, LAN IP, or HTTPS tunnel.
3. Tap `Start` while outside with better GPS sky view.

### “Route not coach-safe”

1. Ensure ORS key is set in Routing Setup.
2. Confirm vehicle dimensions/weight are filled.
3. If ORS fails, app falls back to car/OSRM (less restrictive).

### “Wrong destination picked from search”

1. Enter fuller query (postcode + road/building).
2. Wait for preview pin and verify map center before pressing `Start`.
3. If needed, choose exact NX stop from Stops panel.

---

## Command Reference

Run app:
```bash
cd "/Users/k_ncube/Documents/New project"
python3 -m http.server 8080
```

Expose to internet for phone driving test:
```bash
cloudflared tunnel --url http://localhost:8080
```

Refresh stop data from Excel:
```bash
python3 scripts/extract_stops.py
```

Refresh duty data from PDF:
```bash
python3 scripts/extract_duties.py
```
