<template>
  <div class="map">
    <b-overlay :show="isLoadingMap" fixed style="height: 100vh" :opacity="0.5">
      <!-- Skeleton loader for map -->
      <div v-if="!mapReady" class="map-skeleton">
        <div class="map-skeleton-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t("search.loadingMap") }}</span>
          </div>
          <p class="mt-2">{{ t("search.loadingMap") }}</p>
        </div>
      </div>

      <l-map
        ref="map"
        v-model:zoom="zoom"
        class="map"
        :min-zoom="4"
        :max-zoom="17"
        :bounds="bounds"
        :max-bounds="maxBounds"
        :use-global-leaflet="true"
        :options="mapOptions"
        @click="addMarker"
        @ready="mapLoaded"
      >
        <l-tile-layer
          :url="activeBaseLayer.url"
          layer-type="base"
          :name="activeBaseLayer.name"
          :attribution="activeBaseLayer.attribution"
        ></l-tile-layer>

        <l-layer-group
          v-if="pinsReady && projectsFinishedPoints.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsFinished"
        >
          <l-marker
            v-for="point in projectsFinishedPoints"
            v-memo="[
              point.id,
              point.lat,
              point.lng,
              point.type,
              selectedLocation?.id === getPointProjectId(point),
              currentZoom > 7,
            ]"
            :id="String(point.id)"
            :key="point.id"
            :lat-lng="[point.lat, point.lng]"
            :icon="getMarkerIcon(point)"
            @click="onPointClick(point)"
          >
            <l-tooltip v-if="point.type === 'project' && currentZoom > 7">
              <span>{{ point.project.name }}</span>
              <span v-if="point.project.state !== 'finished'"> ({{ point.project.state }})</span>
            </l-tooltip>
            <l-tooltip v-else-if="point.type === 'cluster'">
              <span>{{ point.count }} projects</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="
            pinsReady &&
            projectsUnderConstructionPoints.length > 0
          "
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
        >
          <l-marker
            v-for="point in projectsUnderConstructionPoints"
            v-memo="[
              point.id,
              point.lat,
              point.lng,
              point.type,
              selectedLocation?.id === getPointProjectId(point),
              currentZoom > 7,
            ]"
            :id="String(point.id)"
            :key="point.id"
            :lat-lng="[point.lat, point.lng]"
            :icon="getMarkerIcon(point)"
            @click="onPointClick(point)"
          >
            <l-tooltip v-if="point.type === 'project' && currentZoom > 7">
              <span>{{ point.project.name }}</span>
              <span v-if="point.project.state !== 'finished'"> ({{ point.project.state }})</span>
            </l-tooltip>
            <l-tooltip v-else-if="point.type === 'cluster'">
              <span>{{ point.count }} projects</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="pinsReady && projectsPlannedPoints.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsPlanned"
        >
          <l-marker
            v-for="point in projectsPlannedPoints"
            v-memo="[
              point.id,
              point.lat,
              point.lng,
              point.type,
              selectedLocation?.id === getPointProjectId(point),
              currentZoom > 7,
            ]"
            :id="String(point.id)"
            :key="point.id"
            :lat-lng="[point.lat, point.lng]"
            :icon="getMarkerIcon(point)"
            @click="onPointClick(point)"
          >
            <l-tooltip v-if="point.type === 'project' && currentZoom > 7">
              <span>{{ point.project.name }}</span>
              <span v-if="point.project.state !== 'finished'"> ({{ point.project.state }})</span>
            </l-tooltip>
            <l-tooltip v-else-if="point.type === 'cluster'">
              <span>{{ point.count }} projects</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <!-- Lade-Indikator für Pins -->
        <div v-if="mapInitialized && !pinsReady" class="pins-loading-indicator">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading pins...</span>
          </div>
          <p>Loading project data...</p>
        </div>
      </l-map>
    </b-overlay>
    <project-details
      :project="selectedLocation"
      :is-opened="isOpened"
      @close="onSidePanelClose"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeMount,
  shallowRef,
  onBeforeUnmount,
} from "vue";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../../stores/loading.store";
import { useCategoryStore } from "../../stores/category.store";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useFilterStore } from "@/stores/filter.store";
import L, { latLngBounds } from "leaflet";
import {
  LMap,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "@/features/projects/services/project.service";
import type { Project } from "@/interfaces/Project";
import { useI18n } from "vue-i18n";

import "leaflet/dist/leaflet.css";

const TILE_LAYER_CONFIG = {
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const;

const loadingStore = useLoadingStore();
const categoryStore = useCategoryStore();
const projectStore = useProjectStore();
const { t } = useI18n();

const { getById: getCategoryById } = storeToRefs(categoryStore);
const { showLoadingSpinner } = storeToRefs(loadingStore);
const { projects: allProjects } = storeToRefs(projectStore);

// Props
const props = defineProps({
  filteredProjects: {
    type: Array as () => Project[],
    default: () => [],
  },
  baseLayer: {
    type: String as () => 'satellite' | 'osm',
    default: 'osm',
  },
});

type RenderPoint =
  | {
      id: number;
      type: "project";
      project: Project;
      lat: number;
      lng: number;
    }
  | {
      id: string;
      type: "cluster";
      lat: number;
      lng: number;
      count: number;
      members: Project[];
      state: string;
    };

// Version counter bumped when filteredProjects reference changes, used to
// invalidate bounds cache so different filter results get fresh fitBounds (Codex #P2).
const locationsVersion = ref(0);
watch(() => props.filteredProjects, () => { locationsVersion.value++; });

// Use filtered projects if provided, otherwise use all projects.
// When filters are active but produce zero matches, show empty map (Codex #P2).
const locations = computed(() => {
  if (props.filteredProjects.length > 0) return props.filteredProjects;
  const filterStore = useFilterStore();
  const hasActiveFilters =
    filterStore.stateFilter.length > 0 ||
    filterStore.categoryFilter.length > 0 ||
    filterStore.countryFilter.length > 0;
  if (hasActiveFilters) return [];
  return allProjects.value;
});

// Verwende shallowRef für nicht-reaktive Objekte für bessere Performance
const zoom = ref(5);
const bounds = shallowRef(
  latLngBounds([
    [-14.5981259, 5.8997233],
    [8.9490075, 11.322326],
  ]),
);
const maxBounds = shallowRef(
  latLngBounds([
    [-40, -30],
    [40, 60],
  ]),
);
const isOpened = ref(false);
const isLoadingMap = ref(true);
const mapReady = ref(true); // Karte sofort als bereit markieren
const mapInitialized = ref(false);
const initialDataLoaded = ref(false);
const pinsReady = ref(false); // Neuer Status für Pins
const selectedLocation = shallowRef<Project | undefined>(undefined);
const mapOptions = ref({
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
  wheelPxPerZoomLevel: 60,
  preferCanvas: true, // Verwende Canvas-Renderer für bessere Performance
  renderer: L.canvas({
    padding: 0.5,
    tolerance: 5, // Erhöhte Toleranz für bessere Performance
  }) as any,
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens/Verschiebens
  zoomAnimation: false,
  markerZoomAnimation: false,
  // Deaktiviere Animationen auf mobilen Geräten für bessere Performance
  fadeAnimation: !("ontouchstart" in window),
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens
  updateWhenZooming: false,
  updateWhenIdle: true,
});
const map = ref<any>(null);

// Compute project lists from the filtered locations
const projectsFinished = computed(() =>
  locations.value.filter((p) => p.state === "finished"),
);
const projectsUnderConstruction = computed(() =>
  locations.value.filter((p) => p.state === "under construction"),
);
const projectsPlanned = computed(() =>
  locations.value.filter((p) => p.state === "planned"),
);

const activeBaseLayer = computed(() => {
  return props.baseLayer === "satellite"
    ? TILE_LAYER_CONFIG.satellite
    : TILE_LAYER_CONFIG.osm;
});

const layerLabelProjectsFinished = computed(() =>
  t("map.layerFinished", { count: projectsFinished.value.length }),
);

const layerLabelProjectsUnderConstruction = computed(() =>
  t("map.layerUnderConstruction", { count: projectsUnderConstruction.value.length }),
);

const layerLabelProjectsPlanned = computed(() =>
  t("map.layerPlanned", { count: projectsPlanned.value.length }),
);

// Sofort mit dem Laden der Karte beginnen
onBeforeMount(() => {
  // Karte ist sofort bereit (mapReady ist bereits true)
  isLoadingMap.value = false;
});

// Überwache die Projektdaten – immediate:true damit bereits persistierte Daten sofort greifen
watch(
  locations,
  (newLocations) => {
    if (newLocations) {
      initialDataLoaded.value = true;
      pinsReady.value = true;

      if (mapInitialized.value && map.value) {
        nextTick(() => {
          updateMaxBounds();
        });
      }
    }
  },
  { immediate: true },
);

// Wird aufgerufen, wenn die Leaflet-Karte bereit ist
const mapLoaded = () => {
  mapInitialized.value = true;
  isLoadingMap.value = false;

  // Optimiere die Leaflet-Karte für bessere Performance
  if (map.value?.leafletObject) {
    bindMapEvents(map.value.leafletObject);

    // Deaktiviere automatisches Zoomen während des Ladens
    map.value.leafletObject.options.trackResize = false;

    // Reduziere die Anzahl der Neuberechnungen
    map.value.leafletObject.options.renderer = L.canvas({
      padding: 0.5,
      tolerance: 5, // Erhöhte Toleranz für bessere Performance
    }) as any;

    // Aktiviere Hardwarebeschleunigung, wenn verfügbar
    if (map.value.leafletObject._container) {
      map.value.leafletObject._container.style.transform = "translateZ(0)";

      // Optimiere DOM-Rendering
      map.value.leafletObject._container.style.willChange = "transform";
      map.value.leafletObject._container.style.backfaceVisibility = "hidden";
    }

    // Optimiere Leaflet-Events
    map.value.leafletObject.options.zoomSnap = 0.5;
    map.value.leafletObject.options.wheelPxPerZoomLevel = 60;
    updateViewportFromMap(map.value.leafletObject);
  }

  // Wenn Daten bereits vorhanden sind (z.B. aus persistiertem Store), sofort anzeigen
  if (locations.value.length > 0) {
    pinsReady.value = true;
    nextTick(() => updateMaxBounds());
  }
  // Wenn keine Daten vorhanden, kümmert sich der watch(locations) darum,
  // sobald das Laden abgeschlossen ist
};

const addMarker = (event: {
  latlng: any;
  originalEvent: { ctrlKey: any; altKey: any };
}) => {
  if (
    zoom.value >= 9 &&
    event.latlng &&
    event.originalEvent.ctrlKey &&
    event.originalEvent.altKey
  ) {
    const name = prompt("Enter name:", "__TBD__");
    if (name) {
      projectService.add(event.latlng, name);
    }
  }
};

const onMarkerClick = (location: Project) => {
  selectedLocation.value = location;
  isOpened.value = true;
};

const onPointClick = (point: RenderPoint) => {
  if (point.type === "project") {
    onMarkerClick(point.project);
    return;
  }

  if (!map.value?.leafletObject || point.members.length === 0) return;
  const clusterBounds = latLngBounds(
    point.members.map((member) => [member.latitude, member.longitude]),
  );
  map.value.leafletObject.fitBounds(clusterBounds, {
    padding: [40, 40],
    maxZoom: CLUSTER_ZOOM_THRESHOLD + 1,
    animate: false,
  });
};

const onSidePanelClose = () => {
  selectedLocation.value = undefined;
  isOpened.value = false;
};

// Globale Cache für Pin-URLs und Marker-Klassen - außerhalb der Komponente definiert
// für bessere Performance und Speichernutzung
const PIN_CACHE = new Map<string, string>();
const DEFAULT_PIN = "/pins/default.png";
const MARKER_CLASS_CACHE = new Map<string, string>();
const MARKER_ICON_CACHE = new Map<string, L.Icon>();

// Computed-Wert für den aktuellen Zoom-Level
const currentZoom = ref(5);
const viewportBounds = shallowRef<L.LatLngBounds | null>(null);

const CLUSTER_ZOOM_THRESHOLD = 9;
const CLUSTER_ICON_XL = 50;
const CLUSTER_ICON_LG = 20;
const CLUSTER_ICON_MD = 10;
const MAP_BOUNDS_PADDING = 0.2;

const getDominantState = (members: Project[]) => {
  const stateCount = new Map<string, number>();
  let dominantState = "unknown";
  let maxCount = 0;
  for (const member of members) {
    const state = member.state ?? "unknown";
    const count = (stateCount.get(state) ?? 0) + 1;
    stateCount.set(state, count);
    if (count > maxCount) {
      dominantState = state;
      maxCount = count;
    }
  }
  return dominantState;
};

const getClusterCellSize = (zoomLevel: number) => {
  // Degree-based grid size used for client-side clustering:
  // lower zoom => larger cells (more aggregation), higher zoom => finer cells.
  if (zoomLevel <= 5) return 1.2;
  if (zoomLevel <= 6) return 0.8;
  if (zoomLevel <= 7) return 0.45;
  if (zoomLevel <= 8) return 0.25;
  return 0.12;
};

const getVisibleProjects = (projects: Project[]) => {
  if (!viewportBounds.value) return projects;
  const padded = viewportBounds.value.pad(0.2);
  return projects.filter((project) =>
    padded.contains([project.latitude, project.longitude]),
  );
};

const buildRenderPoints = (projects: Project[]): RenderPoint[] => {
  const visibleProjects = getVisibleProjects(projects);

  if (currentZoom.value >= CLUSTER_ZOOM_THRESHOLD) {
    return visibleProjects.map((project) => ({
      id: project.id,
      type: "project",
      project,
      lat: project.latitude,
      lng: project.longitude,
    }));
  }

  const cellSize = getClusterCellSize(currentZoom.value);
  const clusterMap = new Map<string, Project[]>();

  for (const project of visibleProjects) {
    const latBucket = Math.floor(project.latitude / cellSize);
    const lngBucket = Math.floor(project.longitude / cellSize);
    const key = `${latBucket}:${lngBucket}`;
    const bucket = clusterMap.get(key);
    if (bucket) {
      bucket.push(project);
    } else {
      clusterMap.set(key, [project]);
    }
  }

  const points: RenderPoint[] = [];
  for (const [key, members] of clusterMap.entries()) {
    if (members.length === 1) {
      const [project] = members;
      points.push({
        id: project.id,
        type: "project",
        project,
        lat: project.latitude,
        lng: project.longitude,
      });
      continue;
    }

    const lat = members.reduce((sum, member) => sum + member.latitude, 0) / members.length;
    const lng = members.reduce((sum, member) => sum + member.longitude, 0) / members.length;
    points.push({
      id: `cluster-${key}-${members.length}`,
      type: "cluster",
      lat,
      lng,
      count: members.length,
      members,
      state: getDominantState(members),
    });
  }

  return points;
};

const projectsFinishedPoints = computed(() => buildRenderPoints(projectsFinished.value));
const projectsUnderConstructionPoints = computed(() =>
  buildRenderPoints(projectsUnderConstruction.value),
);
const projectsPlannedPoints = computed(() => buildRenderPoints(projectsPlanned.value));

const getPointProjectId = (point: RenderPoint) =>
  point.type === "project" ? point.project.id : -1;

// Überwache Zoom-Änderungen für bedingte Rendering-Optimierungen
// Verwende ein debounced Zoom-Event für bessere Performance
let zoomTimeout: number | null = null;
let mapEventHandlersBound = false;
let boundMap: L.Map | null = null;

const getMarkerIcon = (point: RenderPoint) => {
  if (point.type === "cluster") {
    const clusterBucket =
      point.count >= CLUSTER_ICON_XL
        ? "xl"
        : point.count >= CLUSTER_ICON_LG
          ? "lg"
          : point.count >= CLUSTER_ICON_MD
            ? "md"
            : "sm";
    const iconKey = `cluster:${clusterBucket}:${point.state}`;
    if (MARKER_ICON_CACHE.has(iconKey)) {
      return MARKER_ICON_CACHE.get(iconKey)!;
    }
    const clusterIcon = L.divIcon({
      className: `cluster-marker cluster-marker-${clusterBucket} marker-state-${point.state.toLowerCase().replace(/\s+/g, "-")}`,
      html: `<span>${point.count}</span>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    }) as unknown as L.Icon;
    MARKER_ICON_CACHE.set(iconKey, clusterIcon);
    return clusterIcon;
  }

  const project = point.project;
  const iconUrl = getPin(project);
  const className = pinClass(project);
  const iconKey = `project:${iconUrl}:${className}`;

  if (MARKER_ICON_CACHE.has(iconKey)) {
    return MARKER_ICON_CACHE.get(iconKey)!;
  }

  const icon = L.icon({
    iconUrl,
    iconSize: [28, 39],
    iconAnchor: [14, 39],
    className,
  });
  MARKER_ICON_CACHE.set(iconKey, icon);
  return icon;
};

const updateViewportFromMap = (leafletMap: L.Map) => {
  viewportBounds.value = leafletMap.getBounds();
};

const bindMapEvents = (leafletMap: L.Map) => {
  if (mapEventHandlersBound && boundMap === leafletMap) return;
  if (boundMap && mapEventHandlersBound) {
    boundMap.off("zoomend", onMapZoomEnd);
    boundMap.off("moveend", onMapMoveEnd);
    mapEventHandlersBound = false;
    boundMap = null;
  }
  boundMap = leafletMap;
  leafletMap.on("zoomend", onMapZoomEnd);
  leafletMap.on("moveend", onMapMoveEnd);
  mapEventHandlersBound = true;
  currentZoom.value = leafletMap.getZoom();
  updateViewportFromMap(leafletMap);
};

const onMapZoomEnd = () => {
  if (!map.value?.leafletObject) return;
  if (zoomTimeout) {
    clearTimeout(zoomTimeout);
    zoomTimeout = null;
  }
  zoomTimeout = window.setTimeout(() => {
    if (!map.value?.leafletObject) return;
    currentZoom.value = map.value.leafletObject.getZoom();
    updateViewportFromMap(map.value.leafletObject);
  }, 100);
};

const onMapMoveEnd = () => {
  if (!map.value?.leafletObject) return;
  updateViewportFromMap(map.value.leafletObject);
};

watch(
  () => map.value?.leafletObject,
  (newMap) => {
    if (newMap) {
      bindMapEvents(newMap);
    }
  },
  { immediate: true },
);

// Bereinige Timeouts beim Unmount
onBeforeUnmount(() => {
  if (zoomTimeout) {
    clearTimeout(zoomTimeout);
    zoomTimeout = null;
  }

  if (updateMaxBoundsTimeout.value) {
    clearTimeout(updateMaxBoundsTimeout.value);
  }

  if (boundMap && mapEventHandlersBound) {
    boundMap.off("zoomend", onMapZoomEnd);
    boundMap.off("moveend", onMapMoveEnd);
  }
  mapEventHandlersBound = false;
  boundMap = null;
});

// Optimierte Pin-URL-Funktion mit Memoization
const getPin = (location: Project) => {
  if (!location) {
    return DEFAULT_PIN;
  }

  // Eindeutigen Schlüssel für den Cache erstellen
  const cacheKey =
    location.id +
    "-" +
    (location.category?.map((c) => c.id).join("-") || "none");

  // Prüfen, ob wir bereits einen Cache-Eintrag haben
  if (PIN_CACHE.has(cacheKey)) {
    return PIN_CACHE.get(cacheKey)!;
  }

  try {
    const categories = location.category;
    if (!categories || categories.length === 0) {
      PIN_CACHE.set(cacheKey, DEFAULT_PIN);
      return DEFAULT_PIN;
    }

    // Optimierte Kategorienamen-Verarbeitung
    let categoryNames = "";
    const len = categories.length;

    for (let i = 0; i < len; i++) {
      const cat = categories[i];
      if (cat) {
        const name = cat.fields?.Name || String(cat.id);
        if (name && name !== "undefined" && name !== "null") {
          if (categoryNames) categoryNames += "-";
          categoryNames += String(name).toLowerCase();
        }
      }
    }

    if (!categoryNames) {
      PIN_CACHE.set(cacheKey, DEFAULT_PIN);
      return DEFAULT_PIN;
    }

    const pinUrl = `/pins/${categoryNames}.png`;
    PIN_CACHE.set(cacheKey, pinUrl);
    return pinUrl;
  } catch (error) {
    console.error("Error getting pin for location:", error);
    PIN_CACHE.set(cacheKey, DEFAULT_PIN);
    return DEFAULT_PIN;
  }
};

// Optimierte Marker-Klassen-Funktion
const pinClass = (current: Project) => {
  // Eindeutigen Schlüssel für den Cache erstellen
  const cacheKey = `${current.id}-${current.state}-${selectedLocation.value?.id === current.id}`;

  // Prüfen, ob wir bereits einen Cache-Eintrag haben
  if (MARKER_CLASS_CACHE.has(cacheKey)) {
    return MARKER_CLASS_CACHE.get(cacheKey)!;
  }

  const isSelected = selectedLocation.value?.id === current.id;
  let cssClass = "";

  // Optimierte Klassen-Berechnung
  if (current.state) {
    cssClass = `marker-state-${current.state.toLowerCase().replace(" ", "-")}`;
  }

  if (isSelected) {
    cssClass = cssClass ? `marker-selected ${cssClass}` : "marker-selected";
  }

  // Ergebnis cachen
  MARKER_CLASS_CACHE.set(cacheKey, cssClass);
  return cssClass;
};

// Optimierte Funktion zum Aktualisieren der Kartengrenzen mit Debouncing
const updateMaxBoundsTimeout = ref<number | null>(null);

// Memoization für Kartengrenzen
const boundsCache = new Map<string, any>();

const updateMaxBounds = () => {
  // Debounce-Funktion, um mehrere schnell aufeinanderfolgende Aufrufe zu vermeiden
  if (updateMaxBoundsTimeout.value) {
    clearTimeout(updateMaxBoundsTimeout.value);
  }

  updateMaxBoundsTimeout.value = window.setTimeout(() => {
    if (
      !locations.value ||
      locations.value.length === 0 ||
      !map.value?.leafletObject
    ) {
      return;
    }

    try {
      // Erstelle einen Cache-Schlüssel basierend auf der Anzahl der Standorte
      // Dies ist eine Vereinfachung - in einer realen Anwendung könnte man einen
      // komplexeren Schlüssel basierend auf den tatsächlichen Daten verwenden
      // Nutze locationsVersion um Cache zu invalidieren wenn sich Quelle ändert
      // (verhindert stale bounds bei Filterwechsel mit gleicher Anzahl, Codex #P2)
      const cacheKey = `bounds-v${locationsVersion.value}-${locations.value.length}`;

      // Prüfe, ob wir bereits berechnete Grenzen im Cache haben
      if (boundsCache.has(cacheKey)) {
        const cachedBounds = boundsCache.get(cacheKey);

        // Verwende die gecachten Grenzen
        requestAnimationFrame(() => {
          const leafletMap = map.value.leafletObject;
          maxBounds.value = cachedBounds.pad(MAP_BOUNDS_PADDING);
          leafletMap.fitBounds(cachedBounds, {
            padding: [50, 50],
            animate: false,
            duration: 0,
          });
        });

        return;
      }

      // Deaktiviere Animationen während der Berechnung für bessere Performance
      const leafletMap = map.value.leafletObject;
      const wasAnimating = leafletMap.options.animate;
      leafletMap.options.animate = false;

      // Verwende eine schnellere Methode zur Berechnung der Grenzen
      let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;
      let validPoints = 0;

      // Optimierte Schleife für bessere Performance
      const locationsArray = locations.value;
      const len = locationsArray.length;

      // Intentionally iterate all points to keep west/east extremities accurate.
      // Sampling can miss outliers and make pins unreachable near map edges.
      for (let i = 0; i < len; i++) {
        const loc = locationsArray[i];
        const lat = loc.latitude;
        const lng = loc.longitude;

        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          !isNaN(lat) &&
          !isNaN(lng)
        ) {
          minLat = lat < minLat ? lat : minLat;
          maxLat = lat > maxLat ? lat : maxLat;
          minLng = lng < minLng ? lng : minLng;
          maxLng = lng > maxLng ? lng : maxLng;
          validPoints++;
        }
      }

      // Nur wenn wir gültige Grenzen haben
      if (validPoints > 0) {
        const calculatedBounds = latLngBounds(
          [minLat, minLng],
          [maxLat, maxLng],
        );

        // Cache die berechneten Grenzen
        boundsCache.set(cacheKey, calculatedBounds);

        // Verwende requestAnimationFrame für flüssigere Animation
        requestAnimationFrame(() => {
          // Verwende eine nicht-animierte Anpassung für bessere Performance
          maxBounds.value = calculatedBounds.pad(MAP_BOUNDS_PADDING);
          leafletMap.fitBounds(calculatedBounds, {
            padding: [50, 50],
            animate: false,
            duration: 0,
          });

          // Stelle die ursprüngliche Animationseinstellung wieder her
          leafletMap.options.animate = wasAnimating;
        });
      }
    } catch (error) {
      console.error("Error updating map bounds:", error);
    }
  }, 200); // Erhöhte Debounce-Zeit für bessere Performance
};
</script>

<style lang="scss">
@use "@/assets/design-tokens.scss" as *;

/* Leaflet CSS is lazy loaded in the script section for better performance */

.leaflet-top {
  top: calc(var(--spacing-unit) * 12.5 + env(safe-area-inset-top)); /* 5rem = 20 * 4px */
}
.leaflet-left {
  left: env(safe-area-inset-left);
}
.leaflet-right {
  right: env(safe-area-inset-right);
}
.leaflet-bottom {
  bottom: env(safe-area-inset-bottom);
}
.leaflet-control-attribution {
  max-width: calc(100vw - var(--spacing-unit) * 21.25); /* 8.5rem = 34 * 4px */
  font-size: calc(var(--spacing-unit) * 1.875); /* 0.75rem = 3 * 4px */
}

/* Optimierte CSS-Transformationen für bessere Performance */
.leaflet-marker-icon {
  will-change: transform; /* Hinweis für den Browser, dass sich diese Eigenschaft ändern wird */
  transform: translate3d(0, 0, 0); /* Aktiviere Hardware-Beschleunigung */
  backface-visibility: hidden; /* Verhindere Rendering-Probleme */
  perspective: 1000; /* Verbessere 3D-Rendering */

  &:hover {
    transform: scale(1.5) translate3d(0, 0, 0);
    filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
  }
}

.marker-selected {
  transform: scale(1.25) translate3d(0, 0, 0);
  filter: drop-shadow(0px 0px 4px rgb(178, 14, 14));
}

.marker-selected:hover {
  transform: scale(1.5) translate3d(0, 0, 0);
  filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
}

.marker-state-planned {
  filter: grayscale(90%) opacity(0.5);
}
.marker-state-under-construction {
  filter: grayscale(80%) opacity(0.9);
}
.marker-state-finished {
  filter: opacity(1);
}

.cluster-marker {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  background-color: #3d5e9e;
}

.cluster-marker-sm {
  transform: scale(0.95);
}

.cluster-marker-md {
  transform: scale(1.05);
}

.cluster-marker-lg {
  transform: scale(1.15);
}

.cluster-marker-xl {
  transform: scale(1.25);
}

.map {
  width: 100%;
  height: 100%;
  /* Aktiviere Hardware-Beschleunigung für die Karte */
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.map-skeleton {
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-skeleton-content {
  text-align: center;
  
  .spinner-border {
    color: var(--color-primary);
  }
  
  p {
    margin-top: var(--spacing-unit);
    font-size: var(--font-size-body-md);
    color: var(--color-on-surface);
  }
}

.pins-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(var(--color-surface-rgb), 0.8);
  padding: calc(var(--spacing-unit) * 3.75); /* 15px */
  border-radius: var(--shape-round-default);
  z-index: 1000;
  text-align: center;
  box-shadow: 0 calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 2.5) rgba(0, 0, 0, 0.1);
  
  .spinner-border {
    color: var(--color-primary);
  }
  
  p {
    margin-top: var(--spacing-unit);
    font-size: var(--font-size-body-md);
    color: var(--color-on-surface);
  }
}

/* Zoom controls nur auf Desktop anzeigen */
@media (max-width: 767.98px) {
  .leaflet-control-zoom {
    display: none !important;
  }
}

/* Optimiere Leaflet-Container für bessere Performance */
.leaflet-container {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

/* Reduziere Animationskosten */
.leaflet-fade-anim .leaflet-tile,
.leaflet-fade-anim .leaflet-popup {
  will-change: opacity;
}
.leaflet-zoom-anim .leaflet-zoom-animated {
  will-change: transform;
}
</style>
