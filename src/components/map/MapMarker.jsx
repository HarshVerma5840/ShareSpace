import React from 'react';
import { MarkerF } from '@react-google-maps/api';

export default function MapMarker({ position, label, icon }) {
  if (!position) return null;
  return <MarkerF position={position} label={label} icon={icon} />;
}
