import { useEffect, useCallback } from 'react';
import useMapStore from '../stores/mapStore';

export default function useGeolocation({ onStatusUpdate } = {}) {
  const setCurrentLocation = useMapStore(s => s.setCurrentLocation);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (onStatusUpdate) onStatusUpdate("Geolocation unavailable.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCurrentLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        if (onStatusUpdate) onStatusUpdate("Location detected.");
      },
      () => {
        if (onStatusUpdate) onStatusUpdate("Location denied. Search still works without it.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCurrentLocation, onStatusUpdate]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setCurrentLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [setCurrentLocation]);

  return { requestLocation };
}
