// Basemaps shared by every Leaflet map.
//
// With NEXT_PUBLIC_MAPBOX_TOKEN set (a public "pk." token from mapbox.com),
// maps use Mapbox Outdoors — relief, contour lines, trails and peaks — in
// high-resolution 512px @2x tiles that stay sharp on retina screens, and
// Mapbox Dark in dark mode. Without a token they fall back to Esri.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MAPBOX_ATTRIBUTION =
  '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a></strong>';

type Tiles = {
  url: string;
  attribution: string;
  maxZoom: number;
  // 512px tiles shown one zoom level down cover the same area as 256px ones.
  tileSize: number;
  zoomOffset: number;
};

function mapboxStyle(style: string): Tiles {
  return {
    url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
    attribution: MAPBOX_ATTRIBUTION,
    maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
  };
}

export const MAP_TILES: Record<"light" | "dark", Tiles> = MAPBOX_TOKEN
  ? { light: mapboxStyle("outdoors-v12"), dark: mapboxStyle("dark-v11") }
  : {
      light: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Esri, HERE, Garmin, Intermap, USGS, METI/NASA, NGA, &copy; OpenStreetMap contributors, and the GIS User Community",
        maxZoom: 17,
        tileSize: 256,
        zoomOffset: 0,
      },
      dark: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community",
        maxZoom: 16,
        tileSize: 256,
        zoomOffset: 0,
      },
    };

export type Basemap = "satellite" | "plan";

// Free Esri satellite imagery (same terms as the topo basemap), with a
// transparent layer of place names and borders drawn on top.
export const SATELLITE_TILES: Tiles = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  maxZoom: 18,
  tileSize: 256,
  zoomOffset: 0,
};
export const SATELLITE_LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
