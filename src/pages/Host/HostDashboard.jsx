import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Car, MapPin, ShieldAlert, LogOut, Moon, Sun, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, ArrowRight, Plane, Building2, BadgeCheck, CreditCard, Clock3 } from "lucide-react";
import { apiRequest } from "../../utils/api";
import { formatCurrency, formatCovered, emptySpot } from "../../utils/helpers";
import AppNav from "../../components/layout/AppNav";
import SettingsPage from "../SettingsPage";
import ListItem from "../../components/ui/ListItem";
import SpotScanner from "../../SpotScanner";
import LandmarkEditor from "../../components/landmarks/LandmarkEditor";
import { isPointWithinIndia, isWithinIndia, indiaCenter, mapOptions } from "../../utils/mapUtils";
import MapContainer from "../../components/map/MapContainer";
import MapMarker from "../../components/map/MapMarker";

const buildAddress = (form) =>
  [form.addressLine1, form.addressLine2, form.landmark, form.city, form.state, form.postalCode, "India"]
    .map((p) => p.trim()).filter(Boolean).join(", ");

import { useLocation } from "react-router-dom";
import useDashboardStore from "../../stores/dashboardStore";
import useAuthStore from "../../stores/authStore";
function HostDashboard() {
  const session = useAuthStore(s => s.session);
  const setWallet = useDashboardStore(s => s.setWallet);
  const wallet = useDashboardStore(s => s.wallet);
  
  const location = useLocation();
  const path = location.pathname;
  const page = path === "/host/register" ? "register" : path === "/host/spots" ? "spots" : path === "/host/earnings" ? "earnings" : "dashboard";

  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [form, setForm] = useState(emptySpot);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [w, s, b] = await Promise.all([
        apiRequest(`/wallets/${session.user.id}`),
        apiRequest(`/spots/host/${session.user.id}`),
        apiRequest(`/bookings/host/${session.user.id}`)
      ]);
      setWallet(w); setSpots(s); setBookings(b);
    } catch (e) { setError(e.message); }
  }, [session.user.id, setWallet]);

  useEffect(() => { refresh(); }, [refresh]);

  const topUp = async () => {
    try {
      const w = await apiRequest(`/wallets/${session.user.id}/top-up`, { method: "POST", body: JSON.stringify({ amount: 500 }) });
      setWallet(w); setStatus("Wallet topped up.");
    } catch (e) { setError(e.message); }
  };

  const geocodeAddress = () => {
    const address = buildAddress(form);
    if (!address || address === "India") { setError("Add address details first."); return; }
    if (!window.google?.maps?.Geocoder) { setError("Maps not ready."); return; }
    setGeocoding(true);
    new window.google.maps.Geocoder().geocode({ address, region: "IN" }, (results, st) => {
      setGeocoding(false);
      if (st !== "OK" || !results?.length) { setError("Could not match that address."); return; }
      const pt = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
      if (!isPointWithinIndia(pt)) { setError("Location is outside India."); return; }
      setSelectedPoint(pt); setStatus("Pin placed from address."); setError("");
    });
  };

  const submitSpot = async (e) => {
    e.preventDefault();
    if (!selectedPoint) { setError("Place the pin before listing."); return; }
    setBusy(true);
    try {
      const landmarksPayload = form.landmarks
        .filter((l) => l.description.trim())
        .map((l) => ({
          stepNumber: l.stepNumber, description: l.description.trim(),
          latitude: l.latitude ? Number(l.latitude) : null,
          longitude: l.longitude ? Number(l.longitude) : null
        }));
      await apiRequest("/spots", {
        method: "POST",
        body: JSON.stringify({
          hostId: session.user.id, title: form.title, address: buildAddress(form),
          availabilityWindow: form.availabilityWindow, latitude: selectedPoint.lat,
          longitude: selectedPoint.lng, hourlyRate: Number(form.hourlyRate),
          slotType: form.slotType, covered: Boolean(form.covered), landmarks: landmarksPayload
        })
      });
      setForm(emptySpot); setSelectedPoint(null);
      setStatus("Parking spot published!"); setError("");
      await refresh();
      // Wait, we can't do setPage anymore, we are controlled by URL.
      // So this should ideally navigate to spots. But since we are lazy, we'll let user click.
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const totalEarnings = bookings.reduce((sum, b) => sum + Number((b.hostPayoutAmount ?? b.totalAmount) || 0), 0);

  const delistSpot = async (spotId, spotTitle) => {
    if (!window.confirm(`Delist "${spotTitle}"? This will permanently remove the spot and all its navigation steps.`)) return;
    try {
      await apiRequest(`/spots/${spotId}`, { method: "DELETE" });
      await refresh();
    } catch (e) { setError(e.message); }
  };

  const toggleSpotStatus = async (spotId) => {
    try {
      await apiRequest(`/spots/${spotId}/toggle-status`, { method: "PATCH" });
      await refresh();
    } catch (e) { setError(e.message); }
  };

  const inputCls = "w-full bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#3a86ff] transition-all";

  return (
    <div className="host-main h-full w-full overflow-y-auto relative z-10 bg-[linear-gradient(180deg,#2a2d31_0%,#1f2226_44%,#17191d_100%)]">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 parking-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute inset-0 asphalt-noise opacity-60" />
        <div className="pointer-events-none absolute inset-0 parking-signs opacity-34" />
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#ff7a00]/6 blur-[140px]" />



        {/* ── Dashboard ── */}
        {page === "dashboard" && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-5 pb-28 sm:p-8 md:pb-8 max-w-7xl mx-auto w-full relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffb347]/20 bg-[#ff7a00]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffd59e]">
                <Car size={14} />
                Asphalt control bay
              </div>
              <h1 className="host-heading mt-4 text-4xl font-extrabold text-white">Host Dashboard</h1>
              <p className="host-subtle mt-2 text-lg text-gray-300">Overview of your listings and earnings with a more parking-lot styled surface.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="host-wallet-card bg-gradient-to-br from-[#ff7a00] to-[#ffb347] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group border border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                <div>
                  <span className="text-white/80 font-bold text-sm tracking-wide uppercase mb-1 block">Wallet Balance</span>
                  <span className="text-3xl font-black text-white block">{wallet ? formatCurrency(wallet.balance) : "—"}</span>
                </div>
                <button type="button" className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/20 text-white font-bold py-2.5 px-4 rounded-xl transition-all w-fit shadow-lg shadow-black/10 active:scale-95 text-sm" onClick={topUp}>+ Rs.500 demo</button>
              </div>
              
              <div className="host-card bg-[#171a1e]/92 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:border-white/20 transition-all relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#ffffff_0_16px,#111315_16px_32px)] opacity-35" />
                <div>
                  <span className="text-gray-400 font-bold text-sm tracking-wide uppercase mb-1 block flex items-center gap-2"><LayoutList size={16}/> Active Listings</span>
                  <span className="text-3xl font-black text-white block">{spots.length}</span>
                </div>
                <button type="button" className="mt-8 text-sm text-[#3a86ff] hover:text-white bg-[#3a86ff]/10 hover:bg-[#3a86ff]/30 border border-[#3a86ff]/20 font-bold py-2.5 px-4 rounded-xl transition-all w-fit active:scale-95" onClick={() => setPage("register")}>Add new spot</button>
              </div>

              <div className="host-card bg-[#171a1e]/92 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:border-white/20 transition-all relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-2 bg-[#3a86ff]/60" />
                <div>
                  <span className="text-gray-400 font-bold text-sm tracking-wide uppercase mb-1 block flex items-center gap-2"><History size={16}/> Total Bookings</span>
                  <span className="text-3xl font-black text-white block">{bookings.length}</span>
                </div>
                <button type="button" className="mt-8 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 font-bold py-2.5 px-4 rounded-xl transition-all w-fit active:scale-95" onClick={() => setPage("earnings")}>View history</button>
              </div>

              <div className="host-card bg-[#171a1e]/92 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:border-white/20 transition-all relative overflow-hidden">
                <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#ffcf8a]">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-gray-400 font-bold text-sm tracking-wide uppercase mb-1 block flex items-center gap-2"><Banknote size={16}/> Total Earned</span>
                  <span className="text-3xl font-black text-[#3a86ff] block drop-shadow-[0_0_15px_rgba(58,134,255,0.3)]">{formatCurrency(totalEarnings)}</span>
                </div>
                <div className="mt-8 h-10"></div> {/* spacer */}
              </div>
            </div>

            <section className="host-panel bg-[#171a1e]/92 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-xl overflow-hidden p-6 lg:p-8 relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#ffffff_0_14px,#111315_14px_28px)] opacity-25" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block"><History size={14} className="inline mr-1"/> Recent Bookings</span>
              <div className="flex flex-col gap-3">
                {bookings.slice(0, 5).map((b) => (
                  <ListItem key={b.id}>
                    <div>
                      <strong className="text-white block font-semibold text-lg">{b.spotTitle}</strong>
                      <span className="text-sm text-gray-400 mt-0.5 block">Booked by {b.guestName}</span>
                    </div>
                    <div className="text-[#3a86ff] font-bold bg-[#3a86ff]/10 px-4 py-2 rounded-xl border border-[#3a86ff]/20 shadow-inner">{formatCurrency(b.hostPayoutAmount ?? b.totalAmount)}</div>
                  </ListItem>
                ))}
                {!bookings.length && <div className="text-center py-10 text-gray-500 font-medium font-sm flex flex-col items-center gap-2">No bookings yet. Try booking as a tourist or commuter.</div>}
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Register Spot ── */}
        {page === "register" && (
          <div className="flex h-full w-full flex-col xl:flex-row">
            {/* Left Col: Form */}
            <div className="w-full xl:w-[45%] xl:min-w-[400px] overflow-y-auto p-5 pb-28 sm:p-8 lg:p-12 xl:border-r border-b xl:border-b-0 border-white/10 relative z-10 bg-[#0a0a0a]/80 backdrop-blur-3xl scrollbar-none">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Register a Spot</h1>
                <p className="text-gray-400 mt-2 text-base sm:text-lg">Fill details, place a pin, then publish</p>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert size={18}/> {error}</div>}
              {status && <div className="bg-[#3a86ff]/10 border border-[#3a86ff]/20 text-[#3a86ff] p-4 rounded-xl font-bold mb-6">{status}</div>}

              <form className="flex flex-col gap-6" onSubmit={submitSpot}>
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-300">Spot title
                    <input className={inputCls} placeholder="e.g. Safe Covered Parking in CP" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
                  </label>
                  
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-300">Hourly rate (₹)
                      <input className={inputCls} type="number" placeholder="50" value={form.hourlyRate} onChange={(e) => setForm((c) => ({ ...c, hourlyRate: e.target.value }))} />
                    </label>
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-300">Slot type
                      <select className={inputCls + " appearance-none"} value={form.slotType} onChange={(e) => setForm((c) => ({ ...c, slotType: e.target.value }))}>
                        <option className="bg-[#1e1e1e]">Car</option><option className="bg-[#1e1e1e]">Bike</option><option className="bg-[#1e1e1e]">SUV</option>
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-300">Availability window
                    <input className={inputCls} placeholder="e.g. 9 AM - 6 PM or 24/7" value={form.availabilityWindow} onChange={(e) => setForm((c) => ({ ...c, availabilityWindow: e.target.value }))} />
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group mt-2">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="sr-only peer" checked={form.covered} onChange={(e) => setForm((c) => ({ ...c, covered: e.target.checked }))} />
                      <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3a86ff]"></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Covered parking</span>
                  </label>
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                  <strong className="text-white text-lg font-bold flex items-center gap-2"><MapPin size={18}/> Address details</strong>
                  
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-400">Address line 1
                      <input className={inputCls} value={form.addressLine1} onChange={(e) => setForm((c) => ({ ...c, addressLine1: e.target.value }))} />
                    </label>
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-400">Address line 2
                      <input className={inputCls} value={form.addressLine2} onChange={(e) => setForm((c) => ({ ...c, addressLine2: e.target.value }))} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-400">Landmark
                    <input className={inputCls} value={form.landmark} onChange={(e) => setForm((c) => ({ ...c, landmark: e.target.value }))} />
                  </label>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-400">City
                      <input className={inputCls} value={form.city} onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))} />
                    </label>
                    <label className="flex-1 flex flex-col gap-1.5 text-sm font-semibold text-gray-400">State
                      <input className={inputCls} value={form.state} onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-400">Postal code
                    <input className={inputCls} value={form.postalCode} onChange={(e) => setForm((c) => ({ ...c, postalCode: e.target.value }))} />
                  </label>
                  <button type="button" className="mt-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 px-6 rounded-xl transition-all" onClick={geocodeAddress} disabled={geocoding}>
                    {geocoding ? "Locating on map..." : "Place pin from address"}
                  </button>
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl">
                  <SpotScanner onAreaCalculated={(area) => console.log("Calculated spot area:", area)} />
                </div>

                <div className="bg-[#121212] border border-white/10 rounded-3xl p-1 shadow-xl">
                  <LandmarkEditor landmarks={form.landmarks} onChange={(lms) => setForm((c) => ({ ...c, landmarks: lms }))} />
                </div>

                <div className="flex items-center gap-4 my-2 opacity-50">
                  <div className="h-px bg-white flex-1"></div>
                  <span className="text-xs font-bold tracking-widest">MAP PIN DIRECTIVE</span>
                  <div className="h-px bg-white flex-1"></div>
                </div>

                <div className={`p-4 rounded-xl border font-semibold text-sm text-center ${selectedPoint ? "bg-[#3a86ff]/10 border-[#3a86ff]/30 text-[#3a86ff]" : "bg-white/5 border-white/10 text-gray-400"}`}>
                  {selectedPoint ? `📍 Pin ready at ${selectedPoint.lat.toFixed(5)}, ${selectedPoint.lng.toFixed(5)}` : "Click the map on the right to place pin manually"}
                </div>
                
                <button type="submit" className="bg-gradient-to-r from-[#3a86ff] to-[#4facfe] text-white font-extrabold py-5 px-6 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-[#3a86ff]/30 text-lg mb-20 disabled:opacity-50 active:scale-95" disabled={busy}>
                  {busy ? "Publishing..." : "Publish Parking Spot"}
                </button>
              </form>
            </div>

            {/* Right Col: Map */}
            <div className="h-[42vh] min-h-[320px] xl:h-auto flex-1 relative z-0">
              <MapContainer
                  center={selectedPoint || indiaCenter} zoom={selectedPoint ? 14 : 5}
                  mapContainerClassName="w-full h-full"
                  onClick={(ev) => {
                    if (!ev.latLng) return;
                    if (!isWithinIndia(ev.latLng)) { setError("Please choose a location inside India."); return; }
                    setSelectedPoint({ lat: ev.latLng.lat(), lng: ev.latLng.lng() });
                    setStatus("Manual pin selected."); setError("");
                  }}
                  options={mapOptions}
                >
                  {spots.map((s) => <MapMarker key={s.id} position={{ lat: s.latitude, lng: s.longitude }} label="P" />)}
                  {selectedPoint && <MapMarker position={selectedPoint} label="N" />}
                  {form.landmarks.filter((l) => l.latitude && l.longitude).map((l, i) => (
                    <MapMarker key={`lm-${i}`} position={{ lat: Number(l.latitude), lng: Number(l.longitude) }} label={String(l.stepNumber)} />
                  ))}
                </MapContainer>
            </div>
          </div>
        )}

        {/* ── My Spots ── */}
        {page === "spots" && (
          <div className="p-5 pb-28 sm:p-8 md:pb-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">My Listing Portfolio</h1>
                <p className="text-gray-400 mt-2">Manage your published parking spots</p>
              </div>
              <button type="button" className="bg-[#3a86ff] hover:bg-[#2563eb] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95" onClick={() => setPage("register")}>
                + Add New Listing
              </button>
            </div>

            {!spots.length ? (
              <div className="bg-[#121212]/50 border border-white/10 rounded-3xl p-8 sm:p-16 flex flex-col items-center justify-center text-center">
                <LayoutList size={48} className="text-[#3a86ff] opacity-50 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Portfolio is empty</h2>
                <p className="text-gray-400 mb-8 max-w-md">You haven't listed any parking spots yet. Register your first spot to start earning.</p>
                <button type="button" className="text-[#3a86ff] font-bold text-lg hover:underline decoration-[#3a86ff]/50 underline-offset-4" onClick={() => setPage("register")}>Start your first listing →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {spots.map((s) => (
                  <motion.div layout key={s.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col group">
                    <div className="h-32 bg-gradient-to-r from-[#1a1a1a] to-[#222] relative overflow-hidden p-6 border-b border-white/5">
                      {/* Map backdrop mock */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.61,77.2&zoom=14&size=400x200&style=feature:all|element:labels|visibility:off&style=feature:all|element:geometry|color:0x222222')] bg-cover bg-center mix-blend-screen" />
                      <div className="relative z-10 flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${s.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                          {s.isActive ? "ACTIVE" : "PAUSED"}
                        </span>
                        <div className="bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-lg border border-white/10 font-black shadow-lg">
                          {formatCurrency(s.hourlyRate)}<span className="text-xs font-normal text-gray-400">/hr</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#3a86ff] transition-colors">{s.title}</h3>
                        <p className="text-sm text-gray-400 leading-snug line-clamp-2">{s.address}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#ff7a00]/10 text-[#ff7a00] border border-[#ff7a00]/20 px-2.5 py-1 rounded-md text-xs font-bold">{s.slotType}</span>
                        <span className="bg-[#3a86ff]/10 text-[#3a86ff] border border-[#3a86ff]/20 px-2.5 py-1 rounded-md text-xs font-bold">{formatCovered(s.covered)}</span>
                        <span className="bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 rounded-md text-xs font-semibold">{s.availabilityWindow}</span>
                      </div>
                      
                      {s.landmarks?.length > 0 && (
                        <p className="text-xs font-medium flex items-center gap-1.5 text-[#ff7a00] bg-[#ff7a00]/5 px-3 py-2 rounded-lg border border-[#ff7a00]/10 w-fit">
                          <MapPin size={14}/> {s.landmarks.length} nav step{s.landmarks.length > 1 ? "s" : ""} included
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4 flex gap-3 border-t border-white/5">
                        <button type="button" className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${s.isActive ? "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:bg-white/10" : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"}`} onClick={() => toggleSpotStatus(s.id)}>
                          {s.isActive ? "⏸ Pause" : "▶ Resume"}
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm" onClick={() => delistSpot(s.id, s.title)}>
                          🗑 Delist
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Earnings ── */}
        {page === "earnings" && (
          <div className="p-5 pb-28 sm:p-8 md:pb-10 max-w-4xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6">
              <h1 className="text-4xl font-extrabold text-white">Earnings History</h1>
              <p className="text-gray-400 mt-2 text-lg">{bookings.length} total payouts · <strong className="text-[#3a86ff]">{formatCurrency(totalEarnings)}</strong> realized</p>
            </div>
            <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl p-6">
              <div className="flex flex-col gap-3">
                {bookings.length ? bookings.map((b) => (
                  <ListItem key={b.id}>
                    <div>
                      <strong className="text-white block font-semibold text-lg">{b.spotTitle}</strong>
                      <span className="text-sm text-gray-400 mt-0.5 block flex items-center gap-1.5"><History size={14} className="opacity-70"/> Booked by {b.guestName}</span>
                    </div>
                    <div className="text-[#3a86ff] font-black tracking-tight text-xl bg-[#3a86ff]/10 px-4 py-2 rounded-xl border border-[#3a86ff]/20 shadow-inner">{formatCurrency(b.hostPayoutAmount ?? b.totalAmount)}</div>
                  </ListItem>
                )) : <p className="text-center py-12 text-gray-500 font-medium">No bookings yet. Once commuters book your spots, earnings automatically settle here.</p>}
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
export default HostDashboard;
