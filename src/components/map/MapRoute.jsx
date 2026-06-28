import React from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';

export default function MapRoute({ directions, options }) {
  if (!directions) return null;
  return <DirectionsRenderer directions={directions} options={options} />;
}
