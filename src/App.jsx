import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import useAuthStore from "./stores/authStore";
import useMapStore from "./stores/mapStore";
import useDashboardStore from "./stores/dashboardStore";
import { MapProvider } from "./components/map/MapProvider";
import LandingPage from "./pages/LandingPage";
import HostDashboard from "./pages/HostDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";


export default function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [session, setSession] = useState(() => getStoredSession());
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey || "", libraries });
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem("sharespace-theme") === "dark");
  const [showLandingLoader, setShowLandingLoader] = useState(() => !session && !window.sessionStorage.getItem("sharespace-landing-loaded"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("theme-light");
      window.localStorage.setItem("sharespace-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("theme-light");
      window.localStorage.setItem("sharespace-theme", "light");
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(d => !d);

  const authenticate = (s) => { setStoredSession(s); setSession(s); };
  const updateSession = (s) => { setStoredSession(s); setSession(s); };
  const logout = () => { clearStoredSession(); setSession(null); };
  const completeLandingLoader = () => {
    window.sessionStorage.setItem("sharespace-landing-loaded", "true");
    setShowLandingLoader(false);
  };

  if (!apiKey) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <h1>shareSpace</h1>
          <p>Add your Google Maps API key to <code>.env</code> before loading.</p>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <AnimatePresence mode="wait">
          {showLandingLoader && <ParkingLoadingScreen onComplete={completeLandingLoader} />}
        </AnimatePresence>
        {!showLandingLoader && <AuthScreen onAuthenticated={authenticate} />}
      </>
    );
  }

  return session.user.role === "HOST"
    ? <HostDashboard session={session} onSessionChange={updateSession} onLogout={logout} isLoaded={isLoaded} loadError={loadError} isDark={isDark} toggleDark={toggleDark} />
    : <CustomerDashboard session={session} onSessionChange={updateSession} onLogout={logout} isLoaded={isLoaded} loadError={loadError} isDark={isDark} toggleDark={toggleDark} />;
}