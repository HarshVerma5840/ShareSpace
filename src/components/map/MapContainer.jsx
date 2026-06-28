import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useMapData } from './MapProvider';
import { mapOptions, indiaCenter } from '../../utils/mapUtils';

function MapContainer({
  center,
  zoom,
  onClick,
  onLoad,
  onUnmount,
  children,
  className = "w-full h-full"
}) {
  const { isLoaded, loadError } = useMapData();

  if (loadError) {
    return (
      <div className="flex items-center justify-center w-full h-full text-red-500 font-bold bg-[#111]">
        Google Maps failed to load.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white bg-[#111] animate-pulse">
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      center={center || indiaCenter}
      zoom={zoom || 5}
      mapContainerClassName={className}
      onClick={onClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {children}
    </GoogleMap>
  );
}

export default React.memo(MapContainer);
