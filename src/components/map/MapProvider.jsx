import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContext = createContext({ isLoaded: false, loadError: null });
const libraries = ["places"];

export function MapProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapData() {
  return useContext(MapContext);
}
