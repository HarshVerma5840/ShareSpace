import {
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  useJsApiLoader
} from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";

const apiBaseUrl = "http://localhost:8080/api";
const sessionStorageKey = "sharespace-session";
const libraries = ["places"];
const indiaCenter = { lat: 22.5937, lng: 78.9629 };
const indiaBounds = { north: 37.6, south: 6.4, west: 68.0, east: 97.5 };
const mapOptions = {
  minZoom: 4,
  restriction: { latLngBounds: indiaBounds, strictBounds: true },
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
};

const emptyLogin = { email: "", password: "" };
const emptyRegister = { fullName: "", email: "", phone: "", password: "", role: "GUEST" };
const emptySpot = {
  title: "",
  availabilityWindow: "",
  hourlyRate: "60",
  slotType: "Car",
  covered: true,
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: ""
};

const getStoredSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(sessionStorageKey) || "null");
  } catch {
    return null;
  }
};

const setStoredSession = (session) =>
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));

const clearStoredSession = () => window.localStorage.removeItem(sessionStorageKey);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount ?? 0));

const formatCovered = (covered) => (covered ? "Covered" : "Open air");

const buildAddress = (form) =>
  [
    form.addressLine1,
    form.addressLine2,
    form.landmark,
    form.city,
    form.state,
    form.postalCode,
    "India"
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

const isWithinIndia = (latLng) =>
  latLng.lat() >= indiaBounds.south &&
  latLng.lat() <= indiaBounds.north &&
  latLng.lng() >= indiaBounds.west &&
  latLng.lng() <= indiaBounds.east;

const isPointWithinIndia = (point) =>
  point.lat >= indiaBounds.south &&
  point.lat <= indiaBounds.north &&
  point.lng >= indiaBounds.west &&
  point.lng <= indiaBounds.east;

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
  } catch {
    throw new Error("ShareSpace backend is unavailable on localhost:8080.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const validationErrors = payload?.errors ? Object.values(payload.errors).join(" ") : "";
    throw new Error(payload?.message || validationErrors || "Request failed.");
  }

  return payload;
}

function PanelHeader({ user, wallet, title, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <span className="brand-chip">shareSpace</span>
        <h1>{title}</h1>
        <p>
          {user.fullName} | {user.role === "HOST" ? "Host" : "Commuter"} |{" "}
          {wallet ? formatCurrency(wallet.balance) : "Loading wallet"}
        </p>
      </div>
      <div className="topbar-actions">
        <div className="status-pill">Parking app demo</div>
        <button type="button" className="ghost-button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

function WalletCard({ wallet, onTopUp }) {
  return (
    <section className="panel-card accent-card">
      <span className="card-kicker">Wallet</span>
      <h2>{wallet ? formatCurrency(wallet.balance) : "Loading..."}</h2>
      <p>Mock balance for top-ups, bookings, and host earnings.</p>
      <button type="button" className="primary-button" onClick={onTopUp}>
        Add Rs.500 demo balance
      </button>
    </section>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (path, payload) => {
    setBusy(true);
    setError("");
    try {
      onAuthenticated(await apiRequest(path, { method: "POST", body: JSON.stringify(payload) }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="hero-badge">Urban Mobility | Smart Parking</div>
        <h1>Reserve trusted parking, earn from unused slots, and test payments with wallets.</h1>
        <p>
          shareSpace is designed like a real parking marketplace with user accounts,
          host listings, commuter bookings, route guidance, and wallet-backed flows.
        </p>
      </section>
      <section className="auth-card">
        <div className="tab-row">
          <button type="button" className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>
            Register
          </button>
        </div>
        {mode === "login" ? (
          <form className="auth-form" onSubmit={(event) => {
            event.preventDefault();
            submit("/auth/login", loginForm);
          }}>
            <label>Email<input value={loginForm.email} onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))} /></label>
            <label>Password<input type="password" value={loginForm.password} onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))} /></label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="primary-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={(event) => {
            event.preventDefault();
            submit("/auth/register", registerForm);
          }}>
            <label>Full name<input value={registerForm.fullName} onChange={(e) => setRegisterForm((c) => ({ ...c, fullName: e.target.value }))} /></label>
            <label>Email<input value={registerForm.email} onChange={(e) => setRegisterForm((c) => ({ ...c, email: e.target.value }))} /></label>
            <label>Phone<input value={registerForm.phone} onChange={(e) => setRegisterForm((c) => ({ ...c, phone: e.target.value }))} /></label>
            <label>Password<input type="password" value={registerForm.password} onChange={(e) => setRegisterForm((c) => ({ ...c, password: e.target.value }))} /></label>
            <label>Role<select value={registerForm.role} onChange={(e) => setRegisterForm((c) => ({ ...c, role: e.target.value }))}><option value="GUEST">Commuter</option><option value="HOST">Host</option></select></label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="primary-button" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
          </form>
        )}
      </section>
    </div>
  );
}

function ListItem({ children, active, asButton = false, onClick }) {
  const className = active ? "list-item selectable active" : asButton ? "list-item selectable" : "list-item";
  if (asButton) {
    return <button type="button" className={className} onClick={onClick}>{children}</button>;
  }
  return <article className={className}>{children}</article>;
}

function HostDashboard({ session, onSessionChange, onLogout, isLoaded, loadError }) {
  const [wallet, setWallet] = useState(session.wallet);
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [form, setForm] = useState(emptySpot);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const refresh = async () => {
    try {
      const [walletData, spotsData, bookingsData] = await Promise.all([
        apiRequest(`/wallets/${session.user.id}`),
        apiRequest(`/spots/host/${session.user.id}`),
        apiRequest(`/bookings/host/${session.user.id}`)
      ]);
      setWallet(walletData);
      setSpots(spotsData);
      setBookings(bookingsData);
      onSessionChange({ ...session, wallet: walletData });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const topUp = async () => {
    try {
      const walletData = await apiRequest(`/wallets/${session.user.id}/top-up`, {
        method: "POST",
        body: JSON.stringify({ amount: 500 })
      });
      setWallet(walletData);
      onSessionChange({ ...session, wallet: walletData });
      setStatus("Wallet topped up with demo balance.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const geocodeAddress = () => {
    const address = buildAddress(form);
    if (!address || address === "India") {
      setError("Add address details before placing the pin.");
      return;
    }
    if (!window.google?.maps?.Geocoder) {
      setError("Google Maps geocoder is not ready yet.");
      return;
    }
    setGeocoding(true);
    new window.google.maps.Geocoder().geocode({ address, region: "IN" }, (results, mapStatus) => {
      setGeocoding(false);
      if (mapStatus !== "OK" || !results?.length) {
        setError("Could not match that address. Add more detail or use manual pin.");
        return;
      }
      const point = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      };
      if (!isPointWithinIndia(point)) {
        setError("The matched location is outside India.");
        return;
      }
      setSelectedPoint(point);
      setStatus("Pin placed from address.");
      setError("");
    });
  };

  const submitSpot = async (event) => {
    event.preventDefault();
    if (!selectedPoint) {
      setError("Place the pin from address or manually on the map before listing the spot.");
      return;
    }
    setBusy(true);
    try {
      await apiRequest("/spots", {
        method: "POST",
        body: JSON.stringify({
          hostId: session.user.id,
          title: form.title,
          address: buildAddress(form),
          availabilityWindow: form.availabilityWindow,
          latitude: selectedPoint.lat,
          longitude: selectedPoint.lng,
          hourlyRate: Number(form.hourlyRate),
          slotType: form.slotType,
          covered: Boolean(form.covered)
        })
      });
      setForm(emptySpot);
      setSelectedPoint(null);
      setStatus("Parking spot published successfully.");
      setError("");
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <PanelHeader user={session.user} wallet={wallet} title="Host Command Center" onLogout={onLogout} />
      <div className="workspace-grid">
        <aside className="sidebar">
          <WalletCard wallet={wallet} onTopUp={topUp} />
          <section className="panel-card">
            <span className="card-kicker">New Listing</span>
            <h2>Publish a parking spot</h2>
            <form className="spot-form" onSubmit={submitSpot}>
              <label>Spot title<input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} /></label>
              <div className="split-grid">
                <label>Hourly rate<input type="number" value={form.hourlyRate} onChange={(e) => setForm((c) => ({ ...c, hourlyRate: e.target.value }))} /></label>
                <label>Slot type<select value={form.slotType} onChange={(e) => setForm((c) => ({ ...c, slotType: e.target.value }))}><option>Car</option><option>Bike</option><option>SUV</option></select></label>
              </div>
              <label>Availability window<input value={form.availabilityWindow} onChange={(e) => setForm((c) => ({ ...c, availabilityWindow: e.target.value }))} /></label>
              <label className="toggle-check"><input type="checkbox" checked={form.covered} onChange={(e) => setForm((c) => ({ ...c, covered: e.target.checked }))} />Covered parking</label>
              <div className="section-card">
                <strong>Address based pin</strong>
                <div className="split-grid">
                  <label>Address line 1<input value={form.addressLine1} onChange={(e) => setForm((c) => ({ ...c, addressLine1: e.target.value }))} /></label>
                  <label>Address line 2<input value={form.addressLine2} onChange={(e) => setForm((c) => ({ ...c, addressLine2: e.target.value }))} /></label>
                </div>
                <label>Landmark<input value={form.landmark} onChange={(e) => setForm((c) => ({ ...c, landmark: e.target.value }))} /></label>
                <div className="split-grid">
                  <label>City<input value={form.city} onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))} /></label>
                  <label>State<input value={form.state} onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))} /></label>
                </div>
                <label>Postal code<input value={form.postalCode} onChange={(e) => setForm((c) => ({ ...c, postalCode: e.target.value }))} /></label>
                <button type="button" className="ghost-button" onClick={geocodeAddress} disabled={!isLoaded || geocoding}>{geocoding ? "Locating..." : "Place pin from address"}</button>
              </div>
              <div className="or-row">OR</div>
              <div className="location-banner">{selectedPoint ? `Pin ready at ${selectedPoint.lat.toFixed(5)}, ${selectedPoint.lng.toFixed(5)}` : "Click the map to place the spot manually"}</div>
              {status ? <p className="success">{status}</p> : null}
              {error ? <p className="error">{error}</p> : null}
              <button type="submit" className="primary-button" disabled={busy}>{busy ? "Publishing..." : "Publish parking spot"}</button>
            </form>
          </section>
        </aside>
        <main className="content">
          <section className="map-panel">
            {loadError ? <div className="loading-card">Google Maps failed to load.</div> : isLoaded ? (
              <GoogleMap
                center={selectedPoint || (spots[0] ? { lat: spots[0].latitude, lng: spots[0].longitude } : indiaCenter)}
                zoom={selectedPoint || spots.length ? 13 : 5}
                mapContainerClassName="map"
                onClick={(event) => {
                  if (!event.latLng) return;
                  if (!isWithinIndia(event.latLng)) {
                    setError("Please choose a location inside India.");
                    return;
                  }
                  setSelectedPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                  setStatus("Manual pin selected.");
                  setError("");
                }}
                options={mapOptions}
              >
                {spots.map((spot) => <MarkerF key={spot.id} position={{ lat: spot.latitude, lng: spot.longitude }} label="P" />)}
                {selectedPoint ? <MarkerF position={selectedPoint} label="N" /> : null}
              </GoogleMap>
            ) : <div className="loading-card">Loading map...</div>}
          </section>
          <section className="cards-grid">
            <section className="panel-card">
              <span className="card-kicker">Your Spots</span>
              <h2>{spots.length} active listings</h2>
              <div className="card-list">
                {spots.length ? spots.map((spot) => (
                  <ListItem key={spot.id}>
                    <div><strong>{spot.title}</strong><span>{spot.address}</span><span>{spot.slotType} | {formatCovered(spot.covered)}</span></div>
                    <div className="price-tag">{formatCurrency(spot.hourlyRate)}/hr</div>
                  </ListItem>
                )) : <p className="muted">List your first parking spot to start earning.</p>}
              </div>
            </section>
            <section className="panel-card">
              <span className="card-kicker">Host Earnings</span>
              <h2>{bookings.length} recent bookings</h2>
              <div className="card-list">
                {bookings.length ? bookings.map((booking) => (
                  <ListItem key={booking.id}>
                    <div><strong>{booking.spotTitle}</strong><span>Booked by {booking.guestName}</span></div>
                    <div className="price-tag">{formatCurrency(booking.totalAmount)}</div>
                  </ListItem>
                )) : <p className="muted">Once commuters book your spots, earnings will appear here.</p>}
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

function GuestDashboard({ session, onSessionChange, onLogout, isLoaded, loadError }) {
  const [wallet, setWallet] = useState(session.wallet);
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [searchRadiusKm, setSearchRadiusKm] = useState("1");
  const [directions, setDirections] = useState(null);
  const [routeMeta, setRouteMeta] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Allow location access and search for your destination.");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  const refresh = async (destination = destinationPoint) => {
    try {
      const query = destination
        ? `/spots?latitude=${destination.lat}&longitude=${destination.lng}&radiusKm=${searchRadiusKm}`
        : "/spots";
      const [walletData, spotsData, bookingsData] = await Promise.all([
        apiRequest(`/wallets/${session.user.id}`),
        apiRequest(query),
        apiRequest(`/bookings/guest/${session.user.id}`)
      ]);
      setWallet(walletData);
      setSpots(spotsData);
      setBookings(bookingsData);
      onSessionChange({ ...session, wallet: walletData });
      setSelectedSpot(spotsData.length ? spotsData[0] : null);
      if (destination) {
        setStatus(
          spotsData.length
            ? `Found ${spotsData.length} parking spot(s) within ${searchRadiusKm} km of your destination.`
            : `No parking spots found within ${searchRadiusKm} km of that destination.`
        );
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStatus("Current location detected. Live tracking is active while you travel.");
      },
      () => {
        setStatus("Location access denied. You can still search by destination, but route guidance needs your live location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
    refresh(null);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (destinationPoint) {
      refresh(destinationPoint);
    }
  }, [searchRadiusKm]);

  useEffect(() => {
    if (!isLoaded || !currentLocation || !selectedSpot) {
      setDirections(null);
      setRouteMeta(null);
      return;
    }

    new window.google.maps.DirectionsService().route(
      {
        origin: currentLocation,
        destination: { lat: selectedSpot.latitude, lng: selectedSpot.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, routeStatus) => {
        if (routeStatus === "OK" && result) {
          setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          setRouteMeta(
            leg
              ? {
                  distanceText: leg.distance?.text || "",
                  durationText: leg.duration?.text || ""
                }
              : null
          );
        } else {
          setDirections(null);
          setRouteMeta(null);
        }
      }
    );
  }, [isLoaded, currentLocation, selectedSpot]);

  const searchDestination = () => {
    if (!destinationInput.trim()) {
      setError("Enter the place you need to go so I can search nearby parking.");
      return;
    }
    if (!window.google?.maps?.Geocoder) {
      setError("Google Maps geocoder is not ready yet.");
      return;
    }

    setSearching(true);
    setError("");
    new window.google.maps.Geocoder().geocode(
      { address: destinationInput, region: "IN" },
      async (results, mapStatus) => {
        setSearching(false);
        if (mapStatus !== "OK" || !results?.length) {
          setError("That destination could not be matched. Try a more specific place name.");
          return;
        }

        const point = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        if (!isPointWithinIndia(point)) {
          setError("Please search for a destination within India.");
          return;
        }

        setDestinationPoint(point);
        await refresh(point);
      }
    );
  };

  const topUp = async () => {
    try {
      const walletData = await apiRequest(`/wallets/${session.user.id}/top-up`, {
        method: "POST",
        body: JSON.stringify({ amount: 500 })
      });
      setWallet(walletData);
      onSessionChange({ ...session, wallet: walletData });
      setStatus("Wallet topped up. You can continue mock booking.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const bookSpot = async () => {
    if (!selectedSpot) {
      return;
    }
    setBusy(true);
    try {
      const receipt = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({ guestId: session.user.id, spotId: selectedSpot.id })
      });
      setWallet(receipt.wallet);
      onSessionChange({ ...session, wallet: receipt.wallet });
      setStatus(`Booking confirmed for ${selectedSpot.title}. Follow the route to the parking spot, then walk to your destination.`);
      setError("");
      await refresh(destinationPoint);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const mapCenter = useMemo(() => {
    if (selectedSpot) {
      return { lat: selectedSpot.latitude, lng: selectedSpot.longitude };
    }
    if (destinationPoint) {
      return destinationPoint;
    }
    return currentLocation || indiaCenter;
  }, [currentLocation, destinationPoint, selectedSpot]);

  return (
    <div className="dashboard-shell">
      <PanelHeader user={session.user} wallet={wallet} title="Commuter Booking Desk" onLogout={onLogout} />
      <div className="workspace-grid">
        <aside className="sidebar">
          <WalletCard wallet={wallet} onTopUp={topUp} />
          <section className="panel-card">
            <span className="card-kicker">Destination Search</span>
            <h2>Search parking near where you need to go</h2>
            <label>
              Destination
              <input
                value={destinationInput}
                onChange={(event) => setDestinationInput(event.target.value)}
                placeholder="Office, mall, metro station, landmark"
              />
            </label>
            <label>
              Search radius
              <select
                value={searchRadiusKm}
                onChange={(event) => setSearchRadiusKm(event.target.value)}
              >
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="3">3 km</option>
                <option value="4">4 km</option>
                <option value="5">5 km</option>
              </select>
            </label>
            <button type="button" className="primary-button" onClick={searchDestination} disabled={!isLoaded || searching}>
              {searching ? "Searching..." : `Find parking within ${searchRadiusKm} km`}
            </button>
            <button type="button" className="ghost-button" onClick={requestLocation}>
              Refresh current location
            </button>
            <p className="muted">{status}</p>
            {error ? <p className="error">{error}</p> : null}
          </section>
          <section className="panel-card">
            <span className="card-kicker">Nearby Spots</span>
            <h2>{destinationPoint ? "Destination-based results" : "All available spots"}</h2>
            <div className="card-list">
              {spots.length ? spots.map((spot) => (
                <ListItem key={spot.id} asButton active={selectedSpot?.id === spot.id} onClick={() => setSelectedSpot(spot)}>
                  <div>
                    <strong>{spot.title}</strong>
                    <span>{spot.address}</span>
                    <span>Hosted by {spot.hostName} | {spot.slotType} | {formatCovered(spot.covered)}</span>
                  </div>
                  <div className="price-stack">
                    <span>{formatCurrency(spot.hourlyRate)}/hr</span>
                    <small>{spot.distanceKm != null ? `${spot.distanceKm.toFixed(2)} km to destination` : "No destination yet"}</small>
                  </div>
                </ListItem>
              )) : <p className="muted">Search a destination to see parking options within 1 km.</p>}
            </div>
          </section>
        </aside>
        <main className="content">
          <section className="map-panel">
            {loadError ? <div className="loading-card">Google Maps failed to load.</div> : isLoaded ? (
              <GoogleMap center={mapCenter} zoom={selectedSpot || destinationPoint || currentLocation ? 13 : 5} mapContainerClassName="map" options={mapOptions}>
                {currentLocation ? <MarkerF position={currentLocation} label="Y" /> : null}
                {destinationPoint ? <MarkerF position={destinationPoint} label="D" /> : null}
                {spots.map((spot) => (
                  <MarkerF
                    key={spot.id}
                    position={{ lat: spot.latitude, lng: spot.longitude }}
                    label={selectedSpot?.id === spot.id ? "P" : "S"}
                  />
                ))}
                {directions ? (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: { strokeColor: "#ff7a00", strokeWeight: 6 }
                    }}
                  />
                ) : null}
              </GoogleMap>
            ) : <div className="loading-card">Loading map...</div>}
          </section>
          <section className="cards-grid">
            <section className="panel-card">
              <span className="card-kicker">Selected Spot</span>
              <h2>{selectedSpot ? selectedSpot.title : "Choose a parking spot"}</h2>
              {selectedSpot ? (
                <div className="spot-summary">
                  <p>{selectedSpot.address}</p>
                  <div className="summary-row">
                    <span>{selectedSpot.slotType}</span>
                    <span>{formatCovered(selectedSpot.covered)}</span>
                    <span>{selectedSpot.availabilityWindow}</span>
                  </div>
                  <div className="summary-row">
                    <strong>{formatCurrency(selectedSpot.hourlyRate)}/hr</strong>
                    <span>{selectedSpot.hostName}</span>
                  </div>
                  <div className="summary-row">
                    <span>{selectedSpot.distanceKm != null ? `${selectedSpot.distanceKm.toFixed(2)} km from your destination` : "Search a destination for distance"}</span>
                    <span>{routeMeta ? `Drive ${routeMeta.distanceText} | ETA ${routeMeta.durationText}` : currentLocation ? "Route updating from your live location" : "Enable location for directions"}</span>
                  </div>
                  <button type="button" className="primary-button" onClick={bookSpot} disabled={busy}>
                    {busy ? "Booking..." : "Book and pay from wallet"}
                  </button>
                </div>
              ) : <p className="muted">Select a parking result to compare route and price.</p>}
            </section>
            <section className="panel-card">
              <span className="card-kicker">Booking History</span>
              <h2>{bookings.length} bookings</h2>
              <div className="card-list">
                {bookings.length ? bookings.map((booking) => (
                  <ListItem key={booking.id}>
                    <div><strong>{booking.spotTitle}</strong><span>Hosted by {booking.hostName}</span></div>
                    <div className="price-tag">{formatCurrency(booking.totalAmount)}</div>
                  </ListItem>
                )) : <p className="muted">Your confirmed parking sessions will appear here.</p>}
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [session, setSession] = useState(() => getStoredSession());
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey || "", libraries });

  const authenticate = (nextSession) => {
    setStoredSession(nextSession);
    setSession(nextSession);
  };

  const updateSession = (nextSession) => {
    setStoredSession(nextSession);
    setSession(nextSession);
  };

  if (!apiKey) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <h1>shareSpace</h1>
          <p>Add your Google Maps API key to `.env` before loading the app.</p>
        </section>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={authenticate} />;
  }

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  return session.user.role === "HOST" ? (
    <HostDashboard session={session} onSessionChange={updateSession} onLogout={logout} isLoaded={isLoaded} loadError={loadError} />
  ) : (
    <GuestDashboard session={session} onSessionChange={updateSession} onLogout={logout} isLoaded={isLoaded} loadError={loadError} />
  );
}
