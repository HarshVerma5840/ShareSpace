import { Circle, LayerGroup, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const cityData = [
  { name: 'New Delhi', position: [28.6139, 77.209] },
  { name: 'Mumbai', position: [19.076, 72.8777] },
  { name: 'Bengaluru', position: [12.9716, 77.5946] },
  { name: 'Kolkata', position: [22.5726, 88.3639] },
  { name: 'Chennai', position: [13.0827, 80.2707] },
];

const indiaBounds = [
  [6.5, 67.5],
  [37.5, 97.5],
];

const capitalIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function App() {
  return (
    <main className="page">
      <section className="hero">
        <h1>India Maps UI (React Leaflet)</h1>
        <p>Interactive map focused on India with major city markers and a highlighted central region.</p>
      </section>

      <section className="map-card">
        <MapContainer center={[22.5937, 78.9629]} zoom={5} minZoom={4} maxBounds={indiaBounds} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LayerGroup>
            {cityData.map((city) => (
              <Marker key={city.name} position={city.position} icon={capitalIcon}>
                <Popup>{city.name}</Popup>
                <Tooltip direction="top" offset={[0, -25]} opacity={0.9}>
                  {city.name}
                </Tooltip>
              </Marker>
            ))}
          </LayerGroup>

          <Circle
            center={[23.5, 79.0]}
            radius={450000}
            pathOptions={{ color: '#ea580c', fillColor: '#fdba74', fillOpacity: 0.35 }}
          >
            <Popup>Central India highlight region</Popup>
          </Circle>
        </MapContainer>
      </section>
    </main>
  );
}

export default App;
