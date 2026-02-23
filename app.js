const STORAGE_KEY = "nx_ors_key";
const STORAGE_VEHICLE_ICON_KEY = "nx_vehicle_icon";
const STORAGE_SETTINGS_KEY = "nx_nav_settings";
const STORAGE_GEOCODE_CACHE_KEY = "nx_geocode_cache";
const STORAGE_TELEMETRY_KEY = "nx_telemetry";
const STORAGE_LAST_ROUTE_KEY = "nx_last_route_geojson";
const STORAGE_CAMERA_CHASE_OFFSET_KEY = "nx_camera_chase_offset_px";
const SETTINGS_SCHEMA_VERSION = 2;
const DEFAULT_MAP_CENTER = [53.5, -1.75];
const DEFAULT_MAP_ZOOM = 6;
const DEFAULT_SUMMARY_TEXT = "No route planned yet.";
const DEFAULT_NAV_STATUS_TEXT = "Next guidance will appear here after route + GPS start.";
const DEFAULT_GPS_STATUS_TEXT = "GPS not started.";
const DEFAULT_TOP_ROAD_NAME = "Unnamed road";
const OFF_ROUTE_THRESHOLD_METERS = 120;
const OFF_ROUTE_TRIGGER_STREAK = 3;
const MAX_MATCH_BACKTRACK_METERS = 35;
const MATCH_PROGRESS_FLOOR_BACKTRACK_METERS = 25;
const HEADING_RELIABLE_SPEED_MPS = 2;
const HEADING_PENALTY_PER_DEG = 0.45;
const PROMPT_FAR_METERS = 500;
const PROMPT_NEAR_METERS = 180;
const PROMPT_NOW_METERS = 35;
const ARRIVAL_NEAR_METERS = 25;
const GUIDANCE_SNAP_THRESHOLD_METERS = 180;
const REROUTE_COOLDOWN_MS = 30000;
const CAMERA_CENTER_LERP = 0.24;
const CAMERA_BEARING_LERP = 0.2;
const CAMERA_MAX_LEAD_METERS = 320;
const CAMERA_MIN_LEAD_METERS = 55;
const CAMERA_FORWARD_LOOKAHEAD_METERS = 85;
const CAMERA_LOOKAHEAD_MIN_METERS = 18;
const CAMERA_LOOKAHEAD_MAX_METERS = 140;
const CAMERA_FOLLOW_PAUSE_MS = 15000;
const CAMERA_CHASE_PAN_DURATION_S = 0.5;
const CAMERA_PROGRAMMATIC_HOLD_MS = 520;
const CAMERA_CHASE_ENTRY_MIN_ZOOM = 15.8;
const DEFAULT_CAMERA_CHASE_OFFSET_PX = 140;
const CAMERA_CHASE_OFFSET_MIN_PX = 0;
const CAMERA_CHASE_OFFSET_MAX_PX = 420;
const DRIVER_MOTION_BASE_LERP = 0.26;
const DRIVER_MOTION_MAX_LERP = 0.46;
const DRIVER_HEADING_LERP = 0.28;
const DRIVER_ANIMATION_SETTLE_METERS = 0.8;
const DRIVER_ANIMATION_SETTLE_DEG = 2.5;
const DRIVER_INTERPOLATION_MS = 700;
const POSITION_PROCESS_THROTTLE_MS = 700;
const CAMERA_MIN_UPDATE_MOVE_METERS = 1.2;
const CAMERA_MIN_UPDATE_BEARING_DEG = 1;
const MINIMAL_STABLE_NAV_MODE = true;
const MINIMAL_STABLE_NAV_NORTH_UP = true;
const MINIMAL_STABLE_CHASE_OFFSET_PX = 96;
const ROAD_STYLE_COLORS = {
  motorway: "#123b84",
  aRoad: "#f29a2e",
  other: "#5bc4ff",
};
const ROAD_TYPE_BADGES = {
  motorway: "Motorway",
  aRoad: "A-road",
};
const PREFERRED_SPEECH_LANGS = ["en-GB", "en_GB", "en-UK", "en"];
const SPEECH_START_TIMEOUT_MS = 1800;
const SPEECH_WARNING_THROTTLE_MS = 7000;
const SEARCH_DRAG_MARGIN_PX = 10;
const TELEMETRY_MAX_SAMPLES = 25000;
const TELEMETRY_SNAPSHOT_INTERVAL_MS = 1200;
const HAZARD_PROXIMITY_METERS = 35;
const HAZARD_LOOKAHEAD_METERS = 1600;
const HAZARD_PREFILTER_MULTIPLIER = 4;
const HAZARD_STRICT_MATCH_METERS = 12;
const MIN_WIDTH_WARNING_METERS = 2.8;
const MAX_PROGRESS_JUMP_METERS = 140;
const BASE_ROUTE_LINE_WEIGHT = 7;
const BASE_ROUTE_LINE_OPACITY = 0.9;
const BASE_ROAD_STYLE_OTHER_WEIGHT = 6;
const BASE_ROAD_STYLE_OTHER_OPACITY = 0.92;
const LEGACY_RED_ROUTE_COLORS = new Set(["#ff3b30", "#ff0000", "#e53935", "#d32f2f"]);
const DEFAULT_PROVIDER_ENDPOINTS = {
  orsBaseUrl: "https://api.openrouteservice.org",
  osrmBaseUrl: "https://router.project-osrm.org",
  geocoderBaseUrl: "https://nominatim.openstreetmap.org",
  postcodeBaseUrl: "https://api.postcodes.io",
};
const PUBLIC_ENDPOINTS_SIGNATURE = JSON.stringify(DEFAULT_PROVIDER_ENDPOINTS);
const DEFAULT_SETTINGS = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  units: "imperial",
  routeColor: "#1d8fff",
  voiceEnabled: true,
  voiceName: "",
  voiceRate: 1,
  autoReroute: true,
  cameraFollow: true,
  coachProfile: "safe",
  routingProvider: "auto",
  orsBaseUrl: DEFAULT_PROVIDER_ENDPOINTS.orsBaseUrl,
  osrmBaseUrl: DEFAULT_PROVIDER_ENDPOINTS.osrmBaseUrl,
  geocoderBaseUrl: DEFAULT_PROVIDER_ENDPOINTS.geocoderBaseUrl,
  postcodeBaseUrl: DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl,
  usePublicFallback: true,
  telemetryEnabled: true,
  hideTraveledRoute: true,
  avoidMotorways: false,
  avoidTolls: false,
  avoidFerries: false,
};

const state = {
  stops: [],
  stopById: new Map(),
  duties: [],
  loadedDuty: null,
  viaStopIds: [],
  geocodeCache: new Map(),
  routeLayer: null,
  roadStyleLayer: null,
  markerLayer: null,
  laneGuidanceText: "",
  activeHazards: [],
  lowBridgeHazards: [],
  narrowRoadHazards: [],
  hazardsReady: false,
  driverMarker: null,
  driverMotionTarget: null,
  driverMotionCurrent: null,
  driverMotionAnimation: null,
  driverAnimationFrameId: null,
  gpsWatchId: null,
  routeGuide: null,
  lastGuidanceStepIndex: -1,
  lastSpokenStepIndex: -1,
  lastLivePosition: null,
  voiceGuidanceEnabled: true,
  previewMarker: null,
  previewTimer: null,
  previewRequestId: 0,
  stopsSheetOpen: false,
  settingsSheetOpen: false,
  navigationMode: false,
  navCameraInitialized: false,
  cameraFollowEnabled: true,
  cameraFollowPausedUntil: 0,
  cameraProgrammaticMove: false,
  lastCameraPauseAt: 0,
  rerouteInFlight: false,
  lastRerouteAt: 0,
  lastMatchedProgressMeters: 0,
  offRouteSampleCount: 0,
  spokenStepStages: new Map(),
  lastGpsSample: null,
  lastHeadingDeg: Number.NaN,
  arrivalAnnounced: false,
  navCameraState: null,
  lastGuidanceUpdateAt: 0,
  routePreviewReady: false,
  routePreviewInFlight: false,
  lastPlanSignature: "",
  navSearchOverlayOpen: false,
  searchOverlayPosition: null,
  searchDragSession: null,
  navStableZoom: null,
  orientation: "portrait",
  currentRoadName: DEFAULT_TOP_ROAD_NAME,
  speechSupported: false,
  speechPrimed: false,
  speechVoiceName: "",
  lastSpeechWarningAt: 0,
  telemetry: {
    startedAt: 0,
    endedAt: 0,
    samples: [],
  },
  replaySession: null,
  lastTelemetrySampleAt: 0,
  pendingLivePosition: null,
  pendingPositionTimerId: null,
  lastProcessedPositionAt: 0,
  rawGpsUpdateCount: 0,
  processedGpsUpdateCount: 0,
  simulatedGpsTimerId: null,
  publicEndpointWarned: false,
  currentPlan: null,
  settings: { ...DEFAULT_SETTINGS },
  cameraChaseOffsetPx: DEFAULT_CAMERA_CHASE_OFFSET_PX,
  hazardsPreloadStarted: false,
};

const el = {
  appShell: document.querySelector(".app-shell"),
  floatingTop: document.querySelector(".floating-top"),
  searchDragHandle: document.getElementById("search-drag-handle"),
  topSettingsBtn: document.getElementById("top-settings-btn"),
  topRoadName: document.getElementById("top-road-name"),
  keyInput: document.getElementById("ors-key"),
  targetInput: document.getElementById("target-input"),
  targetOptions: document.getElementById("target-options"),
  nxStopSelect: document.getElementById("nx-stop"),
  heightInput: document.getElementById("vehicle-height"),
  widthInput: document.getElementById("vehicle-width"),
  lengthInput: document.getElementById("vehicle-length"),
  weightInput: document.getElementById("vehicle-weight"),
  vehicleIconSelect: document.getElementById("vehicle-icon"),
  addViaBtn: document.getElementById("add-via"),
  viaList: document.getElementById("via-list"),
  planBtn: document.getElementById("plan-route"),
  toggleStopsBtn: document.getElementById("toggle-stops"),
  closeStopsBtn: document.getElementById("close-stops"),
  stopsSheet: document.getElementById("stops-sheet"),
  toggleSettingsBtn: document.getElementById("toggle-settings"),
  closeSettingsBtn: document.getElementById("close-settings"),
  settingsSheet: document.getElementById("settings-sheet"),
  status: document.getElementById("status"),
  summary: document.getElementById("summary"),
  directions: document.getElementById("directions"),
  dutyTimeline: document.getElementById("duty-timeline"),
  stopGuidanceBtn: document.getElementById("stop-guidance"),
  navSearchFab: document.getElementById("nav-search-fab"),
  navRecenterFab: document.getElementById("nav-recenter-fab"),
  voiceGuidanceToggle: document.getElementById("voice-guidance-toggle"),
  gpsStatus: document.getElementById("gps-status"),
  navStatus: document.getElementById("nav-status"),
  laneStatus: document.getElementById("lane-status"),
  settingUnits: document.getElementById("setting-units"),
  settingRouteColor: document.getElementById("setting-route-color"),
  settingVoiceEnabled: document.getElementById("setting-voice-enabled"),
  settingVoiceName: document.getElementById("setting-voice-name"),
  settingVoiceRate: document.getElementById("setting-voice-rate"),
  settingVehicleIconSearch: document.getElementById("setting-vehicle-icon-search"),
  settingAutoReroute: document.getElementById("setting-auto-reroute"),
  settingCameraFollow: document.getElementById("setting-camera-follow"),
  settingCoachProfile: document.getElementById("setting-coach-profile"),
  settingRoutingProvider: document.getElementById("setting-routing-provider"),
  settingOrsBaseUrl: document.getElementById("setting-ors-base-url"),
  settingOsrmBaseUrl: document.getElementById("setting-osrm-base-url"),
  settingGeocoderBaseUrl: document.getElementById("setting-geocoder-base-url"),
  settingPostcodeBaseUrl: document.getElementById("setting-postcode-base-url"),
  settingUsePublicFallback: document.getElementById("setting-use-public-fallback"),
  settingTelemetryEnabled: document.getElementById("setting-telemetry-enabled"),
  settingAvoidMotorways: document.getElementById("setting-avoid-motorways"),
  settingAvoidTolls: document.getElementById("setting-avoid-tolls"),
  settingAvoidFerries: document.getElementById("setting-avoid-ferries"),
  telemetryExportBtn: document.getElementById("telemetry-export"),
  telemetryClearBtn: document.getElementById("telemetry-clear"),
  telemetryReplayStartBtn: document.getElementById("telemetry-replay-start"),
  telemetryReplayStopBtn: document.getElementById("telemetry-replay-stop"),
  open3DPreviewBtn: document.getElementById("open-3d-preview"),
};

const map = L.map("map", {
  zoomControl: true,
  dragging: true,
  touchZoom: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  boxZoom: true,
  keyboard: true,
  inertia: true,
  rotate: true,
  touchRotate: true,
  bearing: 0,
}).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

const roadLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  keepBuffer: 10,
  updateWhenZooming: false,
  attribution: "&copy; OpenStreetMap contributors",
});

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    keepBuffer: 10,
    updateWhenZooming: false,
    attribution: "Tiles &copy; Esri",
  },
);

roadLayer.addTo(map);

L.control
  .layers(
    {
      Road: roadLayer,
      Satellite: satelliteLayer,
    },
    null,
    { collapsed: true },
  )
  .addTo(map);

state.markerLayer = L.layerGroup().addTo(map);
state.roadStyleLayer = L.layerGroup().addTo(map);

init().catch((error) => {
  setStatus(`Failed to initialize app: ${error.message}`, "err");
});

async function init() {
  state.geocodeCache = loadPersistentGeocodeCache();
  state.telemetry = loadTelemetryState();
  state.settings = loadSettings();
  state.voiceGuidanceEnabled = Boolean(state.settings.voiceEnabled);
  state.cameraFollowEnabled = Boolean(state.settings.cameraFollow);
  initializeSpeechEngine();
  loadCameraChaseOffset();

  const storedKey = localStorage.getItem(STORAGE_KEY);
  if (storedKey) {
    el.keyInput.value = storedKey;
  }

  const storedVehicleIcon = localStorage.getItem(STORAGE_VEHICLE_ICON_KEY);
  const initialVehicleIcon =
    storedVehicleIcon && ["coach", "truck", "car"].includes(storedVehicleIcon)
      ? storedVehicleIcon
      : getSelectedVehicleIcon();
  setVehicleIconByKey(initialVehicleIcon, false);

  el.keyInput.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEY, el.keyInput.value.trim());
  });
  if (el.vehicleIconSelect) {
    el.vehicleIconSelect.addEventListener("change", () => {
      setVehicleIconByKey(el.vehicleIconSelect.value);
    });
  }
  if (el.settingVehicleIconSearch) {
    el.settingVehicleIconSearch.addEventListener("change", handleVehicleSearchChange);
    el.settingVehicleIconSearch.addEventListener("blur", handleVehicleSearchChange);
  }

  el.targetInput.addEventListener("input", () => {
    updateStartButtonState();
    markRoutePreviewDirty();
    queueDestinationPreview();
  });
  el.targetInput.addEventListener("change", () => {
    updateStartButtonState();
    markRoutePreviewDirty();
    queueDestinationPreview(true);
    previewRouteAfterTargetSelection().catch(() => {
      // Preview failures are surfaced in status text by handlePlanRoute.
    });
  });
  el.targetInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    if (el.planBtn.disabled) {
      return;
    }
    event.preventDefault();
    handleStartRoute();
  });
  el.addViaBtn.addEventListener("click", handleAddVia);
  el.viaList.addEventListener("click", handleViaListClick);
  el.planBtn.addEventListener("click", handleStartRoute);
  if (el.topSettingsBtn) {
    el.topSettingsBtn.addEventListener("click", () => setSettingsSheetOpen(!state.settingsSheetOpen));
  }
  el.toggleStopsBtn.addEventListener("click", () => setStopsSheetOpen(!state.stopsSheetOpen));
  el.closeStopsBtn.addEventListener("click", () => setStopsSheetOpen(false));
  el.toggleSettingsBtn.addEventListener("click", () => setSettingsSheetOpen(!state.settingsSheetOpen));
  el.closeSettingsBtn.addEventListener("click", () => setSettingsSheetOpen(false));
  if (el.stopGuidanceBtn) {
    el.stopGuidanceBtn.addEventListener("click", stopLiveGuidance);
  }
  if (el.navSearchFab) {
    el.navSearchFab.addEventListener("click", handleNavSearchFabClick);
  }
  if (el.navRecenterFab) {
    el.navRecenterFab.addEventListener("click", handleNavRecenterClick);
  }
  if (el.searchDragHandle) {
    el.searchDragHandle.addEventListener("pointerdown", handleSearchDragStart);
  }
  window.addEventListener("pointermove", handleSearchDragMove);
  window.addEventListener("pointerup", handleSearchDragEnd);
  window.addEventListener("pointercancel", handleSearchDragEnd);
  el.voiceGuidanceToggle.addEventListener("click", handleVoiceGuidanceToggleClick);
  el.settingUnits.addEventListener("change", handleSettingsInputChange);
  el.settingRouteColor.addEventListener("input", handleSettingsInputChange);
  el.settingVoiceEnabled.addEventListener("change", handleSettingsInputChange);
  if (el.settingVoiceName) {
    el.settingVoiceName.addEventListener("change", handleSettingsInputChange);
  }
  el.settingVoiceRate.addEventListener("input", handleSettingsInputChange);
  el.settingAutoReroute.addEventListener("change", handleSettingsInputChange);
  if (el.settingCameraFollow) {
    el.settingCameraFollow.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingCoachProfile) {
    el.settingCoachProfile.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingRoutingProvider) {
    el.settingRoutingProvider.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingOrsBaseUrl) {
    el.settingOrsBaseUrl.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingOsrmBaseUrl) {
    el.settingOsrmBaseUrl.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingGeocoderBaseUrl) {
    el.settingGeocoderBaseUrl.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingPostcodeBaseUrl) {
    el.settingPostcodeBaseUrl.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingUsePublicFallback) {
    el.settingUsePublicFallback.addEventListener("change", handleSettingsInputChange);
  }
  if (el.settingTelemetryEnabled) {
    el.settingTelemetryEnabled.addEventListener("change", handleSettingsInputChange);
  }
  el.settingAvoidMotorways.addEventListener("change", handleSettingsInputChange);
  el.settingAvoidTolls.addEventListener("change", handleSettingsInputChange);
  el.settingAvoidFerries.addEventListener("change", handleSettingsInputChange);
  if (el.telemetryExportBtn) {
    el.telemetryExportBtn.addEventListener("click", exportTelemetryLog);
  }
  if (el.telemetryClearBtn) {
    el.telemetryClearBtn.addEventListener("click", clearTelemetryLog);
  }
  if (el.telemetryReplayStartBtn) {
    el.telemetryReplayStartBtn.addEventListener("click", startTelemetryReplay);
  }
  if (el.telemetryReplayStopBtn) {
    el.telemetryReplayStopBtn.addEventListener("click", stopTelemetryReplay);
  }
  if (el.open3DPreviewBtn) {
    el.open3DPreviewBtn.addEventListener("click", open3DPreviewWindow);
  }
  window.addEventListener("resize", handleOrientationMaybeChanged);
  window.addEventListener("orientationchange", handleOrientationMaybeChanged);
  document.addEventListener("visibilitychange", handleVisibilityMaybeChanged);
  map.on("dragstart", handleMapUserInteractionStart);
  map.on("zoomstart", handleMapUserInteractionStart);
  map.on("rotatestart", handleMapUserInteractionStart);

  const response = await fetch("./stops.json");
  if (!response.ok) {
    throw new Error("Unable to load stops.json");
  }

  state.stops = await response.json();
  state.stops.forEach((stop) => state.stopById.set(String(stop.id), stop));

  const dutyResponse = await fetch("./duties.json");
  if (!dutyResponse.ok) {
    throw new Error("Unable to load duties.json");
  }
  state.duties = await dutyResponse.json();

  populateStopSelect(el.nxStopSelect, true);
  populateTargetOptions();
  updateStartButtonState();
  setRoadName(DEFAULT_TOP_ROAD_NAME);
  updateSettingsUI();
  updateVoiceGuidanceButton();
  setStopsSheetOpen(false);
  setSettingsSheetOpen(false);
  applyNavigationChromeState();
  updateOrientationClass();

  setStatus(`Loaded ${state.stops.length} stops and ${state.duties.length} duties.`, "ok");
  warnIfUsingPublicEndpoints();
  registerServiceWorker();
  scheduleHazardPreload();
}

function populateStopSelect(select, includePlaceholder = false) {
  select.innerHTML = "";

  if (includePlaceholder) {
    const placeholder = new Option("Choose stop", "");
    select.add(placeholder);
  }

  for (const stop of state.stops) {
    const option = new Option(`${stop.name} (${stop.postcode})`, stop.id);
    select.add(option);
  }
}

function findDutyById(dutyId) {
  const normalized = normalizeDutyId(dutyId);
  return state.duties.find((item) => normalizeDutyId(item.dutyId) === normalized);
}

function findDutyFromInput(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }
  const direct = findDutyById(raw);
  if (direct) {
    return direct;
  }
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  const dutyPrefix = compact.replace(/^DUTY/, "");
  if (dutyPrefix) {
    const prefixed = findDutyById(dutyPrefix);
    if (prefixed) {
      return prefixed;
    }
  }
  const tokenMatch = compact.match(/\d{2,4}[A-Z]?/);
  if (tokenMatch) {
    return findDutyById(tokenMatch[0]);
  }
  return null;
}

function populateTargetOptions() {
  if (!el.targetOptions) {
    return;
  }
  el.targetOptions.innerHTML = "";

  for (const duty of state.duties) {
    const option = document.createElement("option");
    option.value = String(duty.dutyId);
    option.label = duty.label || `Duty ${duty.dutyId}`;
    el.targetOptions.append(option);
  }

  for (const stop of state.stops) {
    const postcodeOption = document.createElement("option");
    postcodeOption.value = String(stop.postcode);
    postcodeOption.label = stop.name;
    el.targetOptions.append(postcodeOption);

    const nameOption = document.createElement("option");
    nameOption.value = String(stop.name);
    nameOption.label = stop.postcode;
    el.targetOptions.append(nameOption);
  }
}

function loadDutyIntoState(duty) {
  const rawIds = Array.isArray(duty.stopIds) ? duty.stopIds : [];
  const validStopIds = collapseConsecutiveDuplicateStopIds(rawIds.map((id) => String(id)).filter((id) => state.stopById.has(id)));
  if (validStopIds.length < 2) {
    throw new Error(`Duty ${duty.dutyId} has too few matched stops for route planning.`);
  }

  state.loadedDuty = {
    dutyId: duty.dutyId,
    stopIds: validStopIds,
    routeCodes: Array.isArray(duty.routeCodes) ? duty.routeCodes : [],
    timeline: Array.isArray(duty.timeline) ? duty.timeline : [],
    unmatchedEvents: Array.isArray(duty.unmatchedEvents) ? duty.unmatchedEvents : [],
  };
  renderDutyTimeline();
}

function updateStartButtonState() {
  el.planBtn.disabled = !String(el.targetInput.value || "").trim();
  if (el.planBtn.disabled) {
    el.planBtn.textContent = "Start";
    return;
  }
  const signature = buildPlanSignature();
  const readyForNav = state.routePreviewReady && state.lastPlanSignature === signature && Boolean(state.routeGuide);
  el.planBtn.textContent = readyForNav ? "Start Nav" : "Start";
}

function setRoadName(roadName) {
  const normalized = String(roadName || "").trim();
  state.currentRoadName = normalized || DEFAULT_TOP_ROAD_NAME;
  if (el.topRoadName) {
    el.topRoadName.textContent = state.currentRoadName;
  }
}

function handleNavSearchFabClick() {
  if (!state.navigationMode) {
    return;
  }
  state.navSearchOverlayOpen = !state.navSearchOverlayOpen;
  if (!state.navSearchOverlayOpen) {
    state.searchDragSession = null;
  }
  applyNavigationChromeState();
  if (state.navSearchOverlayOpen) {
    el.targetInput.focus();
    el.targetInput.select();
  }
}

function isGpsFollowEnabled() {
  return Boolean(state.cameraFollowEnabled);
}

function maybeResumeCameraFollow() {
  if (state.cameraFollowEnabled) {
    return;
  }
  if (!state.settings.cameraFollow) {
    return;
  }
  if (!Number.isFinite(state.cameraFollowPausedUntil) || state.cameraFollowPausedUntil <= 0) {
    return;
  }
  if (Date.now() < state.cameraFollowPausedUntil) {
    return;
  }
  state.cameraFollowEnabled = true;
  state.cameraFollowPausedUntil = 0;
  state.navCameraInitialized = false;
  if (el.settingCameraFollow) {
    el.settingCameraFollow.checked = true;
  }
  setStatus("Camera follow resumed.", "ok");
}

function handleMapUserInteractionStart() {
  if (!state.navigationMode || state.cameraProgrammaticMove) {
    return;
  }
  if (!state.cameraFollowEnabled) {
    return;
  }
  state.cameraFollowEnabled = false;
  state.cameraFollowPausedUntil = Date.now() + CAMERA_FOLLOW_PAUSE_MS;
  const now = Date.now();
  if (now - state.lastCameraPauseAt > 5000) {
    state.lastCameraPauseAt = now;
    setStatus("Camera follow paused after manual map move. Tap ◎ to recenter.", "warn");
  }
}

function handleVehicleSearchChange() {
  if (!el.settingVehicleIconSearch) {
    return;
  }
  const normalized = normalizeVehicleIconQuery(el.settingVehicleIconSearch.value);
  if (!normalized) {
    return;
  }
  setVehicleIconByKey(normalized);
}

function normalizeVehicleIconQuery(value) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) {
    return "";
  }
  if (["coach", "bus", "minibus"].includes(input)) {
    return "coach";
  }
  if (["truck", "lorry", "hgv", "van"].includes(input)) {
    return "truck";
  }
  if (["car", "taxi", "saloon", "sedan"].includes(input)) {
    return "car";
  }
  return "";
}

function handleSearchDragStart(event) {
  if (!state.navigationMode || !state.navSearchOverlayOpen) {
    return;
  }
  if (!el.floatingTop) {
    return;
  }
  event.preventDefault();
  const rect = el.floatingTop.getBoundingClientRect();
  state.searchDragSession = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };
  if (typeof el.searchDragHandle?.setPointerCapture === "function") {
    el.searchDragHandle.setPointerCapture(event.pointerId);
  }
}

function handleSearchDragMove(event) {
  if (!state.searchDragSession || state.searchDragSession.pointerId !== event.pointerId) {
    return;
  }
  if (!el.floatingTop) {
    return;
  }
  event.preventDefault();
  const targetX = event.clientX - state.searchDragSession.offsetX;
  const targetY = event.clientY - state.searchDragSession.offsetY;
  const clamped = clampSearchOverlayPosition(targetX, targetY);
  state.searchOverlayPosition = clamped;
  applySearchOverlayPosition();
}

function handleSearchDragEnd(event) {
  if (!state.searchDragSession || state.searchDragSession.pointerId !== event.pointerId) {
    return;
  }
  state.searchDragSession = null;
}

function clampSearchOverlayPosition(x, y) {
  if (!el.floatingTop) {
    return { x: 0, y: 0 };
  }
  const rect = el.floatingTop.getBoundingClientRect();
  const maxX = Math.max(SEARCH_DRAG_MARGIN_PX, window.innerWidth - rect.width - SEARCH_DRAG_MARGIN_PX);
  const maxY = Math.max(SEARCH_DRAG_MARGIN_PX, window.innerHeight - rect.height - SEARCH_DRAG_MARGIN_PX);
  return {
    x: clamp(x, SEARCH_DRAG_MARGIN_PX, maxX),
    y: clamp(y, SEARCH_DRAG_MARGIN_PX, maxY),
  };
}

function applySearchOverlayPosition() {
  if (!el.floatingTop) {
    return;
  }
  if (!state.navigationMode || !state.navSearchOverlayOpen || !state.searchOverlayPosition) {
    el.floatingTop.classList.remove("floating-top-dragged");
    el.floatingTop.style.left = "";
    el.floatingTop.style.top = "";
    el.floatingTop.style.transform = "";
    return;
  }
  const clamped = clampSearchOverlayPosition(state.searchOverlayPosition.x, state.searchOverlayPosition.y);
  state.searchOverlayPosition = clamped;
  el.floatingTop.classList.add("floating-top-dragged");
  el.floatingTop.style.left = `${clamped.x}px`;
  el.floatingTop.style.top = `${clamped.y}px`;
  el.floatingTop.style.transform = "none";
}

function handleNavRecenterClick() {
  state.cameraFollowEnabled = true;
  state.cameraFollowPausedUntil = 0;
  if (el.settingCameraFollow) {
    el.settingCameraFollow.checked = Boolean(state.settings.cameraFollow);
  }
  recenterCameraToLivePosition(true);
  setStatus("Camera recentered and follow resumed.", "ok");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Service worker registration failures should not block navigation.
  });
}

function loadPersistentGeocodeCache() {
  try {
    const raw = localStorage.getItem(STORAGE_GEOCODE_CACHE_KEY);
    if (!raw) {
      return new Map();
    }
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) {
      return new Map();
    }
    const mapCache = new Map();
    for (const entry of entries) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        continue;
      }
      const key = String(entry[0] || "");
      const value = entry[1];
      if (!key || !value || typeof value !== "object") {
        continue;
      }
      mapCache.set(key, value);
    }
    return mapCache;
  } catch {
    return new Map();
  }
}

function persistGeocodeCache() {
  try {
    const entries = Array.from(state.geocodeCache.entries()).slice(-600);
    localStorage.setItem(STORAGE_GEOCODE_CACHE_KEY, JSON.stringify(entries));
  } catch {
    // Best effort cache persistence.
  }
}

function loadTelemetryState() {
  try {
    const raw = localStorage.getItem(STORAGE_TELEMETRY_KEY);
    if (!raw) {
      return { startedAt: 0, endedAt: 0, samples: [], routeSnapshot: null };
    }
    const parsed = JSON.parse(raw);
    const samples = Array.isArray(parsed?.samples) ? parsed.samples.slice(-TELEMETRY_MAX_SAMPLES) : [];
    return {
      startedAt: Number(parsed?.startedAt) || 0,
      endedAt: Number(parsed?.endedAt) || 0,
      samples,
      routeSnapshot: parsed?.routeSnapshot || null,
    };
  } catch {
    return { startedAt: 0, endedAt: 0, samples: [], routeSnapshot: null };
  }
}

function persistTelemetryState() {
  try {
    localStorage.setItem(STORAGE_TELEMETRY_KEY, JSON.stringify(state.telemetry));
  } catch {
    // Ignore storage quota errors.
  }
}

function createRouteSnapshotForTelemetry() {
  if (!state.routeGuide || !Array.isArray(state.routeGuide.lineLatLngs) || state.routeGuide.lineLatLngs.length < 2) {
    return null;
  }
  return {
    lineLatLngs: state.routeGuide.lineLatLngs,
    guidanceSteps: state.routeGuide.guidanceSteps || [],
    totalDurationSeconds: Number(state.routeGuide.totalDurationSeconds) || 0,
    totalMeters: Number(state.routeGuide.totalMeters) || 0,
    waypointProgress: state.routeGuide.waypointProgress || [],
    labels: state.currentPlan?.labels || [],
    points: state.currentPlan?.points || [],
  };
}

function startTelemetrySession() {
  if (!state.settings.telemetryEnabled) {
    return;
  }
  state.lastTelemetrySampleAt = 0;
  state.telemetry = {
    startedAt: Date.now(),
    endedAt: 0,
    samples: [],
    routeSnapshot: createRouteSnapshotForTelemetry(),
  };
  persistTelemetryState();
}

function finishTelemetrySession() {
  if (!state.settings.telemetryEnabled) {
    return;
  }
  state.telemetry.endedAt = Date.now();
  persistTelemetryState();
}

function recordTelemetrySample(sample) {
  if (!state.settings.telemetryEnabled) {
    return;
  }
  const now = Date.now();
  if (now - state.lastTelemetrySampleAt < TELEMETRY_SNAPSHOT_INTERVAL_MS) {
    return;
  }
  state.lastTelemetrySampleAt = now;
  state.telemetry.samples.push(sample);
  if (state.telemetry.samples.length > TELEMETRY_MAX_SAMPLES) {
    state.telemetry.samples.splice(0, state.telemetry.samples.length - TELEMETRY_MAX_SAMPLES);
  }
  persistTelemetryState();
}

function exportTelemetryLog() {
  const samples = Array.isArray(state.telemetry?.samples) ? state.telemetry.samples : [];
  if (samples.length === 0) {
    setStatus("No telemetry captured yet.", "warn");
    return;
  }
  const blob = new Blob([JSON.stringify(state.telemetry, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date(state.telemetry.startedAt || Date.now()).toISOString().replace(/[:.]/g, "-");
  anchor.href = url;
  anchor.download = `nx-telemetry-${stamp}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function clearTelemetryLog() {
  state.telemetry = { startedAt: 0, endedAt: 0, samples: [], routeSnapshot: null };
  persistTelemetryState();
  stopTelemetryReplay();
  setStatus("Telemetry log cleared.", "ok");
}

function restoreRouteFromTelemetrySnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.lineLatLngs) || snapshot.lineLatLngs.length < 2) {
    return false;
  }
  if (state.routeLayer) {
    map.removeLayer(state.routeLayer);
  }
  state.routeLayer = L.polyline(snapshot.lineLatLngs, {
    color: "#8fc9ff",
    weight: 4,
    opacity: 0.9,
  }).addTo(map);
  state.routeGuide = buildRouteGuide(
    snapshot.lineLatLngs,
    snapshot.guidanceSteps || [],
    snapshot.points || [],
    snapshot.totalDurationSeconds,
  );
  evaluateRouteHazards();
  state.currentPlan = {
    points: (snapshot.points || []).map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) })),
    labels: (snapshot.labels || []).map((label) => ({ name: String(label.name || "Stop"), postcode: String(label.postcode || "") })),
  };
  return true;
}

function startTelemetryReplay() {
  if (state.replaySession) {
    return;
  }
  const samples = Array.isArray(state.telemetry?.samples) ? state.telemetry.samples : [];
  if (samples.length < 3) {
    setStatus("Not enough telemetry points to replay yet.", "warn");
    return;
  }
  if (state.gpsWatchId !== null) {
    setStatus("Stop live GPS guidance before replaying telemetry.", "warn");
    return;
  }

  restoreRouteFromTelemetrySnapshot(state.telemetry.routeSnapshot);
  state.navigationMode = true;
  state.cameraFollowEnabled = true;
  state.navCameraInitialized = false;
  state.navSearchOverlayOpen = false;
  state.lastMatchedProgressMeters = 0;
  applyNavigationChromeState();
  setGuidanceButtonsRunning(true);
  el.gpsStatus.textContent = "Telemetry replay running.";
  setStatus("Telemetry replay started.", "ok");

  const replay = {
    index: 0,
    samples,
    timerId: window.setInterval(() => {
      const sample = replay.samples[replay.index];
      if (!sample) {
        stopTelemetryReplay();
        return;
      }
      const lat = Number(sample.lat);
      const lon = Number(sample.lon);
      const headingDeg = Number(sample.headingDeg);
      const speedMps = Number(sample.speedMps);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        replay.index += 1;
        return;
      }
      state.lastLivePosition = { lat, lon };
      state.lastHeadingDeg = headingDeg;
      updateDriverMarkerMotion(lat, lon, headingDeg, speedMps);
      const fakePosition = {
        coords: {
          accuracy: Number(sample.accuracyMeters),
          speed: speedMps,
          heading: headingDeg,
        },
        timestamp: Number(sample.timestamp) || Date.now(),
      };
      const guidanceSnapshot = updateLiveGuidanceFromPoint(lat, lon, fakePosition, speedMps);
      updateNavigationCamera(lat, lon, speedMps, headingDeg, guidanceSnapshot);
      replay.index += 1;
      if (replay.index >= replay.samples.length) {
        stopTelemetryReplay();
      }
    }, 700),
  };
  state.replaySession = replay;
}

function stopTelemetryReplay() {
  if (!state.replaySession) {
    return;
  }
  window.clearInterval(state.replaySession.timerId);
  state.replaySession = null;
  setGuidanceButtonsRunning(false);
  el.gpsStatus.textContent = DEFAULT_GPS_STATUS_TEXT;
  setStatus("Telemetry replay stopped.", "ok");
}

function open3DPreviewWindow() {
  if (!state.routeGuide || !Array.isArray(state.routeGuide.lineLatLngs) || state.routeGuide.lineLatLngs.length < 2) {
    setStatus("Plan a route first to open 3D preview.", "warn");
    return;
  }
  const payload = {
    route: state.routeGuide.lineLatLngs,
    start: state.lastLivePosition || state.currentPlan?.points?.[0] || null,
    heading: Number(state.lastHeadingDeg),
  };
  localStorage.setItem(STORAGE_LAST_ROUTE_KEY, JSON.stringify(payload));
  window.open("./maplibre-preview.html", "_blank", "noopener,noreferrer");
}

function applyNavigationChromeState() {
  const navActive = Boolean(state.navigationMode);
  const searchOpen = navActive && Boolean(state.navSearchOverlayOpen);
  if (navActive && state.stopsSheetOpen) {
    setStopsSheetOpen(false);
  }
  el.appShell.classList.toggle("nav-active", navActive);
  el.appShell.classList.toggle("nav-search-open", searchOpen);
  if (!searchOpen) {
    state.searchDragSession = null;
  }
  applySearchOverlayPosition();
}

function handleOrientationMaybeChanged() {
  updateOrientationClass();
}

function handleVisibilityMaybeChanged() {
  if (document.hidden || !state.speechSupported) {
    return;
  }
  refreshSpeechVoicePreference();
  try {
    if (typeof window.speechSynthesis.resume === "function") {
      window.speechSynthesis.resume();
    }
  } catch {
    // Ignore browser-specific speech resume issues.
  }
}

function updateOrientationClass() {
  const landscape = window.matchMedia("(orientation: landscape)").matches;
  state.orientation = landscape ? "landscape" : "portrait";
  el.appShell.classList.toggle("orientation-landscape", landscape);
  el.appShell.classList.toggle("orientation-portrait", !landscape);
  applySearchOverlayPosition();
}

function initializeSpeechEngine() {
  state.speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  if (!state.speechSupported) {
    state.voiceGuidanceEnabled = false;
    state.settings = sanitizeSettings({
      ...state.settings,
      voiceEnabled: false,
      voiceName: "",
    });
    persistSettings();
    populateVoiceOptions();
    return;
  }
  refreshSpeechVoicePreference();
  if (typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", refreshSpeechVoicePreference);
  } else if ("onvoiceschanged" in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = refreshSpeechVoicePreference;
  }
}

function refreshSpeechVoicePreference() {
  if (!state.speechSupported) {
    populateVoiceOptions();
    return;
  }
  const voice = resolvePreferredSpeechVoice();
  state.speechVoiceName = voice?.name || "";
  populateVoiceOptions();
}

function resolvePreferredSpeechVoice() {
  if (!state.speechSupported) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) {
    return null;
  }

  const configuredVoiceName = String(state.settings?.voiceName || "").trim();
  if (configuredVoiceName) {
    const configured = voices.find((voice) => String(voice.name || "") === configuredVoiceName);
    if (configured) {
      return configured;
    }
  }

  const lowerLangs = PREFERRED_SPEECH_LANGS.map((lang) => lang.toLowerCase());
  for (const lang of lowerLangs) {
    const preferredLocal = voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(lang) && voice.localService);
    if (preferredLocal) {
      return preferredLocal;
    }
    const preferredAny = voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(lang));
    if (preferredAny) {
      return preferredAny;
    }
  }

  return voices[0] || null;
}

function populateVoiceOptions() {
  if (!el.settingVoiceName) {
    return;
  }
  const select = el.settingVoiceName;
  const selected = String(state.settings?.voiceName || "").trim();
  const previousValue = String(select.value || "");
  const desiredValue = selected || previousValue;
  const voices = state.speechSupported ? window.speechSynthesis.getVoices() || [] : [];

  select.innerHTML = "";
  select.add(new Option("Auto (Best Available)", ""));

  voices
    .slice()
    .sort((a, b) => String(a.lang || "").localeCompare(String(b.lang || "")) || String(a.name || "").localeCompare(String(b.name || "")))
    .forEach((voice) => {
      const label = `${voice.name} (${voice.lang || "unknown"})`;
      select.add(new Option(label, voice.name));
    });

  if (desiredValue && [...voices].some((voice) => String(voice.name || "") === desiredValue)) {
    select.value = desiredValue;
  } else {
    select.value = "";
  }
}

function primeSpeechFromUserGesture() {
  if (!state.speechSupported || !state.voiceGuidanceEnabled) {
    return false;
  }
  if (state.speechPrimed) {
    return true;
  }

  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(".");
    const voice = resolvePreferredSpeechVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-GB";
    }
    utterance.volume = 0.01;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => {
      state.speechPrimed = true;
    };
    utterance.onend = () => {
      state.speechPrimed = true;
    };
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    if (typeof synth.resume === "function") {
      synth.resume();
    }
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function reportSpeechWarning(message) {
  const now = Date.now();
  if (now - state.lastSpeechWarningAt < SPEECH_WARNING_THROTTLE_MS) {
    return;
  }
  state.lastSpeechWarningAt = now;
  setStatus(message, "warn");
}

function normalizeBaseUrl(value, fallback) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return fallback;
  }
  const cleaned = raw.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

function isUsingPublicEndpoints() {
  const signature = JSON.stringify({
    orsBaseUrl: state.settings.orsBaseUrl,
    osrmBaseUrl: state.settings.osrmBaseUrl,
    geocoderBaseUrl: state.settings.geocoderBaseUrl,
    postcodeBaseUrl: state.settings.postcodeBaseUrl,
  });
  return signature === PUBLIC_ENDPOINTS_SIGNATURE;
}

function warnIfUsingPublicEndpoints() {
  if (state.publicEndpointWarned) {
    return;
  }
  if (!isUsingPublicEndpoints()) {
    return;
  }
  state.publicEndpointWarned = true;
  setStatus("Using public free endpoints. Configure self-host URLs in Settings for production reliability.", "warn");
}

function normalizeCameraChaseOffsetPx(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_CAMERA_CHASE_OFFSET_PX;
  }
  return Math.round(clamp(raw, CAMERA_CHASE_OFFSET_MIN_PX, CAMERA_CHASE_OFFSET_MAX_PX));
}

function loadCameraChaseOffset() {
  try {
    const raw = localStorage.getItem(STORAGE_CAMERA_CHASE_OFFSET_KEY);
    state.cameraChaseOffsetPx = normalizeCameraChaseOffsetPx(raw);
  } catch {
    state.cameraChaseOffsetPx = DEFAULT_CAMERA_CHASE_OFFSET_PX;
  }
}

function setCameraChaseOffsetPx(value, persist = true) {
  state.cameraChaseOffsetPx = normalizeCameraChaseOffsetPx(value);
  if (!persist) {
    return state.cameraChaseOffsetPx;
  }
  try {
    localStorage.setItem(STORAGE_CAMERA_CHASE_OFFSET_KEY, String(state.cameraChaseOffsetPx));
  } catch {
    // Best effort persistence.
  }
  return state.cameraChaseOffsetPx;
}

function scheduleHazardPreload() {
  if (state.hazardsPreloadStarted) {
    return;
  }
  state.hazardsPreloadStarted = true;

  const run = () => {
    preloadHazardDatasets()
      .then(() => {
        if (state.routeGuide) {
          evaluateRouteHazards();
        }
      })
      .catch((error) => {
        const detail = error && error.message ? ` (${error.message})` : "";
        setStatus(`Hazard datasets could not be loaded. Routing still available.${detail}`, "warn");
      });
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 5000 });
    return;
  }
  window.setTimeout(run, 1200);
}

async function preloadHazardDatasets() {
  const [lowBridgePayload, roadWidthPayload] = await Promise.all([
    loadHazardGeoJsonFromCandidates([
      "./lowbridge-data.geojson",
      "./Lowbridge%20data.geojson",
      "./Lowbridge data.geojson",
    ]),
    loadHazardGeoJsonFromCandidates([
      "./road-width-data.geojson",
      "./Road-width%20data.geojson",
      "./Road-width data.geojson",
    ]),
  ]);

  state.lowBridgeHazards = extractLowBridgeHazards(lowBridgePayload);
  state.narrowRoadHazards = extractNarrowRoadHazards(roadWidthPayload);
  state.hazardsReady = state.lowBridgeHazards.length > 0 || state.narrowRoadHazards.length > 0;
  setStatus(
    `Hazards loaded: ${state.lowBridgeHazards.length} low-bridge and ${state.narrowRoadHazards.length} width records.`,
    "ok",
  );
}

async function loadHazardGeoJsonFromCandidates(candidates) {
  const urls = Array.isArray(candidates) ? candidates : [];
  let lastError = new Error("No hazard dataset candidates provided.");
  for (const url of urls) {
    try {
      return await loadHazardGeoJson(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error || "Unknown hazard load error"));
    }
  }
  throw lastError;
}

async function loadHazardGeoJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load hazard dataset: ${url}`);
  }
  return response.json();
}

function extractLowBridgeHazards(payload) {
  const hazards = [];
  for (const feature of payload?.features || []) {
    const point = geometryRepresentativePoint(feature?.geometry);
    if (!point) {
      continue;
    }
    const props = feature?.properties || {};
    const rawHeight = props.maxheight ?? props.height ?? props.clearance ?? props.max_height ?? props.bridge_height;
    const limitMeters = parseMetersValue(rawHeight);
    if (!Number.isFinite(limitMeters) || limitMeters <= 0 || limitMeters > 8.5) {
      continue;
    }
    const highwayTag = String(props.highway || "").trim().toLowerCase();
    if (!isDrivableHighwayTag(highwayTag)) {
      continue;
    }
    const name = String(props.name || props.ref || props["@id"] || "Low bridge");
    const roadTokens = buildRoadTokensFromHazardProperties(props);
    hazards.push({
      type: "low_bridge",
      lat: point.lat,
      lon: point.lon,
      limitMeters,
      name,
      roadTokens,
    });
  }
  return hazards;
}

function extractNarrowRoadHazards(payload) {
  const hazards = [];
  for (const feature of payload?.features || []) {
    const point = geometryRepresentativePoint(feature?.geometry);
    if (!point) {
      continue;
    }
    const props = feature?.properties || {};
    const rawWidth = props.width ?? props.maxwidth ?? props.max_width;
    const widthMeters = parseMetersValue(rawWidth);
    if (!Number.isFinite(widthMeters) || widthMeters <= 0 || widthMeters > 15) {
      continue;
    }
    const highwayTag = String(props.highway || "").trim().toLowerCase();
    if (!isDrivableHighwayTag(highwayTag)) {
      continue;
    }
    const name = String(props.name || props.ref || props.highway || props["@id"] || "Narrow segment");
    const roadTokens = buildRoadTokensFromHazardProperties(props);
    hazards.push({
      type: "narrow_road",
      lat: point.lat,
      lon: point.lon,
      limitMeters: widthMeters,
      name,
      roadTokens,
    });
  }
  return hazards;
}

function parseMetersValue(input) {
  if (input === null || input === undefined) {
    return Number.NaN;
  }
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : Number.NaN;
  }
  const text = String(input).trim().toLowerCase();
  if (!text) {
    return Number.NaN;
  }
  const normalized = text.replace(/,/g, ".").replace(/[′’]/g, "'").replace(/[″”]/g, '"');
  const feetMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:ft|')\s*(\d+(?:\.\d+)?)?\s*(?:in|")?/);
  if (feetMatch) {
    const feet = Number(feetMatch[1]);
    const inches = Number(feetMatch[2] || 0);
    if (Number.isFinite(feet) && Number.isFinite(inches)) {
      return feet * 0.3048 + inches * 0.0254;
    }
  }
  const numeric = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!numeric) {
    return Number.NaN;
  }
  const value = Number(numeric[0]);
  if (!Number.isFinite(value)) {
    return Number.NaN;
  }
  if (normalized.includes("ft") || normalized.includes("'")) {
    return value * 0.3048;
  }
  if (normalized.includes("cm")) {
    return value / 100;
  }
  if (normalized.includes("mm")) {
    return value / 1000;
  }
  if (normalized.includes("m")) {
    return value;
  }
  if (value > 0 && value <= 15) {
    return value;
  }
  return Number.NaN;
}

function geometryRepresentativePoint(geometry) {
  if (!geometry || typeof geometry !== "object") {
    return null;
  }
  const type = String(geometry.type || "");
  const coords = geometry.coordinates;

  if (type === "Point" && Array.isArray(coords) && coords.length >= 2) {
    return { lat: Number(coords[1]), lon: Number(coords[0]) };
  }
  if (type === "MultiPoint" && Array.isArray(coords) && coords.length > 0) {
    return geometryRepresentativePoint({ type: "Point", coordinates: coords[0] });
  }
  if (type === "LineString" && Array.isArray(coords) && coords.length > 0) {
    const mid = coords[Math.floor(coords.length / 2)];
    return Array.isArray(mid) && mid.length >= 2 ? { lat: Number(mid[1]), lon: Number(mid[0]) } : null;
  }
  if (type === "MultiLineString" && Array.isArray(coords) && coords.length > 0) {
    const firstLine = coords.find((line) => Array.isArray(line) && line.length > 0);
    return firstLine ? geometryRepresentativePoint({ type: "LineString", coordinates: firstLine }) : null;
  }
  if (type === "Polygon" && Array.isArray(coords) && coords.length > 0 && Array.isArray(coords[0]) && coords[0].length > 0) {
    const ring = coords[0];
    let sumLat = 0;
    let sumLon = 0;
    let count = 0;
    for (const pair of ring) {
      if (!Array.isArray(pair) || pair.length < 2) {
        continue;
      }
      sumLon += Number(pair[0]);
      sumLat += Number(pair[1]);
      count += 1;
    }
    if (count > 0) {
      return { lat: sumLat / count, lon: sumLon / count };
    }
  }
  if (type === "MultiPolygon" && Array.isArray(coords) && coords.length > 0) {
    const firstPolygon = coords.find((poly) => Array.isArray(poly) && poly.length > 0);
    return firstPolygon ? geometryRepresentativePoint({ type: "Polygon", coordinates: firstPolygon }) : null;
  }
  return null;
}

function isDrivableHighwayTag(value) {
  const highway = String(value || "").trim().toLowerCase();
  if (!highway) {
    return false;
  }
  const allowed = new Set([
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
    "primary",
    "primary_link",
    "secondary",
    "secondary_link",
    "tertiary",
    "tertiary_link",
    "unclassified",
    "residential",
    "living_street",
    "service",
  ]);
  return allowed.has(highway);
}

function buildRoadTokensFromHazardProperties(props) {
  if (!props || typeof props !== "object") {
    return [];
  }
  const values = [
    props.name,
    props.ref,
    props["addr:street"],
    props["is_in:road"],
    props.destination,
    props.destination_ref,
  ];
  const tokens = new Set();
  for (const value of values) {
    for (const token of extractRoadTokens(String(value || ""))) {
      tokens.add(token);
    }
  }
  return [...tokens];
}

function extractRoadTokens(text) {
  const input = String(text || "").toUpperCase();
  if (!input) {
    return [];
  }
  const tokens = new Set();
  const refMatches = input.match(/\b[AMB]\d+[A-Z]?\b/g) || [];
  for (const ref of refMatches) {
    tokens.add(ref);
  }

  const stopwords = new Set([
    "ROAD",
    "STREET",
    "LANE",
    "DRIVE",
    "AVENUE",
    "WAY",
    "COURT",
    "ROUNDABOUT",
    "THE",
    "AND",
    "NORTH",
    "SOUTH",
    "EAST",
    "WEST",
  ]);

  const words = input.replace(/[^A-Z0-9\s]/g, " ").split(/\s+/);
  for (const word of words) {
    if (!word || word.length < 3) {
      continue;
    }
    if (/^\d+$/.test(word)) {
      continue;
    }
    if (stopwords.has(word)) {
      continue;
    }
    tokens.add(word);
  }
  return [...tokens];
}

function buildRouteRoadTokensNearProgress(alongMeters) {
  const steps = state.routeGuide?.guidanceSteps || [];
  if (!Array.isArray(steps) || steps.length === 0) {
    return new Set();
  }
  let index = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (alongMeters <= Number(steps[i].endDistance) + 100) {
      index = i;
      break;
    }
    index = i;
  }
  const tokenSet = new Set();
  const from = Math.max(0, index - 1);
  const to = Math.min(steps.length - 1, index + 1);
  for (let i = from; i <= to; i += 1) {
    const stepText = String(steps[i]?.text || "");
    for (const token of extractRoadTokens(stepText)) {
      tokenSet.add(token);
    }
  }
  for (const token of extractRoadTokens(state.currentRoadName || "")) {
    tokenSet.add(token);
  }
  return tokenSet;
}

function hasRoadTokenOverlap(hazardTokens, routeTokenSet) {
  if (!Array.isArray(hazardTokens) || hazardTokens.length === 0) {
    return false;
  }
  if (!(routeTokenSet instanceof Set) || routeTokenSet.size === 0) {
    return false;
  }
  for (const token of hazardTokens) {
    if (routeTokenSet.has(String(token).toUpperCase())) {
      return true;
    }
  }
  return false;
}

function evaluateRouteHazards() {
  state.activeHazards = [];
  if (!state.hazardsReady || !state.routeGuide || !Array.isArray(state.routeGuide.lineLatLngs) || state.routeGuide.lineLatLngs.length < 2) {
    return;
  }

  const lineLatLngs = state.routeGuide.lineLatLngs;
  const cumulativeMeters = state.routeGuide.cumulativeMeters;
  const routeSamples = buildRouteSamplePoints(lineLatLngs);
  const bbox = computeRouteBoundingBox(lineLatLngs, HAZARD_PROXIMITY_METERS * HAZARD_PREFILTER_MULTIPLIER);
  const restrictions = buildVehicleRestrictions();
  const vehicleHeight = Number(restrictions.height);
  const vehicleWidth = Number(restrictions.width);
  const relevantWidthMeters = Number.isFinite(vehicleWidth) ? vehicleWidth + 0.2 : MIN_WIDTH_WARNING_METERS;

  const lowBridgeCandidates = state.lowBridgeHazards.filter((hazard) => isPointInsideBoundingBox(hazard.lat, hazard.lon, bbox));
  const narrowRoadCandidates = state.narrowRoadHazards.filter((hazard) => isPointInsideBoundingBox(hazard.lat, hazard.lon, bbox));
  const resolved = [];

  for (const hazard of lowBridgeCandidates) {
    if (Number.isFinite(vehicleHeight) && hazard.limitMeters > vehicleHeight + 0.6) {
      continue;
    }
    const approxDistance = distanceToNearestSample(hazard.lat, hazard.lon, routeSamples);
    if (!Number.isFinite(approxDistance) || approxDistance > HAZARD_PROXIMITY_METERS * HAZARD_PREFILTER_MULTIPLIER) {
      continue;
    }
    const nearest = findNearestPointOnRoute(hazard.lat, hazard.lon, lineLatLngs, cumulativeMeters);
    if (!nearest || nearest.distanceMeters > HAZARD_PROXIMITY_METERS) {
      continue;
    }
    const routeRoadTokens = buildRouteRoadTokensNearProgress(nearest.alongMeters);
    const tokenMatched = hasRoadTokenOverlap(hazard.roadTokens, routeRoadTokens);
    if (!tokenMatched && nearest.distanceMeters > HAZARD_STRICT_MATCH_METERS) {
      continue;
    }
    const clearance = Number.isFinite(vehicleHeight) ? hazard.limitMeters - vehicleHeight : Number.NaN;
    resolved.push({
      ...hazard,
      alongMeters: nearest.alongMeters,
      fromRouteMeters: nearest.distanceMeters,
      roadTokenMatched: tokenMatched,
      severity: Number.isFinite(clearance) && clearance < 0 ? "high" : "medium",
      advisory: Number.isFinite(clearance) && clearance < 0.05
        ? `Low bridge (${hazard.limitMeters.toFixed(2)}m) may be too low for this vehicle`
        : `Low bridge ahead (${hazard.limitMeters.toFixed(2)}m clearance)`,
    });
  }

  for (const hazard of narrowRoadCandidates) {
    if (hazard.limitMeters > relevantWidthMeters + 0.8) {
      continue;
    }
    const approxDistance = distanceToNearestSample(hazard.lat, hazard.lon, routeSamples);
    if (!Number.isFinite(approxDistance) || approxDistance > HAZARD_PROXIMITY_METERS * HAZARD_PREFILTER_MULTIPLIER) {
      continue;
    }
    const nearest = findNearestPointOnRoute(hazard.lat, hazard.lon, lineLatLngs, cumulativeMeters);
    if (!nearest || nearest.distanceMeters > HAZARD_PROXIMITY_METERS) {
      continue;
    }
    const routeRoadTokens = buildRouteRoadTokensNearProgress(nearest.alongMeters);
    const tokenMatched = hasRoadTokenOverlap(hazard.roadTokens, routeRoadTokens);
    if (!tokenMatched && nearest.distanceMeters > HAZARD_STRICT_MATCH_METERS) {
      continue;
    }
    const clearance = hazard.limitMeters - relevantWidthMeters;
    resolved.push({
      ...hazard,
      alongMeters: nearest.alongMeters,
      fromRouteMeters: nearest.distanceMeters,
      roadTokenMatched: tokenMatched,
      severity: clearance < 0 ? "high" : "medium",
      advisory: clearance < 0
        ? `Road width restriction (${hazard.limitMeters.toFixed(2)}m) is below configured vehicle width`
        : `Narrow road ahead (${hazard.limitMeters.toFixed(2)}m width)`,
    });
  }

  resolved.sort((a, b) => a.alongMeters - b.alongMeters || a.fromRouteMeters - b.fromRouteMeters);
  state.activeHazards = resolved.slice(0, 160);

  if (state.activeHazards.length > 0) {
    const highCount = state.activeHazards.filter((hazard) => hazard.severity === "high").length;
    const matchedCount = state.activeHazards.filter((hazard) => hazard.roadTokenMatched).length;
    const suffix = highCount > 0 ? ` (${highCount} high risk)` : "";
    setStatus(
      `Hazard scan complete: ${state.activeHazards.length} warning points detected (${matchedCount} road-matched)${suffix}.`,
      highCount > 0 ? "warn" : "ok",
    );
  }
}

function buildRouteSamplePoints(lineLatLngs) {
  if (!Array.isArray(lineLatLngs) || lineLatLngs.length === 0) {
    return [];
  }
  const step = Math.max(1, Math.floor(lineLatLngs.length / 120));
  const samples = [];
  for (let i = 0; i < lineLatLngs.length; i += step) {
    const point = lineLatLngs[i];
    samples.push({ lat: Number(point[0]), lon: Number(point[1]) });
  }
  const last = lineLatLngs[lineLatLngs.length - 1];
  samples.push({ lat: Number(last[0]), lon: Number(last[1]) });
  return samples;
}

function distanceToNearestSample(lat, lon, samples) {
  let best = Number.POSITIVE_INFINITY;
  for (const sample of samples || []) {
    if (!Number.isFinite(sample.lat) || !Number.isFinite(sample.lon)) {
      continue;
    }
    const distance = haversineMeters(lat, lon, sample.lat, sample.lon);
    if (distance < best) {
      best = distance;
    }
  }
  return best;
}

function computeRouteBoundingBox(lineLatLngs, paddingMeters = 0) {
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  for (const point of lineLatLngs || []) {
    const lat = Number(point?.[0]);
    const lon = Number(point?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }
  if (!Number.isFinite(minLat) || !Number.isFinite(maxLat) || !Number.isFinite(minLon) || !Number.isFinite(maxLon)) {
    return null;
  }
  const centerLat = (minLat + maxLat) / 2;
  const latPadding = Number(paddingMeters) / 111320;
  const lonScale = Math.max(0.15, Math.cos((centerLat * Math.PI) / 180));
  const lonPadding = Number(paddingMeters) / (111320 * lonScale);
  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLon: minLon - lonPadding,
    maxLon: maxLon + lonPadding,
  };
}

function isPointInsideBoundingBox(lat, lon, bbox) {
  if (!bbox) {
    return false;
  }
  return lat >= bbox.minLat && lat <= bbox.maxLat && lon >= bbox.minLon && lon <= bbox.maxLon;
}

function buildUpcomingHazardNotice(progressMeters) {
  if (!Array.isArray(state.activeHazards) || state.activeHazards.length === 0 || !Number.isFinite(progressMeters)) {
    return "";
  }
  const nextHazard = state.activeHazards.find(
    (hazard) => Number.isFinite(hazard.alongMeters) && hazard.alongMeters >= progressMeters - 10,
  );
  if (!nextHazard) {
    return "";
  }
  const aheadMeters = Math.max(0, nextHazard.alongMeters - progressMeters);
  if (aheadMeters > HAZARD_LOOKAHEAD_METERS) {
    return "";
  }
  return `Hazard in ${formatDistance(aheadMeters)}: ${nextHazard.advisory}`;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function sanitizeSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  const schemaVersionRaw = Number(source.schemaVersion);
  const schemaVersion = Number.isFinite(schemaVersionRaw) && schemaVersionRaw >= 1 ? Math.floor(schemaVersionRaw) : 1;
  const units = source.units === "metric" ? "metric" : "imperial";
  let routeColor = /^#[0-9a-fA-F]{6}$/.test(String(source.routeColor || ""))
    ? String(source.routeColor).toLowerCase()
    : DEFAULT_SETTINGS.routeColor;
  if (schemaVersion < SETTINGS_SCHEMA_VERSION && LEGACY_RED_ROUTE_COLORS.has(routeColor)) {
    routeColor = DEFAULT_SETTINGS.routeColor;
  }
  const voiceRateRaw = Number(source.voiceRate);
  const voiceRate = Number.isFinite(voiceRateRaw) ? clamp(voiceRateRaw, 0.7, 1.4) : DEFAULT_SETTINGS.voiceRate;
  const voiceName = String(source.voiceName || "").trim();
  const coachProfile = ["safe", "balanced", "fast"].includes(String(source.coachProfile || "").trim())
    ? String(source.coachProfile).trim()
    : DEFAULT_SETTINGS.coachProfile;
  const routingProvider = ["auto", "ors-hgv", "ors-car", "osrm"].includes(String(source.routingProvider || "").trim())
    ? String(source.routingProvider).trim()
    : DEFAULT_SETTINGS.routingProvider;
  const orsBaseUrl = normalizeBaseUrl(source.orsBaseUrl, DEFAULT_SETTINGS.orsBaseUrl);
  const osrmBaseUrl = normalizeBaseUrl(source.osrmBaseUrl, DEFAULT_SETTINGS.osrmBaseUrl);
  const geocoderBaseUrl = normalizeBaseUrl(source.geocoderBaseUrl, DEFAULT_SETTINGS.geocoderBaseUrl);
  const postcodeBaseUrl = normalizeBaseUrl(source.postcodeBaseUrl, DEFAULT_SETTINGS.postcodeBaseUrl);
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    units,
    routeColor,
    voiceEnabled: Boolean(source.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled),
    voiceName,
    voiceRate,
    autoReroute: Boolean(source.autoReroute ?? DEFAULT_SETTINGS.autoReroute),
    cameraFollow: Boolean(source.cameraFollow ?? DEFAULT_SETTINGS.cameraFollow),
    coachProfile,
    routingProvider,
    orsBaseUrl,
    osrmBaseUrl,
    geocoderBaseUrl,
    postcodeBaseUrl,
    usePublicFallback: Boolean(source.usePublicFallback ?? DEFAULT_SETTINGS.usePublicFallback),
    telemetryEnabled: Boolean(source.telemetryEnabled ?? DEFAULT_SETTINGS.telemetryEnabled),
    hideTraveledRoute: Boolean(source.hideTraveledRoute ?? DEFAULT_SETTINGS.hideTraveledRoute),
    avoidMotorways: Boolean(source.avoidMotorways),
    avoidTolls: Boolean(source.avoidTolls),
    avoidFerries: Boolean(source.avoidFerries),
  };
}

function persistSettings() {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(state.settings));
}

function updateSettingsUI() {
  el.settingUnits.value = state.settings.units;
  el.settingRouteColor.value = state.settings.routeColor;
  el.settingVoiceEnabled.checked = Boolean(state.settings.voiceEnabled);
  if (el.settingVoiceName) {
    populateVoiceOptions();
    el.settingVoiceName.disabled = !state.speechSupported;
  }
  el.settingVoiceRate.value = String(state.settings.voiceRate);
  if (el.settingVehicleIconSearch) {
    el.settingVehicleIconSearch.value = getSelectedVehicleIcon();
  }
  el.settingVoiceEnabled.disabled = !state.speechSupported;
  el.settingVoiceRate.disabled = !state.speechSupported;
  el.settingAutoReroute.checked = Boolean(state.settings.autoReroute);
  if (el.settingCameraFollow) {
    el.settingCameraFollow.checked = Boolean(state.cameraFollowEnabled);
  }
  if (el.settingCoachProfile) {
    el.settingCoachProfile.value = state.settings.coachProfile;
  }
  if (el.settingRoutingProvider) {
    el.settingRoutingProvider.value = state.settings.routingProvider;
  }
  if (el.settingOrsBaseUrl) {
    el.settingOrsBaseUrl.value = state.settings.orsBaseUrl;
  }
  if (el.settingOsrmBaseUrl) {
    el.settingOsrmBaseUrl.value = state.settings.osrmBaseUrl;
  }
  if (el.settingGeocoderBaseUrl) {
    el.settingGeocoderBaseUrl.value = state.settings.geocoderBaseUrl;
  }
  if (el.settingPostcodeBaseUrl) {
    el.settingPostcodeBaseUrl.value = state.settings.postcodeBaseUrl;
  }
  if (el.settingUsePublicFallback) {
    el.settingUsePublicFallback.checked = Boolean(state.settings.usePublicFallback);
  }
  if (el.settingTelemetryEnabled) {
    el.settingTelemetryEnabled.checked = Boolean(state.settings.telemetryEnabled);
  }
  el.settingAvoidMotorways.checked = Boolean(state.settings.avoidMotorways);
  el.settingAvoidTolls.checked = Boolean(state.settings.avoidTolls);
  el.settingAvoidFerries.checked = Boolean(state.settings.avoidFerries);
}

function handleSettingsInputChange() {
  const previousSettings = state.settings;
  state.settings = sanitizeSettings({
    ...state.settings,
    units: el.settingUnits.value,
    routeColor: el.settingRouteColor.value,
    voiceEnabled: el.settingVoiceEnabled.checked,
    voiceName: el.settingVoiceName ? el.settingVoiceName.value : state.settings.voiceName,
    voiceRate: Number(el.settingVoiceRate.value),
    autoReroute: el.settingAutoReroute.checked,
    cameraFollow: el.settingCameraFollow ? el.settingCameraFollow.checked : state.settings.cameraFollow,
    coachProfile: el.settingCoachProfile ? el.settingCoachProfile.value : state.settings.coachProfile,
    routingProvider: el.settingRoutingProvider ? el.settingRoutingProvider.value : state.settings.routingProvider,
    orsBaseUrl: el.settingOrsBaseUrl ? el.settingOrsBaseUrl.value : state.settings.orsBaseUrl,
    osrmBaseUrl: el.settingOsrmBaseUrl ? el.settingOsrmBaseUrl.value : state.settings.osrmBaseUrl,
    geocoderBaseUrl: el.settingGeocoderBaseUrl ? el.settingGeocoderBaseUrl.value : state.settings.geocoderBaseUrl,
    postcodeBaseUrl: el.settingPostcodeBaseUrl ? el.settingPostcodeBaseUrl.value : state.settings.postcodeBaseUrl,
    usePublicFallback: el.settingUsePublicFallback ? el.settingUsePublicFallback.checked : state.settings.usePublicFallback,
    telemetryEnabled: el.settingTelemetryEnabled ? el.settingTelemetryEnabled.checked : state.settings.telemetryEnabled,
    avoidMotorways: el.settingAvoidMotorways.checked,
    avoidTolls: el.settingAvoidTolls.checked,
    avoidFerries: el.settingAvoidFerries.checked,
  });
  state.voiceGuidanceEnabled = state.settings.voiceEnabled;
  state.cameraFollowEnabled = Boolean(state.settings.cameraFollow);
  state.cameraFollowPausedUntil = 0;
  if (!previousSettings.voiceEnabled && state.voiceGuidanceEnabled) {
    const primed = primeSpeechFromUserGesture();
    if (!primed) {
      reportSpeechWarning("Voice guidance may be blocked. Turn off silent mode and raise media volume.");
    } else {
      speakText("Voice guidance enabled", { suppressStatusOnError: true });
    }
  }
  if (!state.voiceGuidanceEnabled && state.speechSupported) {
    window.speechSynthesis.cancel();
    state.lastSpokenStepIndex = -1;
    state.spokenStepStages = new Map();
    state.speechPrimed = false;
  }
  if (state.speechSupported && previousSettings.voiceName !== state.settings.voiceName) {
    refreshSpeechVoicePreference();
  }
  persistSettings();
  updateSettingsUI();
  updateVoiceGuidanceButton();
  warnIfUsingPublicEndpoints();
  applyCurrentRouteStyle();

  const routingSettingsChanged =
    previousSettings.avoidMotorways !== state.settings.avoidMotorways ||
    previousSettings.avoidTolls !== state.settings.avoidTolls ||
    previousSettings.avoidFerries !== state.settings.avoidFerries ||
    previousSettings.coachProfile !== state.settings.coachProfile ||
    previousSettings.routingProvider !== state.settings.routingProvider ||
    previousSettings.orsBaseUrl !== state.settings.orsBaseUrl ||
    previousSettings.osrmBaseUrl !== state.settings.osrmBaseUrl ||
    previousSettings.geocoderBaseUrl !== state.settings.geocoderBaseUrl ||
    previousSettings.postcodeBaseUrl !== state.settings.postcodeBaseUrl ||
    previousSettings.usePublicFallback !== state.settings.usePublicFallback;
  if (routingSettingsChanged) {
    markRoutePreviewDirty();
  }
}

function setSettingsSheetOpen(open) {
  state.settingsSheetOpen = Boolean(open);
  if (state.settingsSheetOpen && state.navSearchOverlayOpen) {
    state.navSearchOverlayOpen = false;
    applyNavigationChromeState();
  }
  if (state.settingsSheetOpen && state.stopsSheetOpen) {
    state.stopsSheetOpen = false;
    el.stopsSheet.classList.remove("open");
    el.stopsSheet.setAttribute("aria-hidden", "true");
    el.toggleStopsBtn.textContent = "Stops";
  }
  el.settingsSheet.classList.toggle("open", state.settingsSheetOpen);
  el.settingsSheet.setAttribute("aria-hidden", state.settingsSheetOpen ? "false" : "true");
  el.toggleSettingsBtn.textContent = state.settingsSheetOpen ? "Hide Settings" : "Settings";
}

function applyCurrentRouteStyle() {
  if (state.routeLayer) {
    state.routeLayer.setStyle({
      color: state.settings.routeColor,
      weight: BASE_ROUTE_LINE_WEIGHT,
      opacity: BASE_ROUTE_LINE_OPACITY,
    });
  }
  if (!state.roadStyleLayer) {
    return;
  }
  state.roadStyleLayer.eachLayer((layer) => {
    if (!layer || typeof layer.setStyle !== "function") {
      return;
    }
    const roadType = layer.options?.roadType || "other";
    if (roadType !== "other") {
      return;
    }
    layer.setStyle({
      color: state.settings.routeColor,
      weight: BASE_ROAD_STYLE_OTHER_WEIGHT,
      opacity: BASE_ROAD_STYLE_OTHER_OPACITY,
    });
  });
}

function getRoadColor(roadType) {
  if (roadType === "motorway") {
    return ROAD_STYLE_COLORS.motorway;
  }
  if (roadType === "aRoad") {
    return ROAD_STYLE_COLORS.aRoad;
  }
  return state.settings.routeColor;
}

function buildAvoidFeatures() {
  const features = new Set();
  if (state.settings.avoidMotorways) features.add("highways");
  if (state.settings.avoidTolls) features.add("tollways");
  if (state.settings.avoidFerries) features.add("ferries");
  const profile = getCoachProfileConfig();
  for (const item of profile.extraAvoidFeatures) {
    features.add(item);
  }
  return [...features];
}

function buildOSRMExcludes() {
  const excludes = [];
  if (state.settings.avoidMotorways) excludes.push("motorway");
  if (state.settings.avoidTolls) excludes.push("toll");
  if (state.settings.avoidFerries) excludes.push("ferry");
  return excludes;
}

function queueDestinationPreview(immediate = false) {
  if (state.previewTimer) {
    clearTimeout(state.previewTimer);
    state.previewTimer = null;
  }

  const targetText = String(el.targetInput.value || "").trim();
  if (!targetText) {
    clearDestinationPreview();
    return;
  }

  const requestId = state.previewRequestId + 1;
  state.previewRequestId = requestId;
  const delayMs = immediate ? 0 : 250;
  state.previewTimer = setTimeout(() => {
    previewDestinationFromInput(targetText, requestId).catch(() => {
      // Ignore preview errors while user types incomplete values.
    });
  }, delayMs);
}

async function previewDestinationFromInput(targetText, requestId) {
  const preview = await resolvePreviewTarget(targetText);
  if (!preview) {
    return;
  }
  if (requestId !== state.previewRequestId) {
    return;
  }
  setDestinationPreview(preview.point.lat, preview.point.lon, preview.label);
}

async function resolvePreviewTarget(targetText) {
  const duty = findDutyFromInput(targetText);
  if (duty) {
    const rawIds = Array.isArray(duty.stopIds) ? duty.stopIds : [];
    const validStopIds = collapseConsecutiveDuplicateStopIds(rawIds.map((id) => String(id)).filter((id) => state.stopById.has(id)));
    if (validStopIds.length > 0) {
      const finalStop = state.stopById.get(validStopIds[validStopIds.length - 1]);
      if (finalStop) {
        const point = await geocodeStop(finalStop);
        return {
          point: { lat: point.lat, lon: point.lon },
          label: `${finalStop.name} (${finalStop.postcode})`,
        };
      }
    }
  }

  if (isExactPostcodeQuery(targetText)) {
    const result = await geocodeQuery(targetText);
    return {
      point: { lat: result.lat, lon: result.lon },
      label: `${result.subtitle || targetText}`,
    };
  }

  const stop = findStopByQuery(targetText);
  if (stop) {
    const point = await geocodeStop(stop);
    return {
      point: { lat: point.lat, lon: point.lon },
      label: `${stop.name} (${stop.postcode})`,
    };
  }

  if (!isLikelySearchableTarget(targetText)) {
    return null;
  }

  const result = await geocodeQuery(targetText);
  return {
    point: { lat: result.lat, lon: result.lon },
    label: `${result.label}`,
  };
}

function isLikelySearchableTarget(targetText) {
  const text = String(targetText || "").trim();
  if (text.length >= 3) {
    return true;
  }
  return isExactPostcodeQuery(text);
}

function isExactPostcodeQuery(targetText) {
  const compact = String(targetText || "").replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(compact);
}

function setDestinationPreview(lat, lon, label) {
  if (!state.previewMarker) {
    state.previewMarker = L.marker([lat, lon], { zIndexOffset: 850 }).addTo(map);
  } else {
    state.previewMarker.setLatLng([lat, lon]);
  }
  state.previewMarker.bindPopup(`Destination preview<br>${escapeHtml(label)}`);
  map.panTo([lat, lon], { animate: true, duration: 0.8 });
  state.previewMarker.openPopup();
}

function clearDestinationPreview() {
  if (state.previewTimer) {
    clearTimeout(state.previewTimer);
    state.previewTimer = null;
  }
  if (state.previewMarker) {
    map.removeLayer(state.previewMarker);
    state.previewMarker = null;
  }
}

function setStopsSheetOpen(open) {
  if (open && state.navigationMode) {
    return;
  }
  state.stopsSheetOpen = Boolean(open);
  if (state.stopsSheetOpen && state.navSearchOverlayOpen) {
    state.navSearchOverlayOpen = false;
    applyNavigationChromeState();
  }
  if (state.stopsSheetOpen && state.settingsSheetOpen) {
    state.settingsSheetOpen = false;
    el.settingsSheet.classList.remove("open");
    el.settingsSheet.setAttribute("aria-hidden", "true");
    el.toggleSettingsBtn.textContent = "Settings";
  }
  el.stopsSheet.classList.toggle("open", state.stopsSheetOpen);
  el.stopsSheet.setAttribute("aria-hidden", state.stopsSheetOpen ? "false" : "true");
  el.toggleStopsBtn.textContent = state.stopsSheetOpen ? "Hide Stops" : "Stops";
}

function buildPlanSignature() {
  const target = String(el.targetInput.value || "").trim().toLowerCase();
  return JSON.stringify({
    target,
    vias: [...state.viaStopIds],
    avoidMotorways: Boolean(state.settings.avoidMotorways),
    avoidTolls: Boolean(state.settings.avoidTolls),
    avoidFerries: Boolean(state.settings.avoidFerries),
  });
}

function markRoutePreviewDirty() {
  state.routePreviewReady = false;
  state.lastPlanSignature = "";
  updateStartButtonState();
}

async function previewRouteAfterTargetSelection() {
  if (state.routePreviewInFlight) {
    return;
  }

  const targetText = String(el.targetInput.value || "").trim();
  if (!targetText) {
    return;
  }

  const signature = buildPlanSignature();
  if (state.routePreviewReady && state.lastPlanSignature === signature) {
    return;
  }

  state.routePreviewInFlight = true;
  try {
    const planned = await handlePlanRoute();
    if (!planned) {
      return;
    }
    state.routePreviewReady = true;
    state.lastPlanSignature = signature;
    updateStartButtonState();
    setStatus("Route overview ready. Tap Start Nav to begin chase-camera guidance.", "ok");
  } finally {
    state.routePreviewInFlight = false;
  }
}

async function handleStartRoute() {
  primeSpeechFromUserGesture();
  const currentSignature = buildPlanSignature();
  const needsRoutePreview = !state.routePreviewReady || state.lastPlanSignature !== currentSignature || !state.routeGuide;

  if (needsRoutePreview) {
    if (state.routePreviewInFlight) {
      setStatus("Route preview is still being calculated. Please wait.", "warn");
      return;
    }
    const planned = await handlePlanRoute();
    if (!planned) {
      return;
    }
    state.routePreviewReady = true;
    state.lastPlanSignature = currentSignature;
    setStopsSheetOpen(false);
    setSettingsSheetOpen(false);
    clearDestinationPreview();
    state.navigationMode = false;
    state.navCameraInitialized = false;
    state.navCameraState = null;
    state.navSearchOverlayOpen = false;
    applyNavigationChromeState();
    setStatus("Route overview ready. Tap Start Nav for 3D chase navigation.", "ok");
    updateStartButtonState();
    return;
  }

  setStopsSheetOpen(false);
  setSettingsSheetOpen(false);
  clearDestinationPreview();
  state.navSearchOverlayOpen = false;
  applyNavigationChromeState();
  if (state.gpsWatchId === null) {
    startLiveGuidance();
    return;
  }

  state.navigationMode = true;
  state.navCameraInitialized = false;
  state.navCameraState = null;
  state.navStableZoom = null;
  recenterCameraToLivePosition(true);
  setStatus("Navigation mode engaged.", "ok");
  applyNavigationChromeState();
}

function handleAddVia() {
  const stopId = String(el.nxStopSelect.value || "");
  if (!stopId) {
    return;
  }

  if (state.viaStopIds.includes(stopId)) {
    setStatus("That National Express stop is already in the route.", "warn");
    return;
  }

  state.viaStopIds.push(stopId);
  markRoutePreviewDirty();
  renderViaList();
  setStatus("National Express stop added.", "ok");
}

function handleViaListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const idx = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "remove") {
    state.viaStopIds.splice(idx, 1);
  } else if (action === "up" && idx > 0) {
    [state.viaStopIds[idx - 1], state.viaStopIds[idx]] = [state.viaStopIds[idx], state.viaStopIds[idx - 1]];
  } else if (action === "down" && idx < state.viaStopIds.length - 1) {
    [state.viaStopIds[idx + 1], state.viaStopIds[idx]] = [state.viaStopIds[idx], state.viaStopIds[idx + 1]];
  }

  markRoutePreviewDirty();
  renderViaList();
}

function renderViaList() {
  el.viaList.innerHTML = "";

  if (state.viaStopIds.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No additional National Express stops selected.";
    el.viaList.append(li);
    return;
  }

  state.viaStopIds.forEach((stopId, index) => {
    const stop = state.stopById.get(stopId);
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = "via-row";

    const label = document.createElement("span");
    label.textContent = stop ? `${stop.name} (${stop.postcode})` : `Stop ${stopId}`;

    const actions = document.createElement("span");
    actions.className = "via-actions";

    const upBtn = makeViaActionButton("↑", "Move up", "up", index);
    const downBtn = makeViaActionButton("↓", "Move down", "down", index);
    const removeBtn = makeViaActionButton("×", "Remove", "remove", index);

    actions.append(upBtn, downBtn, removeBtn);
    row.append(label, actions);
    li.append(row);
    el.viaList.append(li);
  });
}

async function handlePlanRoute() {
  try {
    setStatus("Preparing route from current GPS location...", "warn");
    el.planBtn.disabled = true;

    const targetText = String(el.targetInput.value || "").trim();
    if (!targetText) {
      throw new Error("Type a duty number, postcode, or destination place.");
    }

    const startPoint = await getCurrentStartPointFromGps();
    const points = [{ lat: startPoint.lat, lon: startPoint.lon }];
    const labels = [{ name: "Current location", postcode: "GPS start" }];

    const duty = findDutyFromInput(targetText);
    if (duty) {
      loadDutyIntoState(duty);
      setStatus(`Duty ${duty.dutyId} matched. Geocoding duty stops...`, "warn");
      const dutyStops = state.loadedDuty.stopIds.map((id) => state.stopById.get(String(id))).filter(Boolean);
      const dutyPoints = await Promise.all(dutyStops.map((stop) => geocodeStop(stop)));
      dutyPoints.forEach((point, index) => {
        const stop = dutyStops[index];
        points.push({ lat: point.lat, lon: point.lon });
        labels.push({ name: stop.name, postcode: stop.postcode });
      });
    } else {
      clearLoadedDuty();
      setStatus("Target is not a duty. Building GPS route with selected NX stops...", "warn");
      const viaStops = state.viaStopIds.map((id) => state.stopById.get(String(id))).filter(Boolean);
      if (viaStops.length > 0) {
        const viaPoints = await Promise.all(viaStops.map((stop) => geocodeStop(stop)));
        viaPoints.forEach((point, index) => {
          const stop = viaStops[index];
          points.push({ lat: point.lat, lon: point.lon });
          labels.push({ name: stop.name, postcode: stop.postcode });
        });
      }

      const destination = await resolveDestinationTarget(targetText);
      points.push({ lat: destination.point.lat, lon: destination.point.lon });
      labels.push(destination.label);
    }

    const planned = collapseConsecutiveDuplicateRoutePoints(points, labels);
    if (planned.points.length < 2) {
      throw new Error("Route needs at least a start and one destination stop.");
    }

    setStatus("Requesting route...", "warn");
    const apiKey = el.keyInput.value.trim();
    const routeResult = await routeBetweenPoints(planned.points, apiKey);

    drawRoute(planned.points, planned.labels, routeResult);
    renderSummary(routeResult);
    renderDirections(routeResult);

    const profileText =
      routeResult.source === "ors-hgv"
        ? "HGV-safe profile"
        : routeResult.source === "ors-car"
          ? "standard driving profile"
          : "fallback road profile";

    setStatus(`Route planned successfully from live location (${profileText}).`, "ok");
    return true;
  } catch (error) {
    setStatus(error.message || "Route planning failed.", "err");
    return false;
  } finally {
    el.planBtn.disabled = false;
    updateStartButtonState();
  }
}

async function resolveDestinationTarget(targetText) {
  const stop = findStopByQuery(targetText);
  if (stop) {
    const point = await geocodeStop(stop);
    return {
      point,
      label: { name: stop.name, postcode: stop.postcode },
    };
  }
  const result = await geocodeQuery(targetText);
  return {
    point: { lat: result.lat, lon: result.lon },
    label: { name: result.label, postcode: result.subtitle },
  };
}

function findStopByQuery(query) {
  const normalizedText = String(query || "").trim().toLowerCase();
  if (!normalizedText) {
    return null;
  }
  const compactQuery = normalizedText.replace(/\s+/g, "");
  for (const stop of state.stops) {
    const stopName = String(stop.name || "").trim().toLowerCase();
    const stopPostcode = String(stop.postcode || "").trim().toLowerCase();
    if (normalizedText === stopName || compactQuery === stopPostcode.replace(/\s+/g, "")) {
      return stop;
    }
  }
  return null;
}

function collapseConsecutiveDuplicateRoutePoints(points, labels) {
  const collapsedPoints = [];
  const collapsedLabels = [];
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const label = labels[i];
    if (!point || !label) {
      continue;
    }
    const prev = collapsedPoints[collapsedPoints.length - 1];
    if (prev && Math.abs(prev.lat - point.lat) < 0.00001 && Math.abs(prev.lon - point.lon) < 0.00001) {
      continue;
    }
    collapsedPoints.push(point);
    collapsedLabels.push(label);
  }
  return { points: collapsedPoints, labels: collapsedLabels };
}

function handleOpenStreetViewAtCenter() {
  const center = map.getCenter();
  openStreetView(center.lat, center.lng);
}

async function handleOpenStreetViewAtStartStop() {
  if (!state.currentPlan || !Array.isArray(state.currentPlan.points) || state.currentPlan.points.length < 2) {
    setStatus("Plan a route first to open Street View for the first stop.", "warn");
    return;
  }

  const streetViewWindow = window.open("about:blank", "_blank", "noopener,noreferrer");
  if (!streetViewWindow) {
    setStatus("Popup blocked. Allow popups for this site to open Street View.", "warn");
    return;
  }

  try {
    const firstStopPoint = state.currentPlan.points[1];
    openStreetView(firstStopPoint.lat, firstStopPoint.lon, streetViewWindow);
  } catch (error) {
    streetViewWindow.close();
    setStatus(error.message || "Unable to open Street View for first route stop.", "err");
  }
}

function openStreetView(lat, lon, targetWindow = null) {
  const latValue = Number(lat);
  const lonValue = Number(lon);
  if (!Number.isFinite(latValue) || !Number.isFinite(lonValue)) {
    setStatus("Invalid map coordinates for Street View.", "err");
    return;
  }

  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latValue},${lonValue}`;
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function getCurrentStartPointFromGps() {
  if (state.lastLivePosition && Number.isFinite(state.lastLivePosition.lat) && Number.isFinite(state.lastLivePosition.lon)) {
    return state.lastLivePosition;
  }

  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation is not available in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude);
        const lon = Number(position.coords.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          reject(new Error("Could not read current GPS location."));
          return;
        }
        const point = { lat, lon };
        state.lastLivePosition = point;
        resolve(point);
      },
      (error) => {
        let message = "Unable to get current GPS location.";
        if (error && error.code === 1) message = "Location permission denied.";
        if (error && error.code === 2) message = "Location unavailable.";
        if (error && error.code === 3) message = "Location request timed out.";
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000,
      },
    );
  });
}

function shouldTryPublicFallback(activeBaseUrl, publicBaseUrl) {
  if (!state.settings.usePublicFallback) {
    return false;
  }
  return normalizeBaseUrl(activeBaseUrl, publicBaseUrl) !== normalizeBaseUrl(publicBaseUrl, publicBaseUrl);
}

function buildPostcodeLookupUrl(baseUrl, postcode) {
  return `${normalizeBaseUrl(baseUrl, DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl)}/postcodes/${encodeURIComponent(postcode)}`;
}

function buildNominatimSearchUrl(baseUrl, query) {
  const root = normalizeBaseUrl(baseUrl, DEFAULT_PROVIDER_ENDPOINTS.geocoderBaseUrl);
  return `${root}/search?format=jsonv2&limit=8&addressdetails=1&dedupe=1&countrycodes=gb&q=${encodeURIComponent(query)}`;
}

async function geocodeQuery(query) {
  const text = String(query || "").trim();
  if (!text) {
    throw new Error("Empty place/postcode query.");
  }

  const cacheKey = `query:${text.toLowerCase()}`;
  if (state.geocodeCache.has(cacheKey)) {
    return state.geocodeCache.get(cacheKey);
  }

  const compact = text.replace(/\s+/g, "").toUpperCase();
  const looksLikePostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(compact);
  if (looksLikePostcode) {
    const postcodePrimaryUrl = buildPostcodeLookupUrl(state.settings.postcodeBaseUrl, compact);
    const postcodeFallbackUrl = buildPostcodeLookupUrl(DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl, compact);
    let postcodeResponse = await fetch(postcodePrimaryUrl);
    if (!postcodeResponse.ok && shouldTryPublicFallback(state.settings.postcodeBaseUrl, DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl)) {
      postcodeResponse = await fetch(postcodeFallbackUrl);
    }
    if (postcodeResponse.ok) {
      const payload = await postcodeResponse.json();
      if (payload.status === 200 && payload.result) {
        const point = {
          lat: payload.result.latitude,
          lon: payload.result.longitude,
          label: payload.result.admin_district || text,
          subtitle: payload.result.postcode || text,
        };
        state.geocodeCache.set(cacheKey, point);
        persistGeocodeCache();
        return point;
      }
    }
  }

  const nominatimPrimaryUrl = buildNominatimSearchUrl(state.settings.geocoderBaseUrl, text);
  const nominatimFallbackUrl = buildNominatimSearchUrl(DEFAULT_PROVIDER_ENDPOINTS.geocoderBaseUrl, text);
  let response = await fetch(nominatimPrimaryUrl, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok && shouldTryPublicFallback(state.settings.geocoderBaseUrl, DEFAULT_PROVIDER_ENDPOINTS.geocoderBaseUrl)) {
    response = await fetch(nominatimFallbackUrl, {
      headers: { Accept: "application/json" },
    });
  }
  if (!response.ok) {
    throw new Error(`Geocoder request failed for "${text}" (status ${response.status}).`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Could not find location: "${text}".`);
  }

  const best = pickBestNominatimResult(text, results);
  const lat = Number(best.lat);
  const lon = Number(best.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Invalid geocoder result for "${text}".`);
  }

  const displayName = String(best.display_name || text);
  const point = {
    lat,
    lon,
    label: displayName.split(",")[0] || text,
    subtitle: displayName,
  };
  state.geocodeCache.set(cacheKey, point);
  persistGeocodeCache();
  return point;
}

function pickBestNominatimResult(inputText, results) {
  const searchText = String(inputText || "").trim();
  const postcodeToken = extractPostcodeToken(searchText);
  const tokens = extractSearchTokens(searchText);

  let best = results[0];
  let bestScore = -Infinity;

  for (const candidate of results) {
    const displayName = String(candidate.display_name || "").toLowerCase();
    const type = String(candidate.type || "").toLowerCase();
    const cls = String(candidate.class || "").toLowerCase();
    const category = `${cls}:${type}`;
    let score = 0;

    if (postcodeToken && displayName.includes(postcodeToken.toLowerCase())) {
      score += 200;
    }

    let tokenHits = 0;
    for (const token of tokens) {
      if (displayName.includes(token)) {
        tokenHits += 1;
      }
    }
    score += tokenHits * 14;
    score += Math.max(0, 8 - Math.max(0, tokens.length - tokenHits) * 2);

    if (category.includes("highway:") || category.includes("building:") || category.includes("place:house")) {
      score += 12;
    }
    if (category.includes("amenity:") || category.includes("tourism:")) {
      score += 8;
    }
    if (category.includes("place:city") || category.includes("place:town") || category.includes("place:suburb")) {
      score += 6;
    }

    const importance = Number(candidate.importance);
    if (Number.isFinite(importance)) {
      score += Math.min(importance * 10, 6);
    }

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

function extractSearchTokens(inputText) {
  return String(inputText || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 10);
}

function extractPostcodeToken(inputText) {
  const compact = String(inputText || "").toUpperCase().replace(/\s+/g, "");
  const match = compact.match(/[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}/);
  return match ? match[0] : "";
}

async function geocodeStop(stop) {
  if (state.geocodeCache.has(stop.postcode)) {
    return state.geocodeCache.get(stop.postcode);
  }

  const compactPostcode = stop.postcode.replace(/\s+/g, "");
  const primaryUrl = buildPostcodeLookupUrl(state.settings.postcodeBaseUrl, compactPostcode);
  const fallbackUrl = buildPostcodeLookupUrl(DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl, compactPostcode);
  let response = await fetch(primaryUrl);
  if (!response.ok && shouldTryPublicFallback(state.settings.postcodeBaseUrl, DEFAULT_PROVIDER_ENDPOINTS.postcodeBaseUrl)) {
    response = await fetch(fallbackUrl);
  }
  if (!response.ok) {
    throw new Error(`Postcode lookup failed for ${stop.name} (${stop.postcode}).`);
  }

  const payload = await response.json();
  if (payload.status !== 200 || !payload.result) {
    throw new Error(`Could not geocode ${stop.postcode}.`);
  }

  const point = {
    lat: payload.result.latitude,
    lon: payload.result.longitude,
  };

  state.geocodeCache.set(stop.postcode, point);
  persistGeocodeCache();
  return point;
}

function buildVehicleRestrictions() {
  const profile = getCoachProfileConfig();
  const safetyMarginMeters = profile.restrictionMarginMeters;
  const height = Number(el.heightInput.value);
  const width = Number(el.widthInput.value);
  const length = Number(el.lengthInput.value);
  const weightTons = Number(el.weightInput.value);

  const restrictions = {};
  if (Number.isFinite(height) && height > 0) restrictions.height = height + safetyMarginMeters;
  if (Number.isFinite(width) && width > 0) restrictions.width = width + safetyMarginMeters;
  if (Number.isFinite(length) && length > 0) restrictions.length = length + safetyMarginMeters;
  if (Number.isFinite(weightTons) && weightTons > 0) restrictions.weight = weightTons;

  return restrictions;
}

function getCoachProfileConfig() {
  const profile = String(state.settings.coachProfile || "safe");
  if (profile === "fast") {
    return {
      orsPreference: "fastest",
      restrictionMarginMeters: 0,
      extraAvoidFeatures: [],
    };
  }
  if (profile === "balanced") {
    return {
      orsPreference: "recommended",
      restrictionMarginMeters: 0.05,
      extraAvoidFeatures: [],
    };
  }
  return {
    orsPreference: "recommended",
    restrictionMarginMeters: 0.12,
    extraAvoidFeatures: ["fords"],
  };
}

async function routeBetweenPoints(points, apiKey) {
  const coords = points.map((p) => [p.lon, p.lat]);
  const profile = getCoachProfileConfig();
  const avoidFeatures = buildAvoidFeatures();
  const osrmExcludes = buildOSRMExcludes();

  const mode = String(state.settings.routingProvider || "auto");
  const attempts = [];
  const includeORS = Boolean(apiKey);

  if (mode === "ors-hgv") {
    if (!includeORS) {
      throw new Error("Routing backend is set to ORS HGV only, but ORS API key is missing.");
    }
    attempts.push({ kind: "ors-hgv" });
  } else if (mode === "ors-car") {
    if (!includeORS) {
      throw new Error("Routing backend is set to ORS car only, but ORS API key is missing.");
    }
    attempts.push({ kind: "ors-car" });
  } else if (mode === "osrm") {
    attempts.push({ kind: "osrm" });
  } else {
    if (includeORS) {
      attempts.push({ kind: "ors-hgv" }, { kind: "ors-car" });
    }
    attempts.push({ kind: "osrm" });
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      if (attempt.kind === "ors-hgv") {
        const hgvResult = await fetchORSRoute(
          coords,
          apiKey,
          "driving-hgv",
          buildVehicleRestrictions(),
          avoidFeatures,
          { preference: profile.orsPreference },
        );
        const guidanceSteps = buildGuidanceSteps(flattenORSSteps(hgvResult.feature.properties.segments));
        const roadSegments = extractORSRoadSegments(hgvResult.feature);
        return {
          source: "ors-hgv",
          distanceMeters: hgvResult.feature.properties.summary.distance,
          durationSeconds: hgvResult.feature.properties.summary.duration,
          lineCoords: hgvResult.feature.geometry.coordinates,
          guidanceSteps,
          roadSegments,
        };
      }

      if (attempt.kind === "ors-car") {
        const carResult = await fetchORSRoute(coords, apiKey, "driving-car", null, avoidFeatures, {
          preference: profile.orsPreference,
        });
        const guidanceSteps = buildGuidanceSteps(flattenORSSteps(carResult.feature.properties.segments));
        const roadSegments = extractORSRoadSegments(carResult.feature);
        return {
          source: "ors-car",
          distanceMeters: carResult.feature.properties.summary.distance,
          durationSeconds: carResult.feature.properties.summary.duration,
          lineCoords: carResult.feature.geometry.coordinates,
          guidanceSteps,
          roadSegments,
        };
      }

      const osrmResult = await fetchOSRMRoute(coords, osrmExcludes);
      const guidanceSteps = buildGuidanceSteps(flattenOSRMSteps(osrmResult.route.legs));
      const roadSegments = extractOSRMRoadSegments(osrmResult.route);
      return {
        source: "osrm-fallback",
        distanceMeters: osrmResult.route.distance,
        durationSeconds: osrmResult.route.duration,
        lineCoords: osrmResult.route.geometry.coordinates,
        guidanceSteps,
        roadSegments,
      };
    } catch (error) {
      errors.push(`${attempt.kind}: ${error.message || "failed"}`);
    }
  }

  throw new Error(`No routing provider returned a route. ${errors.join(" | ")}`);
}

async function fetchORSRoute(coords, apiKey, profile, restrictions, avoidFeatures = [], requestOptions = {}) {
  const activeBaseUrl = normalizeBaseUrl(state.settings.orsBaseUrl, DEFAULT_PROVIDER_ENDPOINTS.orsBaseUrl);
  const publicBaseUrl = DEFAULT_PROVIDER_ENDPOINTS.orsBaseUrl;
  const buildUrl = (baseUrl) => `${normalizeBaseUrl(baseUrl, publicBaseUrl)}/v2/directions/${profile}/geojson`;
  const body = {
    coordinates: coords,
    instructions: true,
    preference: requestOptions.preference || "recommended",
  };

  const options = {};
  if (restrictions && Object.keys(restrictions).length > 0 && profile === "driving-hgv") {
    Object.assign(options, {
      vehicle_type: "hgv",
      profile_params: {
        restrictions,
      },
    });
  }

  if (Array.isArray(avoidFeatures) && avoidFeatures.length > 0) {
    options.avoid_features = avoidFeatures;
  }

  if (Object.keys(options).length > 0) {
    body.options = options;
  }

  const doRequest = (baseUrl) =>
    fetch(buildUrl(baseUrl), {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  let response = await doRequest(activeBaseUrl);
  if (!response.ok && shouldTryPublicFallback(activeBaseUrl, publicBaseUrl)) {
    response = await doRequest(publicBaseUrl);
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `ORS request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.features || payload.features.length === 0) {
    throw new Error("ORS returned no route features.");
  }

  return { feature: payload.features[0] };
}

async function fetchOSRMRoute(coords, excludes = []) {
  const coordString = coords.map((pair) => pair.join(",")).join(";");
  const activeBaseUrl = normalizeBaseUrl(state.settings.osrmBaseUrl, DEFAULT_PROVIDER_ENDPOINTS.osrmBaseUrl);
  const publicBaseUrl = DEFAULT_PROVIDER_ENDPOINTS.osrmBaseUrl;
  const routeUrl = (baseUrl, excludeList) => {
    const excludeParam =
      Array.isArray(excludeList) && excludeList.length > 0
        ? `&exclude=${encodeURIComponent(excludeList.join(","))}`
        : "";
    return `${normalizeBaseUrl(baseUrl, publicBaseUrl)}/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true${excludeParam}`;
  };

  let response = await fetch(routeUrl(activeBaseUrl, excludes));
  if (!response.ok && Array.isArray(excludes) && excludes.length > 0) {
    response = await fetch(routeUrl(activeBaseUrl, []));
  }
  if (!response.ok && shouldTryPublicFallback(activeBaseUrl, publicBaseUrl)) {
    response = await fetch(routeUrl(publicBaseUrl, excludes));
    if (!response.ok && Array.isArray(excludes) && excludes.length > 0) {
      response = await fetch(routeUrl(publicBaseUrl, []));
    }
  }
  if (!response.ok) {
    throw new Error(`OSRM request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.routes || payload.routes.length === 0) {
    throw new Error("No route found by fallback router.");
  }

  return { route: payload.routes[0] };
}

function extractORSRoadSegments(feature) {
  const routeCoords = feature?.geometry?.coordinates || [];
  const segments = feature?.properties?.segments || [];
  const styled = [];
  for (const segment of segments) {
    for (const step of segment.steps || []) {
      const wayPoints = Array.isArray(step.way_points) ? step.way_points : [];
      if (wayPoints.length < 2) {
        continue;
      }
      const start = clamp(Math.floor(wayPoints[0]), 0, routeCoords.length - 1);
      const end = clamp(Math.floor(wayPoints[1]), 0, routeCoords.length - 1);
      if (end <= start) {
        continue;
      }
      const coords = routeCoords.slice(start, end + 1);
      if (coords.length < 2) {
        continue;
      }
      const roadType = classifyRoadType([step.name, step.instruction].join(" "));
      styled.push({ roadType, lineCoords: coords });
    }
  }
  return mergeRoadSegments(styled);
}

function extractOSRMRoadSegments(route) {
  const styled = [];
  for (const leg of route?.legs || []) {
    for (const step of leg.steps || []) {
      const coords = step?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        continue;
      }
      const roadType = classifyRoadType([step.ref, step.name, step.destinations, step.maneuver?.type].join(" "));
      styled.push({ roadType, lineCoords: coords });
    }
  }
  return mergeRoadSegments(styled);
}

function mergeRoadSegments(segments) {
  const merged = [];
  for (const segment of segments || []) {
    if (!segment || !Array.isArray(segment.lineCoords) || segment.lineCoords.length < 2) {
      continue;
    }
    const roadType = segment.roadType || "other";
    const last = merged[merged.length - 1];
    if (last && last.roadType === roadType) {
      const combined = [...last.lineCoords, ...segment.lineCoords.slice(1)];
      last.lineCoords = combined;
      continue;
    }
    merged.push({
      roadType,
      lineCoords: [...segment.lineCoords],
    });
  }
  return merged;
}

function flattenORSSteps(segments) {
  if (!segments) {
    return [];
  }

  const steps = [];
  for (const segment of segments) {
    for (const step of segment.steps || []) {
      steps.push({
        text: step.instruction,
        distance: step.distance,
        duration: step.duration,
      });
    }
  }

  return steps;
}

function flattenOSRMSteps(legs) {
  const steps = [];

  for (const leg of legs || []) {
    for (const step of leg.steps || []) {
      const maneuverType = step.maneuver?.type || "continue";
      const maneuverModifier = step.maneuver?.modifier ? ` ${step.maneuver.modifier}` : "";
      const road = step.name ? ` onto ${step.name}` : "";
      steps.push({
        text: `${capitalizeFirst(maneuverType)}${maneuverModifier}${road}`,
        distance: step.distance,
        duration: step.duration,
      });
    }
  }

  return steps;
}

function buildGuidanceSteps(steps) {
  const normalized = [];
  let cumulative = 0;

  for (const step of steps || []) {
    const distance = Number(step.distance) || 0;
    const duration = Number(step.duration) || 0;
    const text = String(step.text || "Continue");
    const startDistance = cumulative;
    cumulative += Math.max(0, distance);
    normalized.push({
      text,
      distance,
      duration,
      startDistance,
      endDistance: cumulative,
    });
  }

  return normalized;
}

function drawRoute(points, orderedStops, routeResult) {
  state.markerLayer.clearLayers();
  state.roadStyleLayer.clearLayers();

  orderedStops.forEach((stop, index) => {
    const point = points[index];
    const marker = L.marker([point.lat, point.lon], {
      icon: L.divIcon({
        className: "",
        html: `<div class=\"stop-marker\">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    });

    marker.bindPopup(`<strong>${index + 1}. ${escapeHtml(stop.name)}</strong><br>${escapeHtml(stop.postcode)}`);
    marker.addTo(state.markerLayer);
  });

  if (state.routeLayer) {
    map.removeLayer(state.routeLayer);
  }

  const lineLatLngs = routeResult.lineCoords.map(([lon, lat]) => [lat, lon]);
  state.routeLayer = L.polyline(lineLatLngs, {
    color: state.settings.routeColor,
    weight: BASE_ROUTE_LINE_WEIGHT,
    opacity: BASE_ROUTE_LINE_OPACITY,
  }).addTo(map);

  const roadSegments = Array.isArray(routeResult.roadSegments) ? routeResult.roadSegments : [];
  for (const segment of roadSegments) {
    const roadType = segment.roadType || "other";
    const color = getRoadColor(roadType);
    const latLngs = (segment.lineCoords || []).map(([lon, lat]) => [lat, lon]);
    if (latLngs.length < 2) {
      continue;
    }
    L.polyline(latLngs, {
      color,
      weight: roadType === "other" ? BASE_ROAD_STYLE_OTHER_WEIGHT : 8,
      opacity: roadType === "other" ? BASE_ROAD_STYLE_OTHER_OPACITY : 0.98,
      lineCap: "round",
      lineJoin: "round",
      roadType,
    }).addTo(state.roadStyleLayer);
  }

  const bounds = L.latLngBounds([
    ...points.map((p) => [p.lat, p.lon]),
    ...lineLatLngs,
  ]);
  map.fitBounds(bounds, { padding: [35, 35] });

  state.currentPlan = {
    points: points.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) })),
    labels: orderedStops.map((stop) => ({
      name: String(stop?.name || "Route stop"),
      postcode: String(stop?.postcode || ""),
    })),
  };
  state.routeGuide = buildRouteGuide(
    lineLatLngs,
    routeResult.guidanceSteps || [],
    state.currentPlan.points,
    routeResult.durationSeconds,
  );
  evaluateRouteHazards();
  updateVisibleRouteForProgress(state.navigationMode ? state.lastMatchedProgressMeters : Number.NaN);
  state.routePreviewReady = true;
  state.lastGuidanceStepIndex = -1;
  state.lastSpokenStepIndex = -1;
  state.spokenStepStages = new Map();
  state.lastMatchedProgressMeters = 0;
  state.offRouteSampleCount = 0;
  state.arrivalAnnounced = false;
  state.rerouteInFlight = false;
  el.navStatus.textContent = "Route overview ready. Tap Start Nav to enter street-level chase mode.";
  updateStartButtonState();
  const firstRoadName = inferRoadNameFromInstruction(routeResult.guidanceSteps?.[0]?.text || "");
  setRoadName(firstRoadName || DEFAULT_TOP_ROAD_NAME);

  if (state.driverMarker) {
    const livePos = state.driverMarker.getLatLng();
    updateLiveGuidanceFromPoint(livePos.lat, livePos.lng, null);
  }
}

function renderSummary(routeResult) {
  const distanceText = formatDistance(routeResult.distanceMeters);
  const mins = Math.round(routeResult.durationSeconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  const durationText = hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;

  let sourceText = "Fallback route engine";
  if (routeResult.source === "ors-hgv") {
    sourceText = "OpenRouteService HGV profile";
  } else if (routeResult.source === "ors-car") {
    sourceText = "OpenRouteService driving-car profile";
  }

  let dutyText = "";
  if (state.loadedDuty) {
    const routes = Array.isArray(state.loadedDuty.routeCodes) ? state.loadedDuty.routeCodes.join("/") : "";
    dutyText = routes ? ` | Duty ${state.loadedDuty.dutyId} (${routes})` : ` | Duty ${state.loadedDuty.dutyId}`;
  }

  const roadBadgeText = summarizeRoadTypeCoverage(routeResult.roadSegments || []);
  const roadText = roadBadgeText ? ` | ${roadBadgeText}` : "";
  const hazardText = summarizeHazardSummary();
  const hazardSuffix = hazardText ? ` | ${hazardText}` : "";
  el.summary.textContent = `${distanceText} | ${durationText} | ${sourceText}${dutyText}${roadText}${hazardSuffix}`;
}

function renderDirections(routeResult) {
  el.directions.innerHTML = "";

  const directions = (routeResult.guidanceSteps || []).slice(0, 40);
  if (directions.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No turn-by-turn details returned by routing provider.";
    el.directions.append(li);
    return;
  }

  directions.forEach((step) => {
    const li = document.createElement("li");
    const distance = formatDistance(step.distance);
    const duration = formatDuration(step.duration);
    const text = document.createElement("div");
    text.textContent = step.text;
    const meta = document.createElement("div");
    meta.className = "step-meta";
    meta.textContent = `${distance} | ${duration}`;
    li.append(text, meta);
    el.directions.append(li);
  });
}

function renderDutyTimeline() {
  el.dutyTimeline.innerHTML = "";

  if (!state.loadedDuty) {
    const li = document.createElement("li");
    li.textContent = "No duty loaded.";
    el.dutyTimeline.append(li);
    return;
  }

  const items = state.loadedDuty.timeline.slice(0, 120);
  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No timings available for this duty.";
    el.dutyTimeline.append(li);
    return;
  }

  if (isA6Duty(state.loadedDuty)) {
    const split = splitA6Timeline(items, state.loadedDuty.stopIds || []);
    renderDutySection("Outbound", split.outbound);
    renderDutySection("Return", split.returnLeg);
    return;
  }

  renderDutyEvents(items);
}

function renderDutySection(titleText, events) {
  const heading = document.createElement("li");
  heading.className = "timeline-heading";
  heading.textContent = titleText;
  el.dutyTimeline.append(heading);

  if (!events || events.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No timing events found for this section.";
    el.dutyTimeline.append(empty);
    return;
  }

  renderDutyEvents(events);
}

function renderDutyEvents(events) {
  events.forEach((event) => {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = `${event.time} - ${event.description}`;
    li.append(title);

    if (event.stopId && state.stopById.has(String(event.stopId))) {
      const stop = state.stopById.get(String(event.stopId));
      const meta = document.createElement("div");
      meta.className = "step-meta";
      meta.textContent = `${stop.name} (${stop.postcode})`;
      li.append(meta);
    }

    el.dutyTimeline.append(li);
  });
}

function isA6Duty(duty) {
  const routeCodes = Array.isArray(duty.routeCodes) ? duty.routeCodes : [];
  return routeCodes.some((code) => String(code).trim().toUpperCase() === "A6");
}

function splitA6Timeline(items, stopIds) {
  const normalizedStopIds = Array.isArray(stopIds) ? stopIds : [];
  if (normalizedStopIds.length < 3) {
    return { outbound: items, returnLeg: [] };
  }

  const turnaroundStopId = normalizedStopIds[Math.floor(normalizedStopIds.length / 2)];
  if (!turnaroundStopId) {
    return { outbound: items, returnLeg: [] };
  }

  const firstTurnaroundIndex = items.findIndex((event) => Number(event.stopId) === Number(turnaroundStopId));
  if (firstTurnaroundIndex === -1) {
    return { outbound: items, returnLeg: [] };
  }

  const firstReturnStopIndex = items.findIndex(
    (event, index) => index > firstTurnaroundIndex && event.stopId && Number(event.stopId) !== Number(turnaroundStopId),
  );

  if (firstReturnStopIndex === -1) {
    return { outbound: items, returnLeg: [] };
  }

  return {
    outbound: items.slice(0, firstReturnStopIndex),
    returnLeg: items.slice(firstReturnStopIndex),
  };
}

function startLiveGuidance() {
  if (!state.routeGuide || state.routeGuide.lineLatLngs.length < 2) {
    setStatus("Plan a route first, then start live GPS guidance.", "warn");
    return;
  }

  if (!("geolocation" in navigator)) {
    setStatus("Geolocation is not available in this browser.", "err");
    return;
  }

  if (state.gpsWatchId !== null) {
    setStatus("Live GPS guidance is already running.", "warn");
    return;
  }

  state.navigationMode = true;
  state.navCameraInitialized = false;
  state.navCameraState = null;
  state.navStableZoom = null;
  state.lastGuidanceStepIndex = -1;
  state.lastSpokenStepIndex = -1;
  state.offRouteSampleCount = 0;
  state.arrivalAnnounced = false;
  state.navSearchOverlayOpen = false;
  state.cameraFollowEnabled = true;
  state.cameraFollowPausedUntil = 0;
  state.settings = sanitizeSettings({
    ...state.settings,
    cameraFollow: true,
  });
  persistSettings();
  if (el.settingCameraFollow) {
    el.settingCameraFollow.checked = true;
  }
  clearPendingLivePositionTimer();
  state.pendingLivePosition = null;
  state.lastProcessedPositionAt = 0;
  state.rawGpsUpdateCount = 0;
  state.processedGpsUpdateCount = 0;
  setStopsSheetOpen(false);
  setSettingsSheetOpen(false);
  if (state.voiceGuidanceEnabled && state.speechSupported) {
    primeSpeechFromUserGesture();
  }
  state.gpsWatchId = navigator.geolocation.watchPosition(
    handleRawLivePosition,
    handleLivePositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    },
  );

  setGuidanceButtonsRunning(true);
  el.gpsStatus.textContent = "GPS starting... waiting for location lock.";
  el.navStatus.textContent = "Starting 3D chase navigation view...";
  el.laneStatus.textContent = "Lane guidance will appear before major turns.";
  applyNavigationChromeState();
  startTelemetrySession();

  recenterCameraToLivePosition(true);

  speakInitialInstruction();
}

function stopLiveGuidance() {
  stopTelemetryReplay();
  stopSimulatedGpsFeed();
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
  clearPendingLivePositionTimer();
  state.pendingLivePosition = null;
  state.lastProcessedPositionAt = 0;
  if (state.speechSupported) {
    window.speechSynthesis.cancel();
  }
  finishTelemetrySession();
  resetToBlankMapState();
  setStatus("Navigation stopped and map reset.", "ok");
}

function resetToBlankMapState() {
  state.rerouteInFlight = false;
  state.navigationMode = false;
  state.navCameraInitialized = false;
  state.navCameraState = null;
  state.lastGuidanceStepIndex = -1;
  state.lastSpokenStepIndex = -1;
  state.lastLivePosition = null;
  state.lastGpsSample = null;
  state.lastHeadingDeg = Number.NaN;
  state.routeGuide = null;
  state.currentPlan = null;
  state.lastRerouteAt = 0;
  state.lastMatchedProgressMeters = 0;
  state.offRouteSampleCount = 0;
  state.spokenStepStages = new Map();
  state.arrivalAnnounced = false;
  state.pendingLivePosition = null;
  state.lastProcessedPositionAt = 0;
  state.rawGpsUpdateCount = 0;
  state.processedGpsUpdateCount = 0;
  state.routePreviewReady = false;
  state.routePreviewInFlight = false;
  state.lastPlanSignature = "";
  state.navSearchOverlayOpen = false;
  state.navStableZoom = null;
  state.cameraFollowEnabled = true;
  state.cameraFollowPausedUntil = 0;
  clearPendingLivePositionTimer();

  clearDestinationPreview();

  if (state.routeLayer) {
    map.removeLayer(state.routeLayer);
    state.routeLayer = null;
  }
  state.roadStyleLayer.clearLayers();
  state.markerLayer.clearLayers();
  stopDriverMarkerMotion();

  if (state.driverMarker) {
    map.removeLayer(state.driverMarker);
    state.driverMarker = null;
  }

  state.viaStopIds = [];
  renderViaList();
  clearLoadedDuty();

  if (el.nxStopSelect.options.length > 0) {
    el.nxStopSelect.value = "";
    if (!el.nxStopSelect.value) {
      el.nxStopSelect.selectedIndex = 0;
    }
  }

  el.targetInput.value = "";
  updateStartButtonState();
  el.planBtn.textContent = "Start";

  el.summary.textContent = DEFAULT_SUMMARY_TEXT;
  el.directions.innerHTML = "";
  el.navStatus.textContent = DEFAULT_NAV_STATUS_TEXT;
  el.gpsStatus.textContent = DEFAULT_GPS_STATUS_TEXT;
  el.laneStatus.textContent = "Lane guidance will appear before major turns.";

  setGuidanceButtonsRunning(false);
  setStopsSheetOpen(false);
  setSettingsSheetOpen(false);
  applyNavigationChromeState();
  setRoadName(DEFAULT_TOP_ROAD_NAME);
  setMapBearing(0);
  map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, { animate: true });
}

function handleVoiceGuidanceToggleClick() {
  if (!state.speechSupported) {
    setStatus("Voice guidance is not supported on this browser.", "warn");
    return;
  }
  state.voiceGuidanceEnabled = !state.voiceGuidanceEnabled;
  state.settings = sanitizeSettings({
    ...state.settings,
    voiceEnabled: state.voiceGuidanceEnabled,
  });
  persistSettings();
  updateSettingsUI();
  updateVoiceGuidanceButton();
  if (state.voiceGuidanceEnabled) {
    const primed = primeSpeechFromUserGesture();
    if (!primed) {
      reportSpeechWarning("Voice guidance may be blocked. Turn off silent mode and raise media volume.");
    } else {
      speakText("Voice guidance enabled", { suppressStatusOnError: true });
    }
  }
  if (!state.voiceGuidanceEnabled && state.speechSupported) {
    window.speechSynthesis.cancel();
    state.lastSpokenStepIndex = -1;
    state.spokenStepStages = new Map();
    state.speechPrimed = false;
  }
}

function updateVoiceGuidanceButton() {
  if (!state.speechSupported) {
    el.voiceGuidanceToggle.textContent = "🔇";
    el.voiceGuidanceToggle.setAttribute("aria-pressed", "false");
    el.voiceGuidanceToggle.title = "Voice guidance not supported on this browser";
    el.voiceGuidanceToggle.disabled = true;
    return;
  }
  el.voiceGuidanceToggle.disabled = false;
  el.voiceGuidanceToggle.textContent = state.voiceGuidanceEnabled ? "🔊" : "🔇";
  el.voiceGuidanceToggle.setAttribute("aria-pressed", state.voiceGuidanceEnabled ? "true" : "false");
  el.voiceGuidanceToggle.title = state.voiceGuidanceEnabled ? "Voice guidance on" : "Voice guidance off";
}

function setGuidanceButtonsRunning(isRunning) {
  if (el.stopGuidanceBtn) {
    el.stopGuidanceBtn.disabled = !isRunning;
  }
}

function clearPendingLivePositionTimer() {
  if (state.pendingPositionTimerId !== null) {
    window.clearTimeout(state.pendingPositionTimerId);
    state.pendingPositionTimerId = null;
  }
}

function schedulePendingLivePositionProcessing() {
  clearPendingLivePositionTimer();
  const now = Date.now();
  const elapsed = now - state.lastProcessedPositionAt;
  const delayMs = Math.max(0, POSITION_PROCESS_THROTTLE_MS - Math.max(0, elapsed));
  state.pendingPositionTimerId = window.setTimeout(() => {
    state.pendingPositionTimerId = null;
    processPendingLivePosition();
  }, delayMs);
}

function handleRawLivePosition(position) {
  state.rawGpsUpdateCount += 1;
  state.pendingLivePosition = position;
  if (!state.navigationMode) {
    processPendingLivePosition();
    return;
  }

  const now = Date.now();
  const elapsed = now - state.lastProcessedPositionAt;
  if (state.lastProcessedPositionAt <= 0 || elapsed >= POSITION_PROCESS_THROTTLE_MS) {
    processPendingLivePosition();
    return;
  }

  if (state.pendingPositionTimerId === null) {
    schedulePendingLivePositionProcessing();
  }
}

function processPendingLivePosition() {
  const pending = state.pendingLivePosition;
  if (!pending) {
    return;
  }
  state.pendingLivePosition = null;
  state.lastProcessedPositionAt = Date.now();
  state.processedGpsUpdateCount += 1;
  processLivePosition(pending);
}

function processLivePosition(position) {
  const lat = Number(position.coords.latitude);
  const lon = Number(position.coords.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return;
  }
  const timestampMs = Number(position.timestamp) || Date.now();
  const headingDeg = extractHeadingDegrees(position, lat, lon, timestampMs);
  const speedMps = extractSpeedMps(position);
  state.lastLivePosition = { lat, lon };
  state.lastGpsSample = { lat, lon, timestampMs };
  state.lastHeadingDeg = headingDeg;

  const guidanceSnapshot = updateLiveGuidanceFromPoint(lat, lon, position, speedMps);
  const snappedLat = Number(guidanceSnapshot?.snappedLat);
  const snappedLon = Number(guidanceSnapshot?.snappedLon);
  const snappedHeadingDeg = Number(guidanceSnapshot?.routeHeadingDeg);
  const markerLat = Number.isFinite(snappedLat) ? snappedLat : lat;
  const markerLon = Number.isFinite(snappedLon) ? snappedLon : lon;
  const markerHeadingDeg = Number.isFinite(snappedHeadingDeg) ? snappedHeadingDeg : headingDeg;
  updateDriverMarkerMotion(markerLat, markerLon, markerHeadingDeg, speedMps);
  updateNavigationCamera(lat, lon, speedMps, headingDeg, guidanceSnapshot);
}

function handleLivePositionError(error) {
  let message = "Unable to get GPS location.";
  if (error && error.code === 1) message = "Location permission denied.";
  if (error && error.code === 2) message = "Location unavailable.";
  if (error && error.code === 3) message = "Location request timed out.";
  el.gpsStatus.textContent = message;
}

function toSimPoint(entry) {
  if (Array.isArray(entry) && entry.length >= 2) {
    const lat = Number(entry[0]);
    const lon = Number(entry[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
    return null;
  }
  if (entry && typeof entry === "object") {
    const lat = Number(entry.lat);
    const lon = Number(entry.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
  }
  return null;
}

function makeSyntheticGpsPosition(lat, lon, speedMps = 10, headingDeg = Number.NaN) {
  return {
    coords: {
      latitude: Number(lat),
      longitude: Number(lon),
      accuracy: 5,
      speed: Number.isFinite(speedMps) ? speedMps : Number.NaN,
      heading: Number.isFinite(headingDeg) ? normalizeBearingDegrees(headingDeg) : Number.NaN,
    },
    timestamp: Date.now(),
  };
}

function stopSimulatedGpsFeed() {
  if (state.simulatedGpsTimerId !== null) {
    window.clearInterval(state.simulatedGpsTimerId);
    state.simulatedGpsTimerId = null;
  }
}

function startSimulatedGpsFeed(points, options = {}) {
  const pointList = (Array.isArray(points) ? points : []).map(toSimPoint).filter(Boolean);
  if (pointList.length < 2) {
    throw new Error("Simulation needs at least two valid points.");
  }
  const intervalMs = clamp(Number(options.intervalMs) || 120, 30, 5000);
  const loop = Boolean(options.loop);
  const speedMps = Number(options.speedMps);
  stopSimulatedGpsFeed();

  let index = 0;
  state.simulatedGpsTimerId = window.setInterval(() => {
    const current = pointList[index];
    const next = pointList[Math.min(index + 1, pointList.length - 1)];
    const headingDeg = next ? bearingDegrees(current.lat, current.lon, next.lat, next.lon) : Number.NaN;
    const position = makeSyntheticGpsPosition(current.lat, current.lon, speedMps, headingDeg);
    handleRawLivePosition(position);

    index += 1;
    if (index >= pointList.length) {
      if (loop) {
        index = 0;
        return;
      }
      stopSimulatedGpsFeed();
    }
  }, intervalMs);
}

function startHighFrequencySimulation(options = {}) {
  if (!state.routeGuide || !Array.isArray(state.routeGuide.lineLatLngs) || state.routeGuide.lineLatLngs.length < 2) {
    throw new Error("Plan a route first to run high-frequency simulation.");
  }
  const stride = Math.max(1, Number(options.stride) || 1);
  const points = [];
  for (let i = 0; i < state.routeGuide.lineLatLngs.length; i += stride) {
    const point = state.routeGuide.lineLatLngs[i];
    points.push({ lat: Number(point[0]), lon: Number(point[1]) });
  }
  if (points.length < 2) {
    throw new Error("Not enough route points for simulation.");
  }
  startSimulatedGpsFeed(points, {
    intervalMs: Number(options.intervalMs) || 60,
    loop: Boolean(options.loop),
    speedMps: Number(options.speedMps) || 12,
  });
}

function updateLiveGuidanceFromPoint(lat, lon, position, speedMpsFromPosition = Number.NaN) {
  if (!state.routeGuide || state.routeGuide.lineLatLngs.length < 2) {
    return null;
  }

  const accuracyMeters = position?.coords?.accuracy;
  const speedMps = Number.isFinite(speedMpsFromPosition) ? speedMpsFromPosition : extractSpeedMps(position);
  const speedMph = Number.isFinite(speedMps) ? speedMps * 2.23693629 : Number.NaN;

  const snapped = findMatchedPointOnRoute(
    lat,
    lon,
    state.routeGuide.lineLatLngs,
    state.routeGuide.cumulativeMeters,
    {
      minAlongMeters: state.lastMatchedProgressMeters,
      maxBacktrackMeters: MAX_MATCH_BACKTRACK_METERS,
      headingDeg: state.lastHeadingDeg,
      speedMps,
    },
  );
  if (!snapped) {
    return null;
  }

  const progressFloor = Math.max(0, state.lastMatchedProgressMeters - MATCH_PROGRESS_FLOOR_BACKTRACK_METERS);
  const progressMeters = clamp(Math.max(progressFloor, snapped.alongMeters), 0, state.routeGuide.totalMeters);
  state.lastMatchedProgressMeters = progressMeters;
  const remainingMeters = Math.max(0, state.routeGuide.totalMeters - progressMeters);
  const remainingSeconds = estimateRemainingDurationSeconds(progressMeters, remainingMeters, speedMps);
  const etaText = formatEtaTime(remainingSeconds);
  const offRouteThreshold = computeDynamicOffRouteThreshold(accuracyMeters, speedMps);
  const isOffRoute = snapped.distanceMeters > offRouteThreshold;
  state.offRouteSampleCount = isOffRoute ? state.offRouteSampleCount + 1 : 0;
  const offRouteConfirmed = state.offRouteSampleCount >= OFF_ROUTE_TRIGGER_STREAK;
  const markerLat = Number.isFinite(snapped.lat) ? snapped.lat : lat;
  const markerLon = Number.isFinite(snapped.lon) ? snapped.lon : lon;
  const activeForRoad = findActiveGuidanceStep(state.routeGuide.guidanceSteps, progressMeters);
  const nextManeuverMeters = activeForRoad
    ? Math.max(0, Number(activeForRoad.step.startDistance) - progressMeters)
    : Number.NaN;
  const headingLookAheadMeters = computeRouteHeadingLookAheadMeters(speedMps, nextManeuverMeters);
  const routeForwardHeadingDeg = computeRouteForwardHeading(progressMeters, headingLookAheadMeters);
  const markerHeadingDeg = Number.isFinite(routeForwardHeadingDeg)
    ? routeForwardHeadingDeg
    : Number.isFinite(snapped.segmentHeadingDeg)
      ? snapped.segmentHeadingDeg
      : state.lastHeadingDeg;
  const inferredRoad = inferRoadNameFromInstruction(activeForRoad?.step?.text || "");
  if (inferredRoad) {
    setRoadName(inferredRoad);
  } else if (!state.navigationMode) {
    setRoadName(DEFAULT_TOP_ROAD_NAME);
  }
  updateVisibleRouteForProgress(progressMeters);
  const upcomingHazardText = buildUpcomingHazardNotice(progressMeters);
  const commitTelemetry = (maneuverDistanceMeters, maneuverText, offRouteConfirmed) => {
    recordTelemetrySample({
      timestamp: Number(position?.timestamp) || Date.now(),
      lat,
      lon,
      snappedLat: markerLat,
      snappedLon: markerLon,
      progressMeters,
      remainingMeters,
      maneuverDistanceMeters: Number.isFinite(maneuverDistanceMeters) ? maneuverDistanceMeters : null,
      maneuverText: maneuverText || "",
      offRouteConfirmed: Boolean(offRouteConfirmed),
      fromRouteMeters: Number(snapped.distanceMeters) || 0,
      speedMps: Number.isFinite(speedMps) ? speedMps : null,
      headingDeg: Number.isFinite(state.lastHeadingDeg) ? state.lastHeadingDeg : null,
      routeHeadingDeg: Number.isFinite(markerHeadingDeg) ? markerHeadingDeg : null,
      accuracyMeters: Number.isFinite(accuracyMeters) ? accuracyMeters : null,
    });
  };

  const gpsParts = [];
  if (Number.isFinite(accuracyMeters)) gpsParts.push(`Accuracy ${formatDistance(accuracyMeters)}`);
  if (Number.isFinite(speedMph)) gpsParts.push(`Speed ${formatSpeed(speedMps)}`);
  if (Number.isFinite(snapped.headingDeltaDeg) && Number.isFinite(speedMps) && speedMps >= HEADING_RELIABLE_SPEED_MPS) {
    gpsParts.push(`Heading delta ${Math.round(snapped.headingDeltaDeg)}°`);
  }
  gpsParts.push(`From route ${formatDistance(snapped.distanceMeters)} (limit ${formatDistance(offRouteThreshold)})`);
  gpsParts.push(`Remaining ${formatDistance(remainingMeters)}`);
  if (remainingSeconds > 0) {
    gpsParts.push(`ETA ${etaText}`);
  }
  el.gpsStatus.textContent = gpsParts.join(" | ");

  if (isOffRoute) {
    el.laneStatus.textContent = upcomingHazardText || "Lane guidance paused while off-route.";
    if (!offRouteConfirmed) {
      el.navStatus.textContent = `Possible off-route (${state.offRouteSampleCount}/${OFF_ROUTE_TRIGGER_STREAK}). Hold course briefly.`;
      commitTelemetry(Number.NaN, "", false);
      return {
        progressMeters,
        remainingMeters,
        snappedLat: markerLat,
        snappedLon: markerLon,
        routeHeadingDeg: markerHeadingDeg,
        maneuverDistanceMeters: Number.NaN,
        maneuverText: "",
        offRouteConfirmed: false,
      };
    }
    el.navStatus.textContent = `Off-route by ${formatDistance(snapped.distanceMeters)}. Recalculating route.`;
    maybeTriggerAutoReroute(lat, lon, progressMeters);
    commitTelemetry(Number.NaN, "", true);
    return {
      progressMeters,
      remainingMeters,
      snappedLat: markerLat,
      snappedLon: markerLon,
      routeHeadingDeg: markerHeadingDeg,
      maneuverDistanceMeters: Number.NaN,
      maneuverText: "",
      offRouteConfirmed: true,
    };
  }

  if (remainingMeters <= ARRIVAL_NEAR_METERS) {
    el.navStatus.textContent = "Arriving at destination.";
    el.laneStatus.textContent = upcomingHazardText || "Prepare to arrive at destination.";
    if (!state.arrivalAnnounced && state.voiceGuidanceEnabled && state.speechSupported) {
      speakText("Arriving at destination.");
      state.arrivalAnnounced = true;
    }
    commitTelemetry(0, "Arriving at destination", false);
    return {
      progressMeters,
      remainingMeters,
      snappedLat: markerLat,
      snappedLon: markerLon,
      routeHeadingDeg: markerHeadingDeg,
      maneuverDistanceMeters: 0,
      maneuverText: "Arriving at destination",
      offRouteConfirmed: false,
    };
  }

  const active = findActiveGuidanceStep(state.routeGuide.guidanceSteps, progressMeters);
  if (!active) {
    el.navStatus.textContent = "Near destination. Follow road signs and stop instructions.";
    el.laneStatus.textContent = upcomingHazardText || "Lane guidance unavailable for this segment.";
    commitTelemetry(Number.NaN, "", false);
    return {
      progressMeters,
      remainingMeters,
      snappedLat: markerLat,
      snappedLon: markerLon,
      routeHeadingDeg: markerHeadingDeg,
      maneuverDistanceMeters: Number.NaN,
      maneuverText: "",
      offRouteConfirmed: false,
    };
  }

  state.lastGuidanceStepIndex = active.index;
  const maneuverDistance = Math.max(0, active.step.startDistance - progressMeters);
  if (maneuverDistance > 20) {
    el.navStatus.textContent = `In ${formatDistance(maneuverDistance)}: ${active.step.text}`;
  } else {
    el.navStatus.textContent = `Now: ${active.step.text}`;
  }
  const laneGuidance = inferLaneGuidance(active.step.text, maneuverDistance);
  const mergedLaneGuidance = [laneGuidance, upcomingHazardText].filter(Boolean).join(" | ");
  state.laneGuidanceText = mergedLaneGuidance;
  el.laneStatus.textContent = mergedLaneGuidance || "Keep following the highlighted route.";

  maybeSpeakGuidance(active.index, active.step.text, maneuverDistance);
  commitTelemetry(maneuverDistance, active.step.text, false);

  return {
    progressMeters,
    remainingMeters,
    snappedLat: markerLat,
    snappedLon: markerLon,
    routeHeadingDeg: markerHeadingDeg,
    maneuverDistanceMeters: maneuverDistance,
    maneuverText: active.step.text,
    offRouteConfirmed: false,
  };
}

function updateNavigationCamera(lat, lon, speedMps, headingDeg, guidanceSnapshot) {
  maybeResumeCameraFollow();
  if (!isGpsFollowEnabled()) {
    return;
  }
  const snappedLat = Number(guidanceSnapshot?.snappedLat);
  const snappedLon = Number(guidanceSnapshot?.snappedLon);
  const snappedHeadingDeg = Number(guidanceSnapshot?.routeHeadingDeg);
  const cameraLat = Number.isFinite(snappedLat) ? snappedLat : lat;
  const cameraLon = Number.isFinite(snappedLon) ? snappedLon : lon;
  const cameraHeadingDeg = Number.isFinite(snappedHeadingDeg) ? snappedHeadingDeg : headingDeg;

  if (!state.navigationMode) {
    const minZoom = 14;
    const nextZoom = Math.max(minZoom, map.getZoom());
    state.cameraProgrammaticMove = true;
    map.setView([cameraLat, cameraLon], nextZoom, { animate: false });
    window.requestAnimationFrame(() => {
      state.cameraProgrammaticMove = false;
    });
    return;
  }

  const currentZoom = MINIMAL_STABLE_NAV_MODE
    ? getOrInitStableNavZoom()
    : map.getZoom();
  const targetCenter = computeChasePanTargetLatLng(
    cameraLat,
    cameraLon,
    getActiveCameraChaseOffsetPx(),
    currentZoom,
  );
  const targetBearing = MINIMAL_STABLE_NAV_MODE && MINIMAL_STABLE_NAV_NORTH_UP
    ? 0
    : (Number.isFinite(cameraHeadingDeg) ? cameraHeadingDeg : getCurrentMapBearing());

  if (!state.navCameraInitialized || !state.navCameraState) {
    state.navCameraState = {
      lat: targetCenter.lat,
      lon: targetCenter.lon,
      zoom: currentZoom,
      bearing: targetBearing,
    };
    state.navCameraInitialized = true;
  } else {
    if (MINIMAL_STABLE_NAV_MODE) {
      state.navCameraState.lat = targetCenter.lat;
      state.navCameraState.lon = targetCenter.lon;
    } else {
      state.navCameraState.lat = lerp(state.navCameraState.lat, targetCenter.lat, CAMERA_CENTER_LERP);
      state.navCameraState.lon = lerp(state.navCameraState.lon, targetCenter.lon, CAMERA_CENTER_LERP);
    }
    state.navCameraState.zoom = currentZoom;
    if (MINIMAL_STABLE_NAV_MODE) {
      state.navCameraState.bearing = targetBearing;
    } else {
      const currentBearing = Number.isFinite(state.navCameraState.bearing) ? state.navCameraState.bearing : getCurrentMapBearing();
      state.navCameraState.bearing = lerpAngleDegrees(currentBearing, targetBearing, CAMERA_BEARING_LERP);
    }
  }

  if (shouldSkipCameraWrite(state.navCameraState.lat, state.navCameraState.lon, state.navCameraState.bearing)) {
    return;
  }

  state.cameraProgrammaticMove = true;
  map.panTo([state.navCameraState.lat, state.navCameraState.lon], {
    animate: true,
    duration: CAMERA_CHASE_PAN_DURATION_S,
  });
  setMapBearing(state.navCameraState.bearing);
  window.setTimeout(() => {
    state.cameraProgrammaticMove = false;
  }, CAMERA_PROGRAMMATIC_HOLD_MS);
}

function computeCameraLeadMeters(speedMps, maneuverDistanceMeters) {
  const speed = Number.isFinite(speedMps) ? speedMps : 0;
  let lead = 80 + speed * 8.2;
  if (Number.isFinite(maneuverDistanceMeters)) {
    if (maneuverDistanceMeters < 220) {
      lead *= 0.75;
    }
    if (maneuverDistanceMeters < 90) {
      lead *= 0.6;
    }
  }
  return clamp(lead, CAMERA_MIN_LEAD_METERS, CAMERA_MAX_LEAD_METERS);
}

function computeRouteHeadingLookAheadMeters(speedMps, nextManeuverMeters = Number.NaN) {
  const speed = Number.isFinite(speedMps) ? Math.max(0, speedMps) : 0;
  let lookAhead = CAMERA_FORWARD_LOOKAHEAD_METERS + speed * 2.6;

  if (Number.isFinite(nextManeuverMeters)) {
    if (nextManeuverMeters < 55) {
      lookAhead = Math.min(lookAhead, 22);
    } else if (nextManeuverMeters < 130) {
      lookAhead = Math.min(lookAhead, 34);
    } else if (nextManeuverMeters < 240) {
      lookAhead = Math.min(lookAhead, 50);
    }
  }

  return clamp(lookAhead, CAMERA_LOOKAHEAD_MIN_METERS, CAMERA_LOOKAHEAD_MAX_METERS);
}

function computeCameraCenter(lat, lon, headingDeg, leadMeters) {
  if (!Number.isFinite(headingDeg)) {
    return { lat, lon };
  }
  return movePointByBearing(lat, lon, headingDeg, leadMeters);
}

function computeChasePanTargetLatLng(vehicleLat, vehicleLon, offsetPx, zoomLevel = map.getZoom()) {
  if (!Number.isFinite(vehicleLat) || !Number.isFinite(vehicleLon)) {
    return { lat: vehicleLat, lon: vehicleLon };
  }
  const latLng = L.latLng(vehicleLat, vehicleLon);
  const point = map.project(latLng, zoomLevel);
  const offsetPoint = L.point(point.x, point.y - normalizeCameraChaseOffsetPx(offsetPx));
  const target = map.unproject(offsetPoint, zoomLevel);
  return { lat: target.lat, lon: target.lng };
}

function recenterCameraToLivePosition(animate = true) {
  if (!state.lastLivePosition || !Number.isFinite(state.lastLivePosition.lat) || !Number.isFinite(state.lastLivePosition.lon)) {
    return false;
  }
  map.invalidateSize({ animate: false });
  const targetZoom = Math.max(map.getZoom(), CAMERA_CHASE_ENTRY_MIN_ZOOM);
  state.navStableZoom = targetZoom;
  const targetCenter = computeChasePanTargetLatLng(
    state.lastLivePosition.lat,
    state.lastLivePosition.lon,
    getActiveCameraChaseOffsetPx(),
    targetZoom,
  );
  state.cameraProgrammaticMove = true;
  map.setView([targetCenter.lat, targetCenter.lon], targetZoom, { animate: Boolean(animate) });
  const initialBearing = MINIMAL_STABLE_NAV_MODE && MINIMAL_STABLE_NAV_NORTH_UP
    ? 0
    : (Number.isFinite(state.lastHeadingDeg) ? state.lastHeadingDeg : getCurrentMapBearing());
  setMapBearing(initialBearing);
  state.navCameraState = {
    lat: targetCenter.lat,
    lon: targetCenter.lon,
    zoom: targetZoom,
    bearing: initialBearing,
  };
  state.navCameraInitialized = true;
  window.setTimeout(() => {
    state.cameraProgrammaticMove = false;
  }, CAMERA_PROGRAMMATIC_HOLD_MS);
  return true;
}

function getOrInitStableNavZoom() {
  if (Number.isFinite(state.navStableZoom) && state.navStableZoom > 0) {
    return state.navStableZoom;
  }
  state.navStableZoom = Math.max(map.getZoom(), CAMERA_CHASE_ENTRY_MIN_ZOOM);
  return state.navStableZoom;
}

function getActiveCameraChaseOffsetPx() {
  if (MINIMAL_STABLE_NAV_MODE) {
    return MINIMAL_STABLE_CHASE_OFFSET_PX;
  }
  return state.cameraChaseOffsetPx;
}

function movePointByBearing(lat, lon, bearingDeg, distanceMeters) {
  const angularDistance = Number(distanceMeters) / 6371000;
  const bearing = (Number(bearingDeg) * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinAd = Math.sin(angularDistance);
  const cosAd = Math.cos(angularDistance);

  const lat2 = Math.asin(sinLat1 * cosAd + cosLat1 * sinAd * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * sinAd * cosLat1,
    cosAd - sinLat1 * Math.sin(lat2),
  );

  return {
    lat: (lat2 * 180) / Math.PI,
    lon: ((lon2 * 180) / Math.PI + 540) % 360 - 180,
  };
}

function computeRouteForwardHeading(progressMeters, lookAheadMeters = CAMERA_FORWARD_LOOKAHEAD_METERS) {
  const lineLatLngs = state.routeGuide?.lineLatLngs;
  const cumulativeMeters = state.routeGuide?.cumulativeMeters;
  const totalMeters = Number(state.routeGuide?.totalMeters);
  if (!Array.isArray(lineLatLngs) || !Array.isArray(cumulativeMeters) || lineLatLngs.length < 2) {
    return Number.NaN;
  }

  const along = clamp(Number(progressMeters) || 0, 0, Number.isFinite(totalMeters) ? totalMeters : cumulativeMeters[cumulativeMeters.length - 1]);
  const lookAhead = Math.max(25, Number(lookAheadMeters) || CAMERA_FORWARD_LOOKAHEAD_METERS);
  const forwardDistance = Math.min(
    Number.isFinite(totalMeters) ? totalMeters : cumulativeMeters[cumulativeMeters.length - 1],
    along + lookAhead,
  );
  const from = getRoutePointAtDistance(lineLatLngs, cumulativeMeters, along);
  let to = getRoutePointAtDistance(lineLatLngs, cumulativeMeters, forwardDistance);

  if (!from || !to || haversineMeters(from.lat, from.lon, to.lat, to.lon) < 2) {
    const backwardDistance = Math.max(0, along - lookAhead);
    const prev = getRoutePointAtDistance(lineLatLngs, cumulativeMeters, backwardDistance);
    if (prev && from) {
      to = from;
      return bearingDegrees(prev.lat, prev.lon, to.lat, to.lon);
    }
    return Number.NaN;
  }

  return bearingDegrees(from.lat, from.lon, to.lat, to.lon);
}

function getRoutePointAtDistance(lineLatLngs, cumulativeMeters, distanceMeters) {
  if (!Array.isArray(lineLatLngs) || !Array.isArray(cumulativeMeters) || lineLatLngs.length < 2) {
    return null;
  }
  const total = cumulativeMeters[cumulativeMeters.length - 1] || 0;
  const distance = clamp(Number(distanceMeters) || 0, 0, total);
  let idx = 0;
  while (idx < cumulativeMeters.length - 2 && cumulativeMeters[idx + 1] < distance) {
    idx += 1;
  }

  const start = lineLatLngs[idx];
  const end = lineLatLngs[idx + 1];
  const segStartMeters = cumulativeMeters[idx];
  const segEndMeters = cumulativeMeters[idx + 1];
  const segLen = Math.max(0, segEndMeters - segStartMeters);
  if (!start || !end || segLen <= 0) {
    return start ? { lat: start[0], lon: start[1] } : null;
  }

  const t = clamp((distance - segStartMeters) / segLen, 0, 1);
  return {
    lat: start[0] + (end[0] - start[0]) * t,
    lon: start[1] + (end[1] - start[1]) * t,
  };
}

function getRemainingRouteLatLngs(progressMeters) {
  const lineLatLngs = state.routeGuide?.lineLatLngs;
  const cumulativeMeters = state.routeGuide?.cumulativeMeters;
  if (!Array.isArray(lineLatLngs) || !Array.isArray(cumulativeMeters) || lineLatLngs.length < 2) {
    return [];
  }
  const totalMeters = cumulativeMeters[cumulativeMeters.length - 1] || 0;
  const distance = clamp(Number(progressMeters) || 0, 0, totalMeters);
  let idx = 0;
  while (idx < cumulativeMeters.length - 2 && cumulativeMeters[idx + 1] < distance) {
    idx += 1;
  }
  const startPoint = getRoutePointAtDistance(lineLatLngs, cumulativeMeters, distance);
  if (!startPoint) {
    return lineLatLngs;
  }
  const remaining = [[startPoint.lat, startPoint.lon]];
  for (let i = idx + 1; i < lineLatLngs.length; i += 1) {
    remaining.push([lineLatLngs[i][0], lineLatLngs[i][1]]);
  }
  return remaining.length >= 2 ? remaining : lineLatLngs;
}

function updateVisibleRouteForProgress(progressMeters = Number.NaN) {
  if (!state.routeLayer || !state.routeGuide) {
    return;
  }
  if (!state.navigationMode || !Number.isFinite(progressMeters)) {
    state.routeLayer.setLatLngs(state.routeGuide.lineLatLngs);
    state.routeLayer.setStyle({
      color: state.settings.routeColor,
      weight: BASE_ROUTE_LINE_WEIGHT,
      opacity: BASE_ROUTE_LINE_OPACITY,
    });
    state.roadStyleLayer.eachLayer((layer) => {
      if (!layer || typeof layer.setStyle !== "function") {
        return;
      }
      const roadType = layer?.options?.roadType || "other";
      layer.setStyle({
        opacity: roadType === "other" ? BASE_ROAD_STYLE_OTHER_OPACITY : 0.98,
      });
    });
    return;
  }
  const remaining = getRemainingRouteLatLngs(progressMeters);
  if (!Array.isArray(remaining) || remaining.length < 2) {
    return;
  }
  state.routeLayer.setLatLngs(remaining);
  state.routeLayer.setStyle({
    color: state.settings.routeColor,
    weight: BASE_ROUTE_LINE_WEIGHT + 1,
    opacity: 1,
  });
  state.roadStyleLayer.eachLayer((layer) => {
    if (!layer || typeof layer.setStyle !== "function") {
      return;
    }
    layer.setStyle({ opacity: 0 });
  });
}

function getCurrentMapBearing() {
  if (typeof map.getBearing === "function") {
    const value = Number(map.getBearing());
    if (Number.isFinite(value)) {
      return normalizeBearingDegrees(value);
    }
  }
  return 0;
}

function setMapBearing(bearingDeg) {
  if (!Number.isFinite(bearingDeg)) {
    return;
  }
  if (typeof map.setBearing !== "function") {
    return;
  }
  map.setBearing(normalizeBearingDegrees(bearingDeg));
}

function shouldSkipCameraWrite(targetLat, targetLon, targetBearingDeg) {
  const center = map.getCenter();
  const centerMoveMeters = haversineMeters(center.lat, center.lng, targetLat, targetLon);
  const bearingDelta = headingDeltaDegrees(getCurrentMapBearing(), targetBearingDeg);
  return (
    centerMoveMeters < CAMERA_MIN_UPDATE_MOVE_METERS &&
    Number.isFinite(bearingDelta) &&
    bearingDelta < CAMERA_MIN_UPDATE_BEARING_DEG
  );
}

function maybeTriggerAutoReroute(lat, lon, progressMeters) {
  if (!state.settings.autoReroute) {
    return;
  }
  if (state.rerouteInFlight) {
    return;
  }
  const now = Date.now();
  if (now - state.lastRerouteAt < REROUTE_COOLDOWN_MS) {
    return;
  }
  if (!state.currentPlan || !Array.isArray(state.currentPlan.points) || state.currentPlan.points.length < 2) {
    return;
  }

  state.lastRerouteAt = now;
  triggerAutoReroute(lat, lon, progressMeters).catch((error) => {
    setStatus(error.message || "Auto-reroute failed.", "err");
  });
}

async function triggerAutoReroute(lat, lon, progressMeters) {
  state.rerouteInFlight = true;
  try {
    const remaining = getRemainingTargets(progressMeters);
    if (!remaining || remaining.points.length === 0) {
      return;
    }

    const reroutePoints = [{ lat, lon }, ...remaining.points];
    const rerouteLabels = [{ name: "Current location", postcode: "GPS reroute" }, ...remaining.labels];
    el.navStatus.textContent = "Off-route detected. Recalculating route...";
    setStatus("Off-route detected. Auto-rerouting...", "warn");

    const routeResult = await routeBetweenPoints(reroutePoints, el.keyInput.value.trim());
    drawRoute(reroutePoints, rerouteLabels, routeResult);
    renderSummary(routeResult);
    renderDirections(routeResult);
    setStatus("Route recalculated from current position.", "ok");
  } finally {
    state.rerouteInFlight = false;
  }
}

function getRemainingTargets(progressMeters) {
  const planPoints = state.currentPlan?.points || [];
  const planLabels = state.currentPlan?.labels || [];
  if (planPoints.length === 0 || planLabels.length !== planPoints.length) {
    return null;
  }

  const waypointProgress = state.routeGuide?.waypointProgress || [];
  let nextIndex = waypointProgress.findIndex((distance, index) => index > 0 && distance > progressMeters + 60);

  if (nextIndex < 0) {
    nextIndex = planPoints.length - 1;
  }
  if (nextIndex <= 0 && planPoints.length > 1) {
    nextIndex = 1;
  }

  return {
    points: planPoints.slice(nextIndex).map((point) => ({ lat: point.lat, lon: point.lon })),
    labels: planLabels.slice(nextIndex).map((label) => ({ name: label.name, postcode: label.postcode })),
  };
}

function maybeSpeakGuidance(stepIndex, instructionText, distanceToManeuverMeters) {
  if (!state.voiceGuidanceEnabled) {
    return;
  }
  if (!state.speechSupported) {
    return;
  }

  let stage = 0;
  if (distanceToManeuverMeters <= PROMPT_NOW_METERS) {
    stage = 3;
  } else if (distanceToManeuverMeters <= PROMPT_NEAR_METERS) {
    stage = 2;
  } else if (distanceToManeuverMeters <= PROMPT_FAR_METERS) {
    stage = 1;
  } else {
    return;
  }

  const previousStage = Number(state.spokenStepStages.get(stepIndex) || 0);
  if (stage <= previousStage) {
    return;
  }
  state.spokenStepStages.set(stepIndex, stage);
  state.lastSpokenStepIndex = stepIndex;

  for (const [idx] of state.spokenStepStages) {
    if (idx < stepIndex - 3) {
      state.spokenStepStages.delete(idx);
    }
  }

  if (stage === 3) {
    speakText(`${instructionText} now`);
    return;
  }
  if (stage === 2) {
    speakText(`In ${formatDistanceVoice(distanceToManeuverMeters)}, ${instructionText}`);
    return;
  }
  speakText(`Continue for ${formatDistanceVoice(distanceToManeuverMeters)}, then ${instructionText}`);
}

function speakInitialInstruction() {
  if (!state.voiceGuidanceEnabled) {
    return;
  }
  if (!state.speechSupported) {
    return;
  }
  const firstStep = state.routeGuide?.guidanceSteps?.[0];
  if (!firstStep) {
    return;
  }
  const distance = Math.max(0, Number(firstStep.startDistance) || 0);
  state.lastSpokenStepIndex = 0;
  let stage = 1;
  if (distance <= PROMPT_NOW_METERS) {
    stage = 3;
  } else if (distance <= PROMPT_NEAR_METERS) {
    stage = 2;
  }
  state.spokenStepStages.set(0, stage);
  if (distance > PROMPT_NOW_METERS) {
    speakText(`In ${formatDistanceVoice(distance)}, ${firstStep.text}`);
    return;
  }
  speakText(firstStep.text);
}

function speakText(text, options = {}) {
  if (!state.voiceGuidanceEnabled || !state.speechSupported) {
    return false;
  }
  const message = String(text || "").trim();
  if (!message) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    let started = false;
    let finished = false;
    const startTimer = window.setTimeout(() => {
      if (started || finished) {
        return;
      }
      state.speechPrimed = false;
      if (!options.suppressStatusOnError) {
        reportSpeechWarning("Voice is blocked on this phone. Turn off silent mode and increase media volume.");
      }
    }, SPEECH_START_TIMEOUT_MS);
    const voice = resolvePreferredSpeechVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = navigator.language || "en-GB";
    }
    utterance.rate = state.settings.voiceRate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      started = true;
      state.speechPrimed = true;
      window.clearTimeout(startTimer);
    };
    utterance.onend = () => {
      finished = true;
      state.speechPrimed = true;
      window.clearTimeout(startTimer);
    };
    utterance.onerror = (event) => {
      finished = true;
      window.clearTimeout(startTimer);
      const reason = String(event?.error || "").toLowerCase();
      if (!options.suppressStatusOnError && reason !== "canceled" && reason !== "interrupted") {
        reportSpeechWarning(`Voice guidance error (${reason || "unknown"}).`);
      }
    };

    const shouldInterrupt = options.interrupt !== false;
    if (shouldInterrupt && (synth.speaking || synth.pending)) {
      synth.cancel();
    }
    if (typeof synth.resume === "function") {
      synth.resume();
    }
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function extractSpeedMps(position) {
  const speedMps = position?.coords?.speed;
  if (!Number.isFinite(speedMps) || speedMps < 0) {
    return Number.NaN;
  }
  return speedMps;
}

function buildRouteGuide(lineLatLngs, guidanceSteps, waypoints = [], durationSeconds = Number.NaN) {
  const cumulativeMeters = buildCumulativeMeters(lineLatLngs);
  const totalMeters = cumulativeMeters[cumulativeMeters.length - 1] || 0;
  const waypointProgress = [];
  let minAlong = 0;
  for (const waypoint of waypoints || []) {
    const snapped = findNearestPointOnRoute(
      waypoint.lat,
      waypoint.lon,
      lineLatLngs,
      cumulativeMeters,
      minAlong,
    );
    if (!snapped) {
      waypointProgress.push(minAlong);
      continue;
    }
    const along = Math.max(minAlong, snapped.alongMeters);
    waypointProgress.push(along);
    minAlong = along;
  }
  return {
    lineLatLngs,
    cumulativeMeters,
    totalMeters,
    totalDurationSeconds: Number(durationSeconds) || 0,
    guidanceSteps: guidanceSteps || [],
    waypointProgress,
  };
}

function buildCumulativeMeters(lineLatLngs) {
  const cumulative = [0];
  for (let i = 1; i < lineLatLngs.length; i += 1) {
    const prev = lineLatLngs[i - 1];
    const curr = lineLatLngs[i];
    const segment = haversineMeters(prev[0], prev[1], curr[0], curr[1]);
    cumulative.push(cumulative[cumulative.length - 1] + segment);
  }
  return cumulative;
}

function findNearestPointOnRoute(lat, lon, lineLatLngs, cumulativeMeters, minAlongMeters = -Infinity) {
  if (!lineLatLngs || lineLatLngs.length < 2) {
    return null;
  }

  let best = null;
  for (let i = 0; i < lineLatLngs.length - 1; i += 1) {
    const a = lineLatLngs[i];
    const b = lineLatLngs[i + 1];
    const projection = projectPointOntoSegment(lat, lon, a[0], a[1], b[0], b[1]);
    const segmentMeters = cumulativeMeters[i + 1] - cumulativeMeters[i];
    const alongMeters = cumulativeMeters[i] + segmentMeters * projection.t;
    if (alongMeters + 1 < minAlongMeters) {
      continue;
    }
    const candidate = {
      distanceMeters: projection.distanceMeters,
      alongMeters,
    };
    if (!best || candidate.distanceMeters < best.distanceMeters) {
      best = candidate;
    }
  }

  return best;
}

function findMatchedPointOnRoute(lat, lon, lineLatLngs, cumulativeMeters, options = {}) {
  if (!lineLatLngs || lineLatLngs.length < 2) {
    return null;
  }

  const minAlongMeters = Number(options.minAlongMeters);
  const maxBacktrackMeters = Number.isFinite(Number(options.maxBacktrackMeters))
    ? Math.max(0, Number(options.maxBacktrackMeters))
    : MAX_MATCH_BACKTRACK_METERS;
  const minAllowedAlong = Number.isFinite(minAlongMeters) ? minAlongMeters - maxBacktrackMeters : -Infinity;
  const headingDeg = Number(options.headingDeg);
  const speedMps = Number(options.speedMps);
  const headingReliable = Number.isFinite(headingDeg) && Number.isFinite(speedMps) && speedMps >= HEADING_RELIABLE_SPEED_MPS;

  let best = null;
  for (let i = 0; i < lineLatLngs.length - 1; i += 1) {
    const a = lineLatLngs[i];
    const b = lineLatLngs[i + 1];
    const projection = projectPointOntoSegment(lat, lon, a[0], a[1], b[0], b[1]);
    const segmentMeters = cumulativeMeters[i + 1] - cumulativeMeters[i];
    const alongMeters = cumulativeMeters[i] + segmentMeters * projection.t;
    if (alongMeters + 1 < minAllowedAlong) {
      continue;
    }

    const segmentHeading = bearingDegrees(a[0], a[1], b[0], b[1]);
    const headingDeltaDeg = headingReliable ? headingDeltaDegrees(headingDeg, segmentHeading) : Number.NaN;
    let score = projection.distanceMeters;

    if (headingReliable && Number.isFinite(headingDeltaDeg)) {
      score += headingDeltaDeg * HEADING_PENALTY_PER_DEG;
      if (headingDeltaDeg > 120) {
        score += 40;
      }
    }

    if (Number.isFinite(minAlongMeters) && alongMeters < minAlongMeters) {
      score += (minAlongMeters - alongMeters) * 1.5;
    }

    const projectedLat = a[0] + (b[0] - a[0]) * projection.t;
    const projectedLon = a[1] + (b[1] - a[1]) * projection.t;
    const candidate = {
      distanceMeters: projection.distanceMeters,
      alongMeters,
      headingDeltaDeg,
      segmentHeadingDeg: segmentHeading,
      lat: projectedLat,
      lon: projectedLon,
      score,
    };
    if (!best || candidate.score < best.score) {
      best = candidate;
    }
  }

  return best;
}

function projectPointOntoSegment(lat, lon, lat1, lon1, lat2, lon2) {
  const refLatRad = (lat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLon = Math.cos(refLatRad) * 111320;

  const px = (lon - lon1) * metersPerDegLon;
  const py = (lat - lat1) * metersPerDegLat;
  const sx = (lon2 - lon1) * metersPerDegLon;
  const sy = (lat2 - lat1) * metersPerDegLat;

  const segLenSq = sx * sx + sy * sy;
  if (segLenSq <= 0) {
    return { t: 0, distanceMeters: Math.sqrt(px * px + py * py) };
  }

  const t = clamp((px * sx + py * sy) / segLenSq, 0, 1);
  const projX = sx * t;
  const projY = sy * t;
  const dx = px - projX;
  const dy = py - projY;

  return { t, distanceMeters: Math.sqrt(dx * dx + dy * dy) };
}

function findActiveGuidanceStep(steps, progressMeters) {
  if (!steps || steps.length === 0) {
    return null;
  }

  for (let i = 0; i < steps.length; i += 1) {
    if (progressMeters <= steps[i].endDistance + GUIDANCE_SNAP_THRESHOLD_METERS) {
      return { index: i, step: steps[i] };
    }
  }

  return { index: steps.length - 1, step: steps[steps.length - 1] };
}

function getSelectedVehicleIcon() {
  const value = String(el.vehicleIconSelect?.value || "").trim().toLowerCase();
  if (value === "truck" || value === "car") {
    return value;
  }
  return "coach";
}

function setVehicleIconByKey(vehicleType, persist = true) {
  const normalized = normalizeVehicleIconQuery(vehicleType) || "coach";
  if (el.vehicleIconSelect) {
    el.vehicleIconSelect.value = normalized;
  }
  if (el.settingVehicleIconSearch) {
    el.settingVehicleIconSearch.value = normalized;
  }
  if (persist) {
    localStorage.setItem(STORAGE_VEHICLE_ICON_KEY, normalized);
  }
  updateDriverMarkerIcon();
}

function createDriverIcon(vehicleType) {
  const type = vehicleType === "truck" || vehicleType === "car" ? vehicleType : "coach";
  return L.divIcon({
    className: "driver-marker-icon",
    html:
      `<div class="driver-icon-wrap" style="--vehicle-heading: 0deg">` +
      `<div class="driver-icon-3d vehicle-${type}">` +
      `<span class="vehicle-top"></span>` +
      `<span class="vehicle-glass"></span>` +
      `<span class="vehicle-accent"></span>` +
      `<span class="vehicle-wheel vehicle-wheel-front"></span>` +
      `<span class="vehicle-wheel vehicle-wheel-rear"></span>` +
      `<span class="vehicle-nose"></span>` +
      `</div>` +
      `</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function ensureDriverMarkerAt(lat, lon) {
  if (state.driverMarker) {
    return state.driverMarker;
  }
  state.driverMarker = L.marker([lat, lon], {
    icon: createDriverIcon(getSelectedVehicleIcon()),
    zIndexOffset: 1000,
  }).addTo(map);
  state.driverMarker.bindPopup("Driver location");
  return state.driverMarker;
}

function getDriverIconElement() {
  const markerRoot = state.driverMarker?.getElement?.();
  if (!markerRoot) {
    return null;
  }
  return markerRoot.querySelector(".driver-icon-wrap");
}

function applyDriverMarkerHeading(headingDeg) {
  const iconEl = getDriverIconElement();
  if (!iconEl || !Number.isFinite(headingDeg)) {
    return;
  }
  iconEl.style.setProperty("--vehicle-heading", `${normalizeBearingDegrees(headingDeg)}deg`);
}

function updateDriverMarkerMotion(targetLat, targetLon, targetHeadingDeg, speedMps = Number.NaN) {
  if (!Number.isFinite(targetLat) || !Number.isFinite(targetLon)) {
    return;
  }

  ensureDriverMarkerAt(targetLat, targetLon);

  const normalizedHeading = Number.isFinite(targetHeadingDeg)
    ? normalizeBearingDegrees(targetHeadingDeg)
    : Number(state.driverMotionCurrent?.headingDeg);

  if (!state.driverMotionCurrent) {
    state.driverMotionCurrent = {
      lat: targetLat,
      lon: targetLon,
      headingDeg: Number.isFinite(normalizedHeading) ? normalizedHeading : 0,
    };
    state.driverMarker.setLatLng([targetLat, targetLon]);
    applyDriverMarkerHeading(state.driverMotionCurrent.headingDeg);
  }

  const currentLatLng = state.driverMarker.getLatLng();
  const currentHeading = Number(state.driverMotionCurrent?.headingDeg);
  const nextHeading = Number.isFinite(normalizedHeading)
    ? normalizedHeading
    : Number.isFinite(currentHeading)
      ? currentHeading
      : 0;

  state.driverMotionTarget = {
    lat: targetLat,
    lon: targetLon,
    headingDeg: nextHeading,
    speedMps: Number(speedMps),
  };
  state.driverMotionAnimation = {
    startLat: Number(currentLatLng.lat),
    startLon: Number(currentLatLng.lng),
    startHeadingDeg: Number.isFinite(currentHeading) ? currentHeading : nextHeading,
    targetLat,
    targetLon,
    targetHeadingDeg: nextHeading,
    startTimeMs: 0,
    durationMs: DRIVER_INTERPOLATION_MS,
  };

  if (state.driverAnimationFrameId !== null) {
    window.cancelAnimationFrame(state.driverAnimationFrameId);
  }
  state.driverAnimationFrameId = window.requestAnimationFrame(tickDriverMarkerMotion);
}

function tickDriverMarkerMotion(frameTimeMs) {
  if (!state.driverMarker || !state.driverMotionCurrent || !state.driverMotionAnimation) {
    state.driverAnimationFrameId = null;
    return;
  }

  const animation = state.driverMotionAnimation;
  if (!Number.isFinite(animation.startTimeMs) || animation.startTimeMs <= 0) {
    animation.startTimeMs = Number.isFinite(frameTimeMs) ? frameTimeMs : performance.now();
  }
  const now = Number.isFinite(frameTimeMs) ? frameTimeMs : performance.now();
  const elapsedMs = Math.max(0, now - animation.startTimeMs);
  const rawProgress = animation.durationMs > 0 ? elapsedMs / animation.durationMs : 1;
  const t = clamp(rawProgress, 0, 1);
  const easedT = easeInOutCubic(t);

  const nextLat = lerp(animation.startLat, animation.targetLat, easedT);
  const nextLon = lerp(animation.startLon, animation.targetLon, easedT);
  const nextHeading = lerpAngleDegrees(animation.startHeadingDeg, animation.targetHeadingDeg, easedT);

  state.driverMotionCurrent.lat = nextLat;
  state.driverMotionCurrent.lon = nextLon;
  state.driverMotionCurrent.headingDeg = nextHeading;
  state.driverMarker.setLatLng([nextLat, nextLon]);
  applyDriverMarkerHeading(nextHeading);

  if (t >= 1) {
    state.driverMotionCurrent.lat = animation.targetLat;
    state.driverMotionCurrent.lon = animation.targetLon;
    state.driverMotionCurrent.headingDeg = animation.targetHeadingDeg;
    state.driverMarker.setLatLng([animation.targetLat, animation.targetLon]);
    applyDriverMarkerHeading(animation.targetHeadingDeg);
    state.driverMotionAnimation = null;
    state.driverAnimationFrameId = null;
    return;
  }

  state.driverAnimationFrameId = window.requestAnimationFrame(tickDriverMarkerMotion);
}

function stopDriverMarkerMotion() {
  if (state.driverAnimationFrameId !== null) {
    window.cancelAnimationFrame(state.driverAnimationFrameId);
    state.driverAnimationFrameId = null;
  }
  state.driverMotionAnimation = null;
  state.driverMotionTarget = null;
  state.driverMotionCurrent = null;
}

function updateDriverMarkerIcon() {
  if (!state.driverMarker) {
    return;
  }
  state.driverMarker.setIcon(createDriverIcon(getSelectedVehicleIcon()));
  const currentHeading = Number(state.driverMotionCurrent?.headingDeg);
  if (Number.isFinite(currentHeading)) {
    window.requestAnimationFrame(() => {
      applyDriverMarkerHeading(currentHeading);
    });
  }
}

function makeViaActionButton(text, title, action, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.title = title;
  button.dataset.action = action;
  button.dataset.index = String(index);
  return button;
}

function formatSpeed(speedMps) {
  if (!Number.isFinite(speedMps) || speedMps < 0) {
    return "";
  }
  if (state.settings.units === "metric") {
    const kmh = speedMps * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }
  const mph = speedMps * 2.23693629;
  return `${mph.toFixed(1)} mph`;
}

function computeDynamicOffRouteThreshold(accuracyMeters, speedMps) {
  const accuracyAllowance = Number.isFinite(accuracyMeters) ? Math.max(0, accuracyMeters * 1.4) : 0;
  const speedAllowance = Number.isFinite(speedMps) && speedMps > 0 ? Math.min(60, speedMps * 6) : 0;
  return Math.max(OFF_ROUTE_THRESHOLD_METERS, 35 + accuracyAllowance, OFF_ROUTE_THRESHOLD_METERS + speedAllowance);
}

function extractHeadingDegrees(position, lat, lon, timestampMs) {
  const heading = Number(position?.coords?.heading);
  if (Number.isFinite(heading) && heading >= 0) {
    return normalizeBearingDegrees(heading);
  }

  const prev = state.lastGpsSample;
  if (!prev || !Number.isFinite(prev.lat) || !Number.isFinite(prev.lon) || !Number.isFinite(prev.timestampMs)) {
    return Number.NaN;
  }

  const dtSeconds = (timestampMs - prev.timestampMs) / 1000;
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return Number.NaN;
  }

  const movedMeters = haversineMeters(prev.lat, prev.lon, lat, lon);
  if (movedMeters < 4) {
    return Number.NaN;
  }

  return bearingDegrees(prev.lat, prev.lon, lat, lon);
}

function bearingDegrees(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const lambda1 = lon1 * toRad;
  const lambda2 = lon2 * toRad;
  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  const theta = Math.atan2(y, x) * toDeg;
  return normalizeBearingDegrees(theta);
}

function normalizeBearingDegrees(value) {
  let degrees = Number(value);
  if (!Number.isFinite(degrees)) {
    return Number.NaN;
  }
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
}

function headingDeltaDegrees(aDeg, bDeg) {
  if (!Number.isFinite(aDeg) || !Number.isFinite(bDeg)) {
    return Number.NaN;
  }
  const diff = Math.abs(normalizeBearingDegrees(aDeg) - normalizeBearingDegrees(bDeg)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function classifyRoadType(text) {
  const input = String(text || "").toUpperCase();
  if (!input) {
    return "other";
  }
  if (/\bM\d+[A-Z]?\b/.test(input) || input.includes("MOTORWAY")) {
    return "motorway";
  }
  if (/\bA\d+[A-Z]?\b/.test(input) || input.includes("A ROAD")) {
    return "aRoad";
  }
  return "other";
}

function inferRoadNameFromInstruction(text) {
  const instruction = String(text || "").trim();
  if (!instruction) {
    return "";
  }

  const ontoMatch = instruction.match(/\bonto\s+([^,.|;]+)/i);
  if (ontoMatch && ontoMatch[1]) {
    const road = ontoMatch[1].trim();
    if (road) {
      return road;
    }
  }

  const onMatch = instruction.match(/\bon\s+([^,.|;]+)/i);
  if (onMatch && onMatch[1]) {
    const road = onMatch[1].trim();
    if (road) {
      return road;
    }
  }

  const refMatch = instruction.match(/\b(M\d+[A-Z]?|A\d+[A-Z]?)\b/i);
  if (refMatch && refMatch[1]) {
    return refMatch[1].toUpperCase();
  }

  return "";
}

function isComplexManeuverInstruction(text) {
  const input = String(text || "").toLowerCase();
  if (!input) {
    return false;
  }
  return (
    input.includes("roundabout") ||
    input.includes("exit") ||
    input.includes("merge") ||
    input.includes("fork") ||
    input.includes("slight") ||
    input.includes("turn left") ||
    input.includes("turn right")
  );
}

function inferLaneGuidance(instructionText, distanceMeters) {
  const text = String(instructionText || "").toLowerCase();
  if (!text) {
    return "";
  }
  const distancePrefix =
    Number.isFinite(distanceMeters) && distanceMeters > 40 ? `In ${formatDistance(distanceMeters)}, ` : "";

  if (text.includes("roundabout")) {
    return `${distancePrefix}use lane signs for the roundabout exit.`;
  }
  if (text.includes("merge") || text.includes("fork")) {
    if (text.includes("left")) {
      return `${distancePrefix}keep left lane for the merge.`;
    }
    if (text.includes("right")) {
      return `${distancePrefix}keep right lane for the merge.`;
    }
    return `${distancePrefix}follow lane arrows through the merge.`;
  }
  if (text.includes("turn left") || text.includes("slight left")) {
    return `${distancePrefix}move to the left lane when safe.`;
  }
  if (text.includes("turn right") || text.includes("slight right")) {
    return `${distancePrefix}move to the right lane when safe.`;
  }
  if (text.includes("exit")) {
    if (text.includes("left")) {
      return `${distancePrefix}prepare for left-side exit lane.`;
    }
    if (text.includes("right")) {
      return `${distancePrefix}prepare for right-side exit lane.`;
    }
    return `${distancePrefix}prepare for the upcoming exit lane.`;
  }
  return "Stay on the highlighted route and follow lane markings.";
}

function summarizeRoadTypeCoverage(segments) {
  const present = new Set();
  for (const segment of segments || []) {
    if (!segment || !segment.roadType) {
      continue;
    }
    if (segment.roadType === "motorway" || segment.roadType === "aRoad") {
      present.add(segment.roadType);
    }
  }
  if (present.size === 0) {
    return "";
  }
  return [...present].map((key) => ROAD_TYPE_BADGES[key]).join(" + ");
}

function summarizeHazardSummary() {
  if (!Array.isArray(state.activeHazards) || state.activeHazards.length === 0) {
    return "";
  }
  const lowBridgeCount = state.activeHazards.filter((hazard) => hazard.type === "low_bridge").length;
  const narrowCount = state.activeHazards.filter((hazard) => hazard.type === "narrow_road").length;
  const highRisk = state.activeHazards.filter((hazard) => hazard.severity === "high").length;
  const parts = [];
  if (lowBridgeCount > 0) {
    parts.push(`${lowBridgeCount} low bridges`);
  }
  if (narrowCount > 0) {
    parts.push(`${narrowCount} narrow points`);
  }
  if (highRisk > 0) {
    parts.push(`${highRisk} high risk`);
  }
  return parts.join(", ");
}

function estimateRemainingDurationSeconds(progressMeters, remainingMeters, speedMps) {
  const routeDurationSeconds = Number(state.routeGuide?.totalDurationSeconds);
  const routeTotalMeters = Number(state.routeGuide?.totalMeters);
  if (Number.isFinite(routeDurationSeconds) && routeDurationSeconds > 0 && Number.isFinite(routeTotalMeters) && routeTotalMeters > 0) {
    const proportional = (remainingMeters / routeTotalMeters) * routeDurationSeconds;
    if (Number.isFinite(proportional) && proportional > 0) {
      return proportional;
    }
  }

  if (Number.isFinite(speedMps) && speedMps > 0.5) {
    return remainingMeters / speedMps;
  }

  return 0;
}

function formatEtaTime(remainingSeconds) {
  const totalSeconds = Number(remainingSeconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "--:--";
  }
  const eta = new Date(Date.now() + totalSeconds * 1000);
  return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDistance(meters) {
  if (state.settings.units === "metric") {
    if (meters >= 1000) {
      const km = meters / 1000;
      return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
    }
    const roundedMeters = Math.max(5, Math.round(meters / 5) * 5);
    return `${roundedMeters} m`;
  }

  const yards = meters * 1.0936132983377;
  const miles = meters / 1609.344;
  if (miles >= 0.2) {
    const milesRounded = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
    return `${milesRounded} mi`;
  }
  const roundedYards = Math.max(5, Math.round(yards / 5) * 5);
  return `${roundedYards} yd`;
}

function formatDistanceVoice(meters) {
  if (state.settings.units === "metric") {
    if (meters >= 1000) {
      const km = meters / 1000;
      const roundedKm = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
      const unit = roundedKm === 1 ? "kilometer" : "kilometers";
      return `${roundedKm} ${unit}`;
    }
    const roundedMeters = Math.max(5, Math.round(meters / 5) * 5);
    const unit = roundedMeters === 1 ? "meter" : "meters";
    return `${roundedMeters} ${unit}`;
  }

  const yards = meters * 1.0936132983377;
  const miles = meters / 1609.344;
  if (miles >= 0.2) {
    const milesRounded = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
    const unit = milesRounded === 1 ? "mile" : "miles";
    return `${milesRounded} ${unit}`;
  }
  const roundedYards = Math.max(5, Math.round(yards / 5) * 5);
  const unit = roundedYards === 1 ? "yard" : "yards";
  return `${roundedYards} ${unit}`;
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * 6371000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lerp(startValue, endValue, amount) {
  const t = clamp(Number(amount) || 0, 0, 1);
  return Number(startValue) + (Number(endValue) - Number(startValue)) * t;
}

function easeInOutCubic(amount) {
  const t = clamp(Number(amount) || 0, 0, 1);
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  const k = -2 * t + 2;
  return 1 - (k * k * k) / 2;
}

function lerpAngleDegrees(startDeg, endDeg, amount) {
  const start = normalizeBearingDegrees(startDeg);
  const end = normalizeBearingDegrees(endDeg);
  if (!Number.isFinite(start)) {
    return end;
  }
  if (!Number.isFinite(end)) {
    return start;
  }
  let delta = end - start;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return normalizeBearingDegrees(start + delta * clamp(Number(amount) || 0, 0, 1));
}

function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

function setStatus(message, tone) {
  el.status.textContent = message;
  el.status.className = `status ${tone || ""}`;
}

function collapseConsecutiveDuplicateStopIds(ids) {
  const collapsed = [];
  for (const id of ids) {
    if (!id) {
      continue;
    }
    if (collapsed.length > 0 && collapsed[collapsed.length - 1] === id) {
      continue;
    }
    collapsed.push(id);
  }
  return collapsed;
}

function capitalizeFirst(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeDutyId(value) {
  const cleaned = String(value || "").trim().toUpperCase();
  if (/^\d+$/.test(cleaned)) {
    return String(Number(cleaned));
  }
  return cleaned;
}

function clearLoadedDuty() {
  state.loadedDuty = null;
  renderDutyTimeline();
}

function isDebugModeEnabled() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("debug");
    if (fromQuery === "1" || fromQuery === "true") {
      return true;
    }
    return localStorage.getItem("nx_debug") === "1";
  } catch {
    return false;
  }
}

function exposeDebugApi() {
  if (!isDebugModeEnabled()) {
    if ("nxDebug" in window) {
      delete window.nxDebug;
    }
    return;
  }

  window.nxDebug = {
    startSimulatedGpsFeed,
    stopSimulatedGpsFeed,
    startHighFrequencySimulation,
    getState: () => state,
    getMapZoom: () => map.getZoom(),
    getChaseOffsetPx: () => state.cameraChaseOffsetPx,
    setChaseOffsetPx: (value) => setCameraChaseOffsetPx(value, true),
    getPositionUpdateStats: () => ({
      raw: state.rawGpsUpdateCount,
      processed: state.processedGpsUpdateCount,
      throttleMs: POSITION_PROCESS_THROTTLE_MS,
    }),
    throttleMs: POSITION_PROCESS_THROTTLE_MS,
    interpolationMs: DRIVER_INTERPOLATION_MS,
  };
}

exposeDebugApi();
renderViaList();
renderDutyTimeline();
