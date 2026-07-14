import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, ShieldAlert } from "lucide-react";
import { apiRequest } from "../../utils/api";
import { formatCurrency, formatCovered, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import LandmarkGuide from "../../components/landmarks/LandmarkGuide";
import { isWithinIndia, indiaCenter, mapOptions, haversineMetres, PROXIMITY_METRES } from "../../utils/mapUtils";
import MapContainer from "../../components/map/MapContainer";
import MapMarker from "../../components/map/MapMarker";
import MapRoute from "../../components/map/MapRoute";
import ListItem from "../../components/ui/ListItem";
import useDashboardStore from "../../stores/dashboardStore";
import useMapStore from "../../stores/mapStore";
import useAuthStore from "../../stores/authStore";
import useGeolocation from "../../hooks/useGeolocation";
import { useMapData } from "../../components/map/MapProvider";

export default function MapSearch() {
  const session = useAuthStore(s => s.session);
  const setWallet = useDashboardStore(s => s.setWallet);
  const currentLocation = useMapStore(s => s.currentLocation);
  const { isLoaded, loadError } = useMapData();

  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [searchRadiusKm, setSearchRadiusKm] = useState("1");
  const [directions, setDirections] = useState(null);
  const [routeMeta, setRouteMeta] = useState(null);
  const [landmarkFocusPoint, setLandmarkFocusPoint] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Allow location access and search for your destination.");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const triggeredRef = useRef(new Set());

  const platformFeePreview = selectedSpot ? getPlatformFeePreview(selectedSpot.hourlyRate) : 0;
  const verifiedDiscountPreview = selectedSpot && isVerifiedCommuter(session.user)
    ? getVerifiedDiscountPreview(selectedSpot.hourlyRate)
    : 0;
  const totalPreview = selectedSpot ? Number(selectedSpot.hourlyRate ?? 0) + platformFeePreview - verifiedDiscountPreview : 0;

  const refresh = useCallback(async (destination = destinationPoint) => {
    try {
      const query = destination
        ? `/spots?latitude=${destination.lat}&longitude=${destination.lng}&radiusKm=${searchRadiusKm}`
        : "/spots";
      const [w, s] = await Promise.all([
        apiRequest(`/wallets/${session.user.id}`),
        apiRequest(query)
      ]);
      setWallet(w); 
      setSpots(s);
      setSelectedSpot(s.length ? s[0] : null);
      if (destination) setStatus(s.length ? `Found ${s.length} spot(s) within ${searchRadiusKm} km.` : "No spots found nearby.");
    } catch (e) { setError(e.message); }
  }, [session.user.id, searchRadiusKm, destinationPoint, setWallet]);

  const { requestLocation } = useGeolocation({ onStatusUpdate: setStatus });

  useEffect(() => { requestLocation(); refresh(null); }, [requestLocation, refresh]);

  useEffect(() => {
    if (destinationPoint) refresh(destinationPoint);
  }, [searchRadiusKm, destinationPoint, refresh]);

  /* directions */
  useEffect(() => {
    if (!isLoaded || !currentLocation || !selectedSpot) { setDirections(null); setRouteMeta(null); return; }
    new window.google.maps.DirectionsService().route(
      { origin: currentLocation, destination: { lat: selectedSpot.latitude, lng: selectedSpot.longitude }, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, st) => {
        if (st === "OK" && result) {
          setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          setRouteMeta(leg ? { distanceText: leg.distance?.text || "", durationText: leg.duration?.text || "" } : null);
        } else { setDirections(null); setRouteMeta(null); }
      }
    );
  }, [isLoaded, currentLocation, selectedSpot]);

  /* ── PROXIMITY ALERT LOGIC ── */
  useEffect(() => { triggeredRef.current = new Set(); }, [selectedSpot?.id]);

  useEffect(() => {
    if (!currentLocation || !selectedSpot?.landmarks?.length) return;
    const DURATION = 8000;
    const newAlerts = [];
    for (const lm of selectedSpot.landmarks) {
      if (!lm.latitude || !lm.longitude) continue;
      const key = `${selectedSpot.id}-${lm.stepNumber}`;
      if (triggeredRef.current.has(key)) continue;
      const dist = haversineMetres(currentLocation.lat, currentLocation.lng, lm.latitude, lm.longitude);
      if (dist <= PROXIMITY_METRES) {
        triggeredRef.current.add(key);
        const id = `${key}-${Date.now()}`;
        newAlerts.push({ id, stepNumber: lm.stepNumber, description: lm.description, duration: DURATION });
        setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), DURATION);
      }
    }
    if (newAlerts.length) setAlerts((prev) => [...prev, ...newAlerts]);
  }, [currentLocation, selectedSpot]);

  const dismissAlert = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const searchDestination = () => {
    if (!destinationInput.trim()) { setError("Enter a destination to search nearby parking."); return; }
    if (!window.google?.maps?.Geocoder) { setError("Maps not ready."); return; }
    setSearching(true); setError("");
    new window.google.maps.Geocoder().geocode({ address: destinationInput, region: "IN" }, async (results, st) => {
      setSearching(false);
      if (st !== "OK" || !results?.length) { setError("Destination not found. Try a more specific name."); return; }
      const pt = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
      if (!isPointWithinIndia(pt)) { setError("Destination must be within India."); return; }
      setDestinationPoint(pt); await refresh(pt);
    });
  };

  const bookSpot = async () => {
    if (!selectedSpot) return;
    setBusy(true);
    try {
      const receipt = await apiRequest("/bookings", { method: "POST", body: JSON.stringify({ guestId: session.user.id, spotId: selectedSpot.id }) });
      setWallet(receipt.wallet);
      setStatus(`Booking confirmed for ${selectedSpot.title}. Follow the route!`);
      setError("");
      await refresh(destinationPoint);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const mapCenter = useMemo(() => {
    if (landmarkFocusPoint) return landmarkFocusPoint;
    if (selectedSpot) return { lat: selectedSpot.latitude, lng: selectedSpot.longitude };
    if (destinationPoint) return destinationPoint;
    return currentLocation || indiaCenter;
  }, [currentLocation, destinationPoint, selectedSpot, landmarkFocusPoint]);

  const isPointWithinIndia = (pt) => {
    return isWithinIndia(pt.lat, pt.lng);
  }

  return (
    <>
      <div className="absolute inset-0 z-0">
        {loadError ? <div className="flex items-center justify-center w-full h-full text-red-400">Google Maps failed to load.</div> : isLoaded ? (
          <MapContainer center={mapCenter} zoom={selectedSpot || destinationPoint || currentLocation ? 14 : 5}
            mapContainerClassName="w-full h-full" options={mapOptions}>
            {currentLocation && <MapMarker position={currentLocation} label="Y" />}
            {destinationPoint && <MapMarker position={destinationPoint} label="D" />}
            {spots.map((s) => (
              <MapMarker key={s.id} position={{ lat: s.latitude, lng: s.longitude }}
                label={selectedSpot?.id === s.id ? "P" : "S"} />
            ))}
            {directions && (
              <MapRoute directions={directions}
                options={{ suppressMarkers: true, polylineOptions: { strokeColor: "#3a86ff", strokeWeight: 6 } }} />
            )}
            {selectedSpot?.landmarks?.filter((l) => l.latitude && l.longitude).map((l) => (
              <MapMarker key={`glm-${l.id ?? l.stepNumber}`}
                position={{ lat: l.latitude, lng: l.longitude }} label={String(l.stepNumber)} />
            ))}
          </MapContainer>
        ) : <div className="flex items-center justify-center w-full h-full text-white">Loading map…</div>}
      </div>

      <div className="pointer-events-auto absolute top-4 left-4 right-4 md:top-6 md:left-6 md:w-[420px] flex flex-col gap-4 z-10">
        <section className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest"><Search size={14}/> Destination Search</div>
          <div className="relative group">
            <input value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchDestination()}
              placeholder="Search location in India..."
              className="w-full bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-xl py-3 pl-4 pr-4 text-[14px] font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#3a86ff] transition-all" />
          </div>
          <div className="flex items-center gap-3">
            <select value={searchRadiusKm} onChange={(e) => setSearchRadiusKm(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 outline-none">
              <option value="1">1 km radius</option><option value="2">2 km</option>
              <option value="3">3 km</option><option value="5">5 km</option>
            </select>
            <button type="button" className="bg-[#3a86ff] text-white flex-1 font-bold py-2 px-3 rounded-lg text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#3a86ff]/20 disabled:opacity-50" onClick={searchDestination} disabled={!isLoaded || searching}>
              {searching ? "Searching..." : "Find parking"}
            </button>
          </div>
          <p className="text-xs text-gray-400 leading-tight">{status}</p>
          {error && <p className="text-xs text-red-400 font-bold leading-tight">{error}</p>}
        </section>

        <AnimatePresence>
        {!selectedSpot ? (
          <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[50vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearby Spots</span>
              <span className="bg-[#1e1e1e] px-2 py-1 rounded text-xs font-medium text-gray-500 border border-white/5">{spots.length} found</span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none pr-1">
              {spots.length ? spots.map((s) => (
                <ListItem key={s.id} asButton active={false} onClick={() => { setSelectedSpot(s); setLandmarkFocusPoint(null); }}>
                  <div className="flex-1 pr-2">
                    <strong className="text-sm text-white font-semibold block">{s.title}</strong>
                    <span className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12}/> {s.distanceKm != null ? `${s.distanceKm.toFixed(2)} km` : s.address}</span>
                  </div>
                  <div className="bg-[#222] px-2.5 py-1 rounded-md border border-white/5 shadow-inner text-white text-sm font-bold shrink-0">
                    {formatCurrency(s.hourlyRate)}/hr
                  </div>
                </ListItem>
              )) : <div className="text-center py-6 text-gray-500 font-medium text-sm flex flex-col items-center gap-2"><ShieldAlert size={20} className="opacity-50"/>Search to see spots</div>}
            </div>
          </motion.section>
        ) : (
          <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[60vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedSpot.title}</h2>
                <p className="text-sm text-gray-400">{selectedSpot.address}</p>
              </div>
              <button type="button" className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={() => setSelectedSpot(null)}>✕</button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-[#3a86ff]/10 text-[#3a86ff] border border-[#3a86ff]/20 px-2 py-1 rounded text-xs font-bold tracking-wide">{selectedSpot.slotType}</span>
              <span className="bg-white/5 text-gray-300 border border-white/10 px-2 py-1 rounded text-xs font-bold tracking-wide">{formatCovered(selectedSpot.covered)}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide border ${isVerifiedCommuter(session.user) ? "bg-[#3a86ff]/10 text-[#3a86ff] border-[#3a86ff]/20" : "bg-[#ff7a00]/10 text-[#ffb347] border-[#ff7a00]/20"}`}>
                {isVerifiedCommuter(session.user) ? "Verified commuter 5% off" : "10% platform fee applies"}
              </span>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Rate</span>
                <strong className="text-lg text-white font-bold">{formatCurrency(selectedSpot.hourlyRate)}<span className="text-sm text-gray-500 font-normal">/hr</span></strong>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Distance</span>
                <span className="text-gray-200 font-medium">{selectedSpot.distanceKm != null ? `${selectedSpot.distanceKm.toFixed(2)} km` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Drive</span>
                <span className="text-[#ff7a00] font-semibold">{routeMeta ? `${routeMeta.distanceText} · ${routeMeta.durationText}` : "Enable location"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Platform fee</span>
                <span className="text-gray-200 font-medium">{formatCurrency(platformFeePreview)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Verified discount</span>
                <span className="text-[#3a86ff] font-semibold">-{formatCurrency(verifiedDiscountPreview)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                <span className="text-gray-300 font-semibold">You pay</span>
                <span className="text-white font-bold">{formatCurrency(totalPreview)}</span>
              </div>
            </div>

            <button type="button" className="w-full bg-gradient-to-r from-[#ff7a00] to-[#ffb347] hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(255,122,0,0.25)] active:scale-95 mb-6 disabled:opacity-50" onClick={bookSpot} disabled={busy}>
              {busy ? "Booking…" : "Book from Wallet"}
            </button>

            <LandmarkGuide landmarks={selectedSpot.landmarks} onFocusPoint={setLandmarkFocusPoint} />
          </motion.section>
        )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 pointer-events-none z-50 flex flex-col gap-3">
        <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div key={alert.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}} className="pointer-events-auto bg-[#ff7a00] text-white p-4 rounded-xl shadow-2xl w-80 relative overflow-hidden flex flex-col gap-2 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#ff7a00] font-black w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">{alert.stepNumber}</span>
              <strong className="font-bold flex-1 text-sm">Navigation Alert!</strong>
              <button type="button" className="text-white/80 hover:text-white" onClick={() => dismissAlert(alert.id)}>✕</button>
            </div>
            <p className="text-white/90 text-sm leading-tight">{alert.description}</p>
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
              <motion.div initial={{width:"100%"}} animate={{width:"0%"}} transition={{duration: alert.duration / 1000, ease:"linear"}} className="h-full bg-white"/>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </>
  );
}
