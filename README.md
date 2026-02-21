# NX Coach Route Prototype

Prototype satnav-style planner for UK National Express-style routes.

## What this does

- Loads stops and postcodes from `NX_Stops.xlsx` via generated `stops.json`.
- Uses a single destination input where driver can type a duty number, UK postcode, or place name.
- Adds a fixed top road bar with menu (left), current road label (center), and settings (right).
- Always starts route planning from current GPS location.
- Includes a National Express stops selector for optional extra waypoints.
- If destination input matches a duty number, loads that duty stop order + timeline.
- Shows duty timings/events extracted from the PDF.
- Plots selected route on an interactive map.
- Supports `Road` and `Satellite` basemap switching.
- Adds Street View shortcuts (map center or first planned stop).
- Adds live GPS driving guidance:
  - follows driver position on map,
  - transitions from overhead route preview to chase-camera navigation when `Start Nav` is tapped,
  - keeps map UI uncluttered in active navigation by collapsing full search controls and showing a bottom search icon,
  - shows dynamic next-turn instruction,
  - warns when off-route,
  - auto-reroutes from current GPS position when off-route (configurable),
  - tap speaker icon to toggle voice prompts,
  - uses miles/yards or km/meters (setting),
  - selectable live vehicle icon (`Coach`/`Truck`/`Car`),
  - speed-aware zoom and heading-follow camera smoothing.
- Route-road styling overlays:
  - motorway segments highlighted navy blue,
  - A-road segments highlighted orange.
- Tries **HGV/large-vehicle** routing via OpenRouteService `driving-hgv` when API key is provided.
- Falls back to regular driving route when HGV route is unavailable.
- Shows turn-by-turn directions.

## Files

- `NX_Stops.xlsx`: source stop data.
- `New Duty Cards.pdf`: source duty cards.
- `scripts/extract_stops.py`: converts Excel to JSON.
- `scripts/extract_duties.py`: converts duty PDF to JSON.
- `stops.json`: normalized stop list used by app.
- `duties.json`: extracted duty routes + timings.
- `index.html`, `styles.css`, `app.js`: prototype app.

## Run locally

Use a local web server (required for `fetch` in browser):

```bash
python3 -m http.server 8080
```

Then open:

- [http://localhost:8080](http://localhost:8080)

## Setup OpenRouteService key (optional but recommended)

1. Create a free account and API key at [https://openrouteservice.org/](https://openrouteservice.org/)
2. Paste key into the app input field.
3. Enter a destination and click **Start**.

Without a key, the app still routes using fallback road profile (not HGV-constrained).

Street View buttons open Google Maps Street View in a new browser tab.

Live GPS guidance requires browser location permission (works on `localhost`).

## Navigation usage

1. Enter destination target in the top search bar (`Search duty, postcode, or destination`):
   - duty number (example: `201`), or
   - postcode/place (example: `BN1 1EL` or `Brighton`).
2. Tap `Stops` to open the stop sheet and optionally add `National Express` waypoints.
3. Tap `Settings` to change units, route color, voice, reroute, and road-avoidance options.
4. After destination selection, the app automatically previews the full route in overhead view.
5. Tap `Start Nav` to begin chase-camera live guidance from current location.
6. During active navigation, map camera follows with smooth zoom changes by speed and maneuver context.

## Refresh stop data after Excel changes

```bash
python3 scripts/extract_stops.py
```

This regenerates `stops.json`.

## Refresh duty data after PDF changes

```bash
python3 scripts/extract_duties.py
```

This regenerates `duties.json`.

Duty parsing rules currently prioritize clean navigation legs:
- `A6`: first outbound (`Paddington -> Stansted`) plus first return (`Stansted -> Paddington`) after stand/break.
- `400`: first outbound leg (`London Victoria -> Birmingham Digbeth`).
- `450`: first outbound leg (`London Victoria -> Nottingham Broad Marsh`).
- `025/25`: first outbound leg (`London Victoria -> Brighton`).
