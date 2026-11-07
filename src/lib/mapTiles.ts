// Basemaps shared by every Leaflet map. Light mode uses Esri's topographic
// map (relief shading, contour lines, trails, peaks), which reads as a
// hiking map; dark mode keeps the dark gray canvas, as Esri has no dark topo.
export const MAP_TILES = {
  light: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Esri, HERE, Garmin, Intermap, USGS, METI/NASA, NGA, &copy; OpenStreetMap contributors, and the GIS User Community",
    maxZoom: 17,
  },
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community",
    maxZoom: 16,
  },
} as const;
