const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * GPX 1.1 track for a generated route. `coordinates` are GeoJSON-style
 * [lon, lat] pairs, as returned by the routing engine.
 */
export function routeToGpx(
  name: string,
  coordinates: [number, number][],
  elevations?: number[]
): string {
  // Altitudes let a watch or app show the climb without a map lookup.
  const points = coordinates
    .map(([lon, lat], i) => {
      const ele = elevations?.[i];
      return ele === undefined
        ? `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`
        : `      <trkpt lat="${lat}" lon="${lon}"><ele>${ele}</ele></trkpt>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RandoRank" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}
