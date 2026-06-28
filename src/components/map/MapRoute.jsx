import React from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';

function MapRoute({ directions, options }) {
  if (!directions) return null;
  return <DirectionsRenderer directions={directions} options={options} />;
}

export default React.memo(MapRoute);
