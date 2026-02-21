import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

const indiaBounds = [
  [6.5, 67.5],
  [37.5, 97.5],
];

const minIndiaZoom = 4;

const stateLabels = [
  { name: 'Rajasthan', position: [26.9, 73.9] },
  { name: 'Gujarat', position: [22.8, 71.5] },
  { name: 'Maharashtra', position: [19.6, 75.3] },
  { name: 'Madhya Pradesh', position: [23.7, 78.4] },
  { name: 'Karnataka', position: [15.2, 76.3] },
  { name: 'Tamil Nadu', position: [11.1, 78.4] },
  { name: 'Kerala', position: [10.4, 76.3] },
  { name: 'Telangana', position: [17.8, 79.1] },
  { name: 'Andhra Pradesh', position: [15.8, 79.7] },
  { name: 'Odisha', position: [20.3, 85.8] },
  { name: 'West Bengal', position: [23.4, 87.8] },
  { name: 'Bihar', position: [25.8, 85.3] },
  { name: 'Uttar Pradesh', position: [26.8, 80.9] },
  { name: 'Punjab', position: [31.0, 75.4] },
  { name: 'Haryana', position: [29.2, 76.2] },
  { name: 'Assam', position: [26.0, 92.7] },
  { name: 'Jammu and Kashmir', position: [34.2, 75.2] },
];

const invisibleIcon = L.divIcon({
  className: 'state-label-anchor',
  html: '<span></span>',
  iconSize: [1, 1],
});

const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapInteraction({ pinMode, onPlacePin, onZoomChange }) {
  useMapEvents({
    zoomend: (event) => {
      onZoomChange(event.target.getZoom());
    },
    click: (event) => {
      if (pinMode) {
        onPlacePin(event.latlng);
      }
    },
  });

  return null;
}

function App() {
  const [zoom, setZoom] = useState(minIndiaZoom);
  const [pinMode, setPinMode] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState(null);

  const handlePlacePin = (latlng) => {
    setPinnedLocation(latlng);
    setPinMode(false);
  };

  const showStateLabels = zoom <= minIndiaZoom;

  return (
    <main className="page">
      <section className="hero">
        <h1>India Maps UI (React Leaflet)</h1>
        <p>Map cropped to India. Zoom out to the lowest level to view state labels.</p>
      </section>

      <section className="controls">
        <button
          type="button"
          className={`pin-button ${pinMode ? 'active' : ''}`}
          onClick={() => setPinMode((current) => !current)}
        >
          {pinMode ? 'Pin mode: click on map' : 'Drop a pin'}
        </button>
      </section>

      <section className="map-card">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={minIndiaZoom}
          minZoom={minIndiaZoom}
          maxZoom={10}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          worldCopyJump={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            bounds={indiaBounds}
            noWrap
          />

          <MapInteraction pinMode={pinMode} onPlacePin={handlePlacePin} onZoomChange={setZoom} />

          {showStateLabels &&
            stateLabels.map((state) => (
              <Marker key={state.name} position={state.position} icon={invisibleIcon} interactive={false}>
                <Tooltip permanent direction="center" className="state-label">
                  {state.name}
                </Tooltip>
              </Marker>
            ))}

          {pinnedLocation && (
            <Marker position={pinnedLocation} icon={pinIcon}>
              <Popup>
                {pinnedLocation.lat.toFixed(6)}, {pinnedLocation.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </section>

      <section className="coordinates">
        <h2>Selected Coordinates</h2>
        <p>
          {pinnedLocation
            ? `Latitude: ${pinnedLocation.lat.toFixed(6)} | Longitude: ${pinnedLocation.lng.toFixed(6)}`
            : 'No location selected yet.'}
        </p>
      </section>
    </main>
  );
}

export default App;
