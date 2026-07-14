import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import useAuthStore from "./stores/authStore";
import ParkingLoadingScreen from "./components/shared/ParkingLoadingScreen";
import { MapProvider } from "./components/map/MapProvider";

// Lazy loading our routes
const LandingPage = React.lazy(() => import("./pages/Public/LandingPage"));
const DashboardLayout = React.lazy(() => import("./components/layout/DashboardLayout"));
const HostDashboard = React.lazy(() => import("./pages/Host/HostDashboard"));
const MapSearch = React.lazy(() => import("./pages/Customer/MapSearch"));
const BookingHistory = React.lazy(() => import("./pages/Customer/BookingHistory"));
const Wallet = React.lazy(() => import("./pages/Customer/Wallet"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));

function RequireAuth({ children, role }) {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Navigate to="/" replace />;
  if (role && session.user.role !== role) {
    return <Navigate to={session.user.role === "HOST" ? "/host" : "/customer"} replace />;
  }
  return children;
}

export default function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isDark = useAuthStore(s => s.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("theme-light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("theme-light");
    }
  }, [isDark]);

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

  return (
    <BrowserRouter>
      <MapProvider>
        <Suspense fallback={<ParkingLoadingScreen />}>
          <Routes>
            {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Customer Routes */}
          <Route path="/customer" element={
            <RequireAuth role="GUEST">
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<MapSearch />} />
            <Route path="history" element={<BookingHistory />} />
            <Route path="wallet" element={<Wallet />} />
          </Route>

          {/* Host Routes */}
          <Route path="/host" element={
            <RequireAuth role="HOST">
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<HostDashboard />} />
            {/* We will implement other host subroutes later */}
            <Route path="register" element={<HostDashboard />} />
            <Route path="spots" element={<HostDashboard />} />
            <Route path="earnings" element={<HostDashboard />} />
          </Route>

          {/* Shared Settings */}
          <Route path="/settings" element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<SettingsPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MapProvider>
    </BrowserRouter>
  );
}