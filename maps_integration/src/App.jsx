import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

const indiaBounds = [
  [6.5, 67.5],
  [37.5, 97.5],
];

const minIndiaZoom = 4;
const maxStreetZoom = 19;

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

const pointAIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const pointBIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'marker-b',
});

function MapInteraction({ routeMode, onMapClick, onZoomChange }) {
  useMapEvents({
    zoomend: (event) => {
      onZoomChange(event.target.getZoom());
    },
    click: (event) => {
      if (routeMode) {
        onMapClick(event.latlng);
      }
    },
  });

  return null;
}

function App() {
  const [zoom, setZoom] = useState(minIndiaZoom);
  const [routeMode, setRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);

  const handleRouteClick = (latlng) => {
    setRoutePoints((current) => {
      if (current.length >= 2) {
        return [latlng];
      }
      const nextPoints = [...current, latlng];
      if (nextPoints.length === 2) {
        setRouteMode(false);
      }
      return nextPoints;
    });
  };

  const handleRouteModeToggle = () => {
    setRoutePoints([]);
    setRouteMode((current) => !current);
  };

  const handleClearRoute = () => {
    setRoutePoints([]);
    setRouteMode(false);
  };

  const showStateLabels = zoom <= minIndiaZoom;
  const hasRoute = routePoints.length === 2;

  return (
    <main className="page">
      <section className="hero">
        <h1>India Maps UI (React Leaflet)</h1>
        <p>
          India-cropped map with street-level zoom. Use route mode to select two points and draw a path.
        </p>
      </section>

      <section className="controls">
        <button
          type="button"
          className={`pin-button ${routeMode ? 'active' : ''}`}
          onClick={handleRouteModeToggle}
        >
          {routeMode ? 'Route mode: select 2 points' : 'Create path (2 places)'}
        </button>
        <button type="button" className="secondary-button" onClick={handleClearRoute}>
          Clear path
        </button>
      </section>

      <section className="map-card">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={minIndiaZoom}
          minZoom={minIndiaZoom}
          maxZoom={maxStreetZoom}
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
            maxNativeZoom={19}
          />

          <MapInteraction routeMode={routeMode} onMapClick={handleRouteClick} onZoomChange={setZoom} />

          {showStateLabels &&
            stateLabels.map((state) => (
              <Marker key={state.name} position={state.position} icon={invisibleIcon} interactive={false}>
                <Tooltip permanent direction="center" className="state-label">
                  {state.name}
                </Tooltip>
              </Marker>
            ))}

          {routePoints[0] && (
            <Marker position={routePoints[0]} icon={pointAIcon}>
              <Tooltip permanent direction="top" offset={[0, -32]}>
                A
              </Tooltip>
            </Marker>
          )}

          {routePoints[1] && (
            <Marker position={routePoints[1]} icon={pointBIcon}>
              <Tooltip permanent direction="top" offset={[0, -32]}>
                B
              </Tooltip>
            </Marker>
          )}

          {hasRoute && (
            <Polyline positions={routePoints} pathOptions={{ color: '#1d4ed8', weight: 5, opacity: 0.9 }} />
          )}
        </MapContainer>
      </section>

      <section className="coordinates">
        <h2>Path Coordinates</h2>
        <p>{routePoints[0] ? `Point A: ${routePoints[0].lat.toFixed(6)}, ${routePoints[0].lng.toFixed(6)}` : 'Point A: not selected'}</p>
        <p>{routePoints[1] ? `Point B: ${routePoints[1].lat.toFixed(6)}, ${routePoints[1].lng.toFixed(6)}` : 'Point B: not selected'}</p>
      </section>
    </main>
  );
}

export default App;
