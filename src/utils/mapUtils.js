export const indiaCenter = { lat: 22.5937, lng: 78.9629 };
export const indiaBounds = { north: 37.6, south: 6.4, west: 68.0, east: 97.5 };

export const mapOptions = {
  minZoom: 4,
  restriction: { latLngBounds: indiaBounds, strictBounds: true },
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
};

export const PROXIMITY_METRES = 150;

export const isWithinIndia = (latLng) =>
  latLng.lat() >= indiaBounds.south && latLng.lat() <= indiaBounds.north &&
  latLng.lng() >= indiaBounds.west && latLng.lng() <= indiaBounds.east;

export const isPointWithinIndia = (p) =>
  p.lat >= indiaBounds.south && p.lat <= indiaBounds.north &&
  p.lng >= indiaBounds.west && p.lng <= indiaBounds.east;

/* ─── haversine distance (metres) ─── */
export function haversineMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
