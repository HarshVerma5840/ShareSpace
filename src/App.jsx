import {
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  useJsApiLoader
} from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import SpotScanner from "./SpotScanner";
import { motion, AnimatePresence } from "motion/react";
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, ArrowRight, Plane, Building2, BadgeCheck, CreditCard, Clock3 } from "lucide-react";

const apiBaseUrl = `http://${window.location.hostname}:8080/api`;
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
const PROXIMITY_METRES = 150;

const emptyLogin = { email: "", password: "" };
const emptyRegister = { fullName: "", email: "", phone: "", password: "", role: "TOURIST" };
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
  postalCode: "",
  landmarks: []
};

const marketingStats = [
  { value: "10K+", label: "Smart parking slots" },
  { value: "50+", label: "Cities mapped" },
  { value: "5%", label: "Verified commuter savings" }
];

const landingHighlights = [
  {
    title: "Live parking discovery",
    description: "Browse nearby spots, compare distance, and book in a few taps with map-guided discovery.",
    tone: "blue"
  },
  {
    title: "Host and earn",
    description: "Turn unused driveways and private bays into income with listing controls and wallet settlement.",
    tone: "orange"
  },
  {
    title: "Verification-aware pricing",
    description: "Commuters can submit a driving license for review and unlock verified commuter discounts.",
    tone: "amber"
  }
];

const landingSteps = [
  { role: "Tourist", detail: "Open the map, book instantly, and park without needing commuter verification." },
  { role: "Commuter", detail: "Search, submit your DL for review in Settings, and unlock verified pricing after approval." },
  { role: "Host", detail: "List parking inventory, manage availability, and track real booking income from one dashboard." }
];

const floatingHeroCards = [
  { icon: MapPin, label: "12 spots nearby", tone: "blue", position: "left-[4%] top-[16%]" },
  { icon: ShieldAlert, label: "DL review ready", tone: "orange", position: "right-[4%] top-[12%]" },
  { icon: Wallet, label: "Wallet checkout", tone: "amber", position: "left-[8%] bottom-[14%]" }
];

const marketingFeatures = [
  {
    icon: MapPin,
    title: "Find parking nearby",
    description: "Search real spots on a live map, compare distance and price, then lock one in fast.",
    tone: "blue"
  },
  {
    icon: Building2,
    title: "Host your spare space",
    description: "Publish driveways and bays, manage navigation notes, and turn idle parking into income.",
    tone: "orange"
  },
  {
    icon: Plane,
    title: "Tourist instant booking",
    description: "One-time customers can jump straight into booking without commuter verification friction.",
    tone: "amber"
  },
  {
    icon: BadgeCheck,
    title: "Verified commuter savings",
    description: "Commuters can submit a driving license for review and unlock the verified 5% discount.",
    tone: "blue"
  },
  {
    icon: Wallet,
    title: "Wallet-powered checkout",
    description: "Fast payments, clear booking receipts, and demo balance top-ups keep the flow smooth.",
    tone: "orange"
  },
  {
    icon: History,
    title: "Booking history and receipts",
    description: "Review active and completed bookings with totals, fees, discounts, and host payout details.",
    tone: "amber"
  }
];

const dashboardPreviewCards = [
  {
    title: "Map search",
    eyebrow: "Driver view",
    accent: "blue",
    content: [
      { label: "Nearby available", value: "4 spots" },
      { label: "Fastest arrival", value: "2 min" }
    ]
  },
  {
    title: "Spot listing",
    eyebrow: "Host tools",
    accent: "orange",
    content: [
      { label: "Rate configured", value: "Rs.60/hr" },
      { label: "Publish state", value: "Ready" }
    ]
  },
  {
    title: "Wallet",
    eyebrow: "Payments",
    accent: "amber",
    content: [
      { label: "Balance", value: "Rs.2,500" },
      { label: "Last top-up", value: "Rs.500" }
    ]
  },
  {
    title: "Settings + verify",
    eyebrow: "Commuter profile",
    accent: "blue",
    content: [
      { label: "Verification", value: "Pending review" },
      { label: "Benefit", value: "5% off" }
    ]
  }
];

const trustMoments = [
  { title: "Built for city traffic", copy: "Layered around Indian parking habits, commuter use, and host-side inventory control." },
  { title: "Designed for clarity", copy: "Prices, fee waivers, wallet movement, and booking outcomes are visible instead of hidden." },
  { title: "Real workflows preserved", copy: "This design sits on top of your actual login, booking, wallet, and verification flows." }
];

const gifShowcaseCards = [
  {
    title: "Search pulse",
    description: "A live-style parking radar that makes the discovery flow feel immediate.",
    accent: "blue",
    type: "search"
  },
  {
    title: "Guided arrival",
    description: "Animated motion lines and route glow reinforce the assisted parking journey.",
    accent: "orange",
    type: "drive"
  },
  {
    title: "Verification scan",
    description: "A polished commuter-verification animation that fits the premium review flow.",
    accent: "amber",
    type: "verify"
  }
];

/* ─── session helpers ─── */
const getStoredSession = () => {
  try { return JSON.parse(window.localStorage.getItem(sessionStorageKey) || "null"); }
  catch { return null; }
};
const setStoredSession = (s) => window.localStorage.setItem(sessionStorageKey, JSON.stringify(s));
const clearStoredSession = () => window.localStorage.removeItem(sessionStorageKey);

/* ─── formatting ─── */
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount ?? 0));
const formatCovered = (covered) => (covered ? "Covered" : "Open air");
const getUserRoleLabel = (user) => {
  if (!user) return "";
  if (user.role === "HOST") return "Host";
  if (user.role === "COMMUTER") return "Commuter";
  return "Tourist";
};
const getVerificationLabel = (user) => {
  if (!user || user.role !== "COMMUTER") return null;
  if (user.verificationStatus === "VERIFIED") return "Verified Commuter";
  if (user.verificationStatus === "PENDING") return "Verification Pending";
  if (user.verificationStatus === "REJECTED") return "Verification Rejected";
  return "Unverified Commuter";
};
const isVerifiedCommuter = (user) => user?.role === "COMMUTER" && user?.verificationStatus === "VERIFIED";
const getPlatformFeePreview = (hourlyRate) => Number(hourlyRate ?? 0) * 0.10;
const getVerifiedDiscountPreview = (hourlyRate) => Number(hourlyRate ?? 0) * 0.05;

const buildAddress = (form) =>
  [form.addressLine1, form.addressLine2, form.landmark, form.city, form.state, form.postalCode, "India"]
    .map((p) => p.trim()).filter(Boolean).join(", ");

const isWithinIndia = (latLng) =>
  latLng.lat() >= indiaBounds.south && latLng.lat() <= indiaBounds.north &&
  latLng.lng() >= indiaBounds.west && latLng.lng() <= indiaBounds.east;

const isPointWithinIndia = (p) =>
  p.lat >= indiaBounds.south && p.lat <= indiaBounds.north &&
  p.lng >= indiaBounds.west && p.lng <= indiaBounds.east;

/* ─── haversine distance (metres) ─── */
function haversineMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── API ─── */
async function apiRequest(path, options = {}) {
  let response;
  const isFormData = options.body instanceof FormData;
    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        credentials: "include",
        headers: isFormData ? { ...(options.headers || {}) } : { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
      });
  } catch {
    throw new Error("ShareSpace backend is unavailable on localhost:8080.");
  }
  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const validationErrors = payload?.errors ? Object.values(payload.errors).join(" ") : "";
    throw new Error(payload?.message || validationErrors || "Request failed.");
  }
  return payload;
}

/* ══════════════════════════════════════════════
   SHARED SMALL COMPONENTS
══════════════════════════════════════════════ */

function ListItem({ children, active, asButton = false, onClick }) {
  const baseCls = "p-4 rounded-xl transition-all border relative overflow-hidden group flex justify-between items-center w-full text-left gap-3 relative ";
  const cls = active 
    ? baseCls + "bg-[#1e1e1e] border-[#3a86ff] shadow-[0_0_15px_rgba(58,134,255,0.08)]" 
    : asButton 
      ? baseCls + "bg-[#161616] border-white/5 hover:border-white/20 cursor-pointer text-gray-200 hover:text-white" 
      : baseCls + "bg-[#161616] border-white/5 text-gray-200";

  const Content = (
    <>
      {active && <motion.div layoutId="activeIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#3a86ff]" />}
      {children}
    </>
  );

  if (asButton) {
    return (
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="button" className={cls} onClick={onClick}>
        {Content}
      </motion.button>
    );
  }
  return <motion.article layout className={cls}>{Content}</motion.article>;
}

function WalletCard({ wallet, onTopUp }) {
  return (
    <section className="bg-gradient-to-br from-[#ff7a00] to-[#ffb347] text-white rounded-2xl p-6 shadow-[0_8px_28px_rgba(255,122,0,0.28)] flex flex-col gap-3">
      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit">Wallet</span>
      <h2 className="text-4xl font-extrabold">{wallet ? formatCurrency(wallet.balance) : "Loading..."}</h2>
      <p className="text-white/90 text-sm">Mock balance for top-ups, bookings, and host earnings.</p>
      <button type="button" className="mt-2 bg-white text-[#ff7a00] font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors self-start shadow-xl active:scale-95" onClick={onTopUp}>
        + Add Rs.500 demo balance
      </button>
    </section>
  );
}

function ParkingLoadingScreen({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      className="fixed inset-0 z-[120] overflow-hidden bg-[#05070b]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(58,134,255,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,122,0,0.16),transparent_30%)]" />
      <div className="absolute inset-0 asphalt-noise opacity-70" />
      <div className="absolute inset-0 parking-grid opacity-30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#ffb86b]"
        >
          <Car size={14} />
          Smart Parking Boot
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl"
        >
          Routing drivers into smarter parking.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-4 max-w-xl text-sm text-gray-400 sm:text-base"
        >
          Loading the live parking grid, commuter verification flow, and host wallet controls.
        </motion.p>

        <div className="relative mt-14 h-44 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-x-6 top-6 bottom-6 flex items-center justify-between gap-3">
            {[0, 1, 2, 3].map((lane) => (
              <div key={lane} className="relative flex h-full flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-white/12">
                <div className="absolute inset-y-3 left-3 right-3 rounded-[1.25rem] border border-white/6" />
                <motion.div
                  animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.98, 1.04, 0.98] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: lane * 0.18 }}
                  className={`h-16 w-10 rounded-2xl ${
                    lane === 1
                      ? "bg-[#3a86ff]/35 shadow-[0_0_30px_rgba(58,134,255,0.22)]"
                      : lane === 2
                        ? "bg-[#ff7a00]/35 shadow-[0_0_30px_rgba(255,122,0,0.22)]"
                        : "bg-white/[0.08]"
                  }`}
                />
              </div>
            ))}
          </div>

          <motion.div
            initial={{ x: "-18%" }}
            animate={{ x: "118%" }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-7 left-0"
          >
            <div className="relative flex h-16 w-28 items-center justify-center rounded-[1.6rem] border border-white/10 bg-gradient-to-r from-[#111827] to-[#1f2937] shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
              <Car size={28} className="text-[#ffb347]" />
              <div className="absolute -bottom-3 left-4 h-4 w-4 rounded-full bg-black" />
              <div className="absolute -bottom-3 right-4 h-4 w-4 rounded-full bg-black" />
            </div>
          </motion.div>

          <motion.div
            animate={{ x: ["-5%", "102%"] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl"
          />
        </div>

        <div className="mt-10 w-full max-w-md">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            <span>Parking grid sync</span>
            <span>Starting</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#ff7a00] via-[#ffb347] to-[#3a86ff]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LandingFeatureCard({ title, description, tone }) {
  const toneClasses = tone === "orange"
    ? "from-[#ff7a00]/18 to-[#ffb347]/6 border-[#ff7a00]/20"
    : tone === "amber"
      ? "from-[#ffb347]/18 to-white/0 border-[#ffb347]/20"
      : "from-[#3a86ff]/18 to-[#4facfe]/6 border-[#3a86ff]/20";

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className={`rounded-[1.8rem] border bg-gradient-to-br ${toneClasses} p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl`}
    >
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
    </motion.article>
  );
}

function LandingSectionHeader({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-gray-400 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-2 w-2 rounded-full bg-[#ff7a00]" />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className={`mt-4 text-sm leading-7 text-gray-400 sm:text-base ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{description}</p>
    </div>
  );
}

function MarketingFeatureTile({ icon: Icon, title, description, tone, index }) {
  const accentCls = tone === "orange"
    ? "from-[#ff7a00]/20 to-[#ffb347]/5 border-[#ff7a00]/20 text-[#ffbe73]"
    : tone === "amber"
      ? "from-[#ffb347]/18 to-white/0 border-[#ffcf8a]/15 text-[#ffd27d]"
      : "from-[#3a86ff]/18 to-[#4facfe]/5 border-[#3a86ff]/20 text-[#97c3ff]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group rounded-[1.7rem] border border-white/10 bg-[#0b1219]/88 p-6 shadow-[0_26px_55px_rgba(0,0,0,0.22)] transition-all hover:border-white/15"
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${accentCls}`}>
        <Icon size={22} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors group-hover:text-white/80">
        Explore workflow
        <ArrowRight size={14} />
      </div>
    </motion.article>
  );
}

function DashboardPreviewCard({ title, eyebrow, accent, content, index }) {
  const accentBar = accent === "orange"
    ? "from-[#ff7a00] to-[#ffb347]"
    : accent === "amber"
      ? "from-[#ffb347] to-[#ffd27d]"
      : "from-[#3a86ff] to-[#4facfe]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0b1219]/88 p-5 shadow-[0_26px_65px_rgba(0,0,0,0.24)]"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar}`} />
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{eyebrow}</div>
      <h3 className="mt-3 text-xl font-black text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {content.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-gray-400">{item.label}</span>
            <span className="text-sm font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function GifShowcaseCard({ title, description, accent, type, index }) {
  const accentCls = accent === "orange"
    ? "from-[#ff7a00]/25 to-[#ffb347]/8 border-[#ff7a00]/20"
    : accent === "amber"
      ? "from-[#ffb347]/22 to-white/0 border-[#ffd27d]/16"
      : "from-[#3a86ff]/22 to-[#4facfe]/8 border-[#3a86ff]/20";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, delay: index * 0.08 }}
      className={`overflow-hidden rounded-[1.9rem] border bg-gradient-to-br ${accentCls} p-5 shadow-[0_26px_60px_rgba(0,0,0,0.24)]`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">Animated scene</div>
      <h3 className="mt-3 text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>

      <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#09121a]/90 p-4">
        {type === "search" && (
          <div className="gif-stage">
            <div className="gif-radar-ring gif-radar-ring-1" />
            <div className="gif-radar-ring gif-radar-ring-2" />
            <div className="gif-radar-ring gif-radar-ring-3" />
            <div className="gif-radar-sweep" />
            <div className="gif-center-dot" />
            <div className="gif-spot gif-spot-1">P</div>
            <div className="gif-spot gif-spot-2">P</div>
            <div className="gif-spot gif-spot-3">P</div>
          </div>
        )}

        {type === "drive" && (
          <div className="gif-stage">
            <div className="gif-road" />
            <div className="gif-lane lane-1" />
            <div className="gif-lane lane-2" />
            <div className="gif-route-glow" />
            <div className="gif-pin">P</div>
            <div className="gif-car">
              <Car size={22} />
            </div>
          </div>
        )}

        {type === "verify" && (
          <div className="gif-stage">
            <div className="gif-license-card">
              <div className="gif-license-top" />
              <div className="gif-license-line short" />
              <div className="gif-license-line" />
              <div className="gif-license-line" />
              <div className="gif-license-badge" />
            </div>
            <div className="gif-scan-line" />
            <div className="gif-verify-badge">
              <BadgeCheck size={18} />
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function SettingsPage({ session, onSessionChange, onLogout, isDark, toggleDark }) {
  const [form, setForm] = useState({
    fullName: session.user.fullName || "",
    email: session.user.email || "",
    phone: session.user.phone || ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    licenseNumber: "",
    frontDocument: null,
    backDocument: null
  });

  const saveSettings = async (e) => {
    e.preventDefault();
    setBusy(true); setError(""); setStatus("");
    try {
      const updatedUser = await apiRequest(`/users/${session.user.id}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
      onSessionChange({ ...session, user: updatedUser });
      setStatus("Profile updated successfully.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const submitVerification = async (e) => {
    e.preventDefault();
    setSubmittingVerification(true); setError(""); setStatus("");
    try {
      const formData = new FormData();
      formData.append("licenseNumber", verificationForm.licenseNumber);
      if (verificationForm.frontDocument) formData.append("frontDocument", verificationForm.frontDocument);
      if (verificationForm.backDocument) formData.append("backDocument", verificationForm.backDocument);
      const updatedUser = await apiRequest(`/users/${session.user.id}/license-verification`, {
        method: "POST",
        headers: {},
        body: formData
      });
      onSessionChange({ ...session, user: updatedUser });
      setVerificationForm({ licenseNumber: "", frontDocument: null, backDocument: null });
      setStatus("Driving license submitted. Verification is now pending review.");
    } catch (err) { setError(err.message); }
    finally { setSubmittingVerification(false); }
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#3a86ff] focus:ring-1 focus:ring-[#3a86ff] transition-all";

  return (
    <div className="w-full max-w-3xl mx-auto p-5 pb-28 sm:p-8 md:pb-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Update your profile details</p>
      </div>
      <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6">
        {status && <p className="text-[#3a86ff] font-bold mb-4">{status}</p>}
        {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="bg-white/5 text-gray-200 border border-white/10 px-3 py-1 rounded-full text-xs font-bold">{getUserRoleLabel(session.user)}</span>
          {getVerificationLabel(session.user) && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isVerifiedCommuter(session.user) ? "bg-[#3a86ff]/10 text-[#3a86ff] border-[#3a86ff]/20" : "bg-[#ff7a00]/10 text-[#ffb347] border-[#ff7a00]/20"}`}>
              {getVerificationLabel(session.user)}
            </span>
          )}
        </div>
        <form className="flex flex-col gap-5" onSubmit={saveSettings}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Full name
            <input className={inputCls} value={form.fullName} onChange={e => setForm(c => ({...c, fullName: e.target.value}))} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
            <input className={inputCls} type="email" value={form.email} onChange={e => setForm(c => ({...c, email: e.target.value}))} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Phone
            <input className={inputCls} value={form.phone} onChange={e => setForm(c => ({...c, phone: e.target.value}))} />
          </label>
          <button type="submit" className="mt-2 bg-gradient-to-r from-[#3a86ff] to-[#4facfe] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50" disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </form>
        {session.user.role === "COMMUTER" && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
            <strong className="text-white block">Driving license verification</strong>
            <p className="text-sm text-gray-400 mt-2 mb-4">
                Submit your Indian driving license to unlock the verified commuter discount after review.
            </p>
            {session.user.verificationStatus === "PENDING" ? (
              <div className="rounded-xl border border-[#ffb347]/20 bg-[#ff7a00]/10 px-4 py-3 text-sm font-medium text-[#ffcf8a]">
                Your documents are under review. The verified commuter discount will activate after approval.
              </div>
            ) : isVerifiedCommuter(session.user) ? (
              <div className="rounded-xl border border-[#3a86ff]/20 bg-[#3a86ff]/10 px-4 py-3 text-sm font-medium text-[#89b9ff]">
                Verification approved. Your bookings now get 5% off while a reduced platform margin still applies.
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={submitVerification}>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Driving license number
                  <input className={inputCls} value={verificationForm.licenseNumber} onChange={e => setVerificationForm(c => ({ ...c, licenseNumber: e.target.value }))} placeholder="e.g. MH1420110012345" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Front document
                  <input className={inputCls} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => setVerificationForm(c => ({ ...c, frontDocument: e.target.files?.[0] || null }))} />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Back document (optional)
                  <input className={inputCls} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => setVerificationForm(c => ({ ...c, backDocument: e.target.files?.[0] || null }))} />
                </label>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#ff7a00] to-[#ffb347] text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={submittingVerification}
                >
                  {submittingVerification ? "Submitting..." : "Submit for verification"}
                </button>
              </form>
            )}
          </div>
        )}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
          <strong className="text-white block">App controls</strong>
          <p className="text-sm text-gray-400 mt-2 mb-4">
            Keep quick account actions here so the mobile navigation can stay focused on core pages.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-200 transition-all hover:bg-white/10"
              onClick={toggleDark}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-all hover:bg-red-500/15"
              onClick={onLogout}
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppNav({ role, page, setPage, user, wallet, onLogout, isDark, toggleDark }) {
  const hostItems = [
    { key: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { key: "register",  icon: <PlusCircle size={20} />, label: "Register Spot" },
    { key: "spots",     icon: <LayoutList size={20} />, label: "My Spots" },
    { key: "earnings",  icon: <Banknote size={20} />, label: "Earnings" },
    { key: "settings",  icon: <Settings size={20} />, label: "Settings" }
  ];
  const guestItems = [
    { key: "map",     icon: <MapIcon size={20} />, label: "Find Parking" },
    { key: "history", icon: <History size={20} />, label: "My Bookings" },
    { key: "wallet",  icon: <Wallet size={20} />, label: "Wallet" },
    { key: "settings",  icon: <Settings size={20} />, label: "Settings" }
  ];
  const items = role === "HOST" ? hostItems : guestItems;

  return (
    <nav className="app-nav w-full md:w-[260px] shrink-0 bg-[#0f0f0f]/95 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/10 flex md:flex-col p-3 md:p-5 h-[76px] md:h-screen fixed md:relative bottom-0 z-50 overflow-x-auto md:overflow-visible">
      <div className="hidden md:block pb-6 mb-4 border-b border-white/10">
        <div className="mb-4 flex items-center gap-3">
          <img src="/applogo.png" alt="ShareSpace logo" className="h-10 w-10 object-contain" />
          <div className="brand-pill bg-[#ff7a00]/10 text-[#ff7a00] text-xs font-bold px-3 py-1 rounded-full w-fit">ShareSpace</div>
        </div>
        <p className="user-name text-white font-bold tracking-tight">{user.fullName}</p>
        <p className="user-meta text-gray-400 text-xs font-semibold mt-1">{getUserRoleLabel(user)}{getVerificationLabel(user) ? ` · ${getVerificationLabel(user)}` : ""}</p>
        <p className="wallet-meta text-[#3a86ff] text-sm font-semibold mt-1">{wallet ? formatCurrency(wallet.balance) : "—"}</p>
      </div>
      <ul className="flex flex-row md:flex-col gap-1.5 md:gap-2 flex-1 items-center md:items-stretch overflow-x-auto md:overflow-visible my-0 md:my-2 px-2 md:px-0 scrollbar-none">
        {items.map((item) => {
          const isActive = page === item.key;
          return (
            <li key={item.key} className="flex-shrink-0">
              <button
                type="button"
                className={`nav-item flex items-center flex-col md:flex-row gap-1 md:gap-3 w-[72px] md:w-full p-2 md:px-4 md:py-3 rounded-xl transition-all font-semibold text-[10px] md:text-sm
                  ${isActive 
                    ? "active bg-[#3a86ff]/10 text-[#3a86ff] shadow-inner border border-[#3a86ff]/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"}`}
                onClick={() => setPage(item.key)}
              >
                <span className="mb-0.5 md:mb-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─── Landmark editor (host) ─── */
function LandmarkEditor({ landmarks, onChange }) {
  const add = () =>
    onChange([...landmarks, { stepNumber: landmarks.length + 1, description: "", latitude: "", longitude: "", showPin: false }]);

  const update = (i, field, value) =>
    onChange(landmarks.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const remove = (i) =>
    onChange(landmarks.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, stepNumber: idx + 1 })));

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-2 px-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#ff7a00] transition-all";

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#ff7a00]/5 border border-[#ff7a00]/20">
      <div>
        <strong className="text-[#ff7a00] font-bold text-lg flex items-center gap-2"><MapPin size={18}/> Navigation Guide <span className="text-sm font-normal text-gray-500">(optional)</span></strong>
        <p className="text-gray-400 text-sm mt-1">Add step-by-step directions — shown live as commuters approach each waypoint.</p>
      </div>
      <div className="flex flex-col gap-3">
      {landmarks.map((lm, i) => (
        <motion.div layout key={i} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex flex-col gap-3 p-4 rounded-xl bg-[#121212]/90 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="bg-[#ff7a00] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-md shadow-[#ff7a00]/30">{lm.stepNumber}</span>
            <button type="button" className="text-red-400 hover:bg-red-400/10 p-1 rounded-md transition-colors" onClick={() => remove(i)} title="Remove">✕</button>
          </div>
          <textarea
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 resize-y focus:outline-none focus:border-[#ff7a00] transition-all"
            placeholder={`e.g. "Take the third lane left after the petrol pump"`}
            value={lm.description}
            onChange={(e) => update(i, "description", e.target.value)}
            rows={2}
          />
          <button type="button" className="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg py-1.5 px-3 self-start hover:bg-white/5 transition-all w-fit"
            onClick={() => update(i, "showPin", !lm.showPin)}>
            {lm.showPin ? "▲ Hide pin coordinates" : "📍 Add optional map pin"}
          </button>
          {lm.showPin && (
            <div className="flex flex-row gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400 flex-1">Latitude
                <input type="number" className={inputCls} value={lm.latitude} onChange={(e) => update(i, "latitude", e.target.value)} placeholder="e.g. 28.6139" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400 flex-1">Longitude
                <input type="number" className={inputCls} value={lm.longitude} onChange={(e) => update(i, "longitude", e.target.value)} placeholder="e.g. 77.2090" />
              </label>
            </div>
          )}
        </motion.div>
      ))}
      </div>
      <button type="button" className="bg-[#ff7a00]/20 hover:bg-[#ff7a00]/30 text-[#ff7a00] border border-[#ff7a00]/30 rounded-xl py-2.5 text-sm w-full font-bold transition-colors active:scale-95" onClick={add}>
        + Add navigation step
      </button>
    </div>
  );
}

function LandmarkGuide({ landmarks, onFocusPoint }) {
  if (!landmarks || landmarks.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 mt-4 bg-[#ff7a00]/5 border border-[#ff7a00]/20 rounded-2xl p-5 mb-4">
      <strong className="text-[#ff7a00] font-bold flex items-center gap-2"><MapPin size={18}/> Guide to spot</strong>
      <div className="flex flex-col gap-3">
        {landmarks.map((lm) => (
          <div key={lm.id ?? lm.stepNumber} className="flex gap-3 bg-[#121212]/80 border border-white/5 rounded-xl p-3 shadow-inner">
            <span className="bg-[#ff7a00] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-md shadow-[#ff7a00]/30 shrink-0">{lm.stepNumber}</span>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-gray-300 leading-snug">{lm.description}</p>
              {lm.latitude && lm.longitude ? (
                <button type="button" className="text-xs text-[#3a86ff] border border-[#3a86ff]/20 bg-[#3a86ff]/10 hover:bg-[#3a86ff]/20 rounded-md py-1 px-3 self-start transition-colors font-semibold shadow-sm flex items-center gap-1"
                  onClick={() => onFocusPoint({ lat: lm.latitude, lng: lm.longitude })}>
                  <Navigation2 size={12}/> View pin
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Live proximity alert toast ─── */
function LandmarkAlert({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div className="alert-stack">
      {alerts.map((alert) => (
        <div key={alert.id} className="landmark-alert">
          <div className="alert-header">
            <span className="step-badge">{alert.stepNumber}</span>
            <strong>You're at a navigation point!</strong>
            <button type="button" className="alert-dismiss" onClick={() => onDismiss(alert.id)}>×</button>
          </div>
          <p className="alert-message">{alert.description}</p>
          <div className="alert-countdown" style={{ "--duration": `${alert.duration}ms` }} />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   AUTH SCREEN
══════════════════════════════════════════════ */
function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (path, payload) => {
    setBusy(true); setError("");
    try { onAuthenticated(await apiRequest(path, { method: "POST", body: JSON.stringify(payload) })); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const inputCls = "w-full rounded-2xl border border-white/10 bg-[#0f1720]/88 px-4 py-3.5 text-sm font-medium text-white placeholder-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all focus:border-[#3a86ff] focus:outline-none focus:ring-1 focus:ring-[#3a86ff]";

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#22252a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,164,76,0.12),transparent_24%),linear-gradient(180deg,#2b2f34_0%,#1e2126_48%,#17191d_100%)]" />
      <div className="absolute inset-0 parking-grid opacity-[0.08]" />
      <div className="absolute inset-0 asphalt-noise opacity-60" />
      <div className="absolute inset-0 parking-signs opacity-40" />
      <div className="pointer-events-none absolute -top-20 left-[12%] h-72 w-72 rounded-full bg-white/6 blur-[110px]" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] h-72 w-72 rounded-full bg-[#ff7a00]/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex items-start justify-start"
        >
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(255,122,0,0.18)]">
              <img src="/applogo.png" alt="ShareSpace logo" className="h-10 w-10 object-cover" />
            </div>
            <div>
              <strong className="block text-sm font-black uppercase tracking-[0.22em] text-white">ShareSpace</strong>
              <span className="text-xs text-gray-400">Parking marketplace for India</span>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-2xl sm:px-8 lg:px-10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff7a00]/20 bg-[#ff7a00]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#ffb86b]">
                <Navigation2 size={14} />
                Urban Mobility | Smart Parking
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find better parking, unlock commuter perks, and run host operations from one premium grid.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                Inspired by the `frontendidea1` concept, this ShareSpace front door now feels more cinematic and product-led while still connecting directly into your real login, booking, wallet, and host workflows.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ffb347] px-6 py-4 text-sm font-black text-[#081019] shadow-[0_18px_45px_rgba(255,122,0,0.3)] transition-transform hover:-translate-y-0.5"
                >
                  Create account
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.07]"
                >
                  Sign in to continue
                </button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {marketingStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + index * 0.08 }}
                    className="rounded-[1.4rem] border border-white/10 bg-[#09131c]/75 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.2)]"
                  >
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071018]/90 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(58,134,255,0.12),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(255,122,0,0.1),transparent_22%)]" />
                <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-white/8 bg-[#0a141d]/80 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <strong className="text-base font-bold text-white">Live parking overview</strong>
                      <span className="rounded-full bg-[#3a86ff]/10 px-3 py-1 text-xs font-semibold text-[#8eb7ff]">Realtime discovery</span>
                    </div>
                    <div className="relative h-64 overflow-hidden rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent),#101820]">
                      <div className="absolute inset-0 parking-grid opacity-25" />
                      {floatingHeroCards.map((card, index) => (
                        <motion.div
                          key={card.label}
                          initial={{ opacity: 0, scale: 0.86, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.45 + index * 0.1 }}
                          className={`absolute hidden rounded-2xl border border-white/10 bg-[#0b1218]/80 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex ${card.position}`}
                        >
                          <card.icon size={16} className={card.tone === "orange" ? "text-[#ffb347]" : card.tone === "amber" ? "text-[#ffd27d]" : "text-[#89b9ff]"} />
                          <span className="ml-2">{card.label}</span>
                        </motion.div>
                      ))}
                      {[
                        { left: "18%", top: "32%", active: true },
                        { left: "34%", top: "62%", active: true },
                        { left: "53%", top: "28%", active: false },
                        { left: "76%", top: "55%", active: true },
                        { left: "61%", top: "72%", active: true }
                      ].map((spot, index) => (
                        <motion.div
                          key={`${spot.left}-${spot.top}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.6 + index * 0.08 }}
                          className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${spot.active ? "bg-[#ff7a00]" : "bg-white/25"}`}
                          style={{ left: spot.left, top: spot.top }}
                        >
                          {spot.active && (
                            <motion.div
                              animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 2.1, repeat: Infinity, delay: index * 0.18 }}
                              className="absolute inset-0 rounded-full bg-[#ff7a00]"
                            />
                          )}
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.95 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#3a86ff] shadow-[0_0_40px_rgba(58,134,255,0.35)]">
                          <div className="h-4 w-4 rounded-full bg-white" />
                          <motion.div
                            animate={{ scale: [1, 2.1, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border border-[#3a86ff]"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {landingHighlights.map((item) => (
                      <LandingFeatureCard key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-[#0b1219]/88 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-3xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.26em] text-gray-500">Access ShareSpace</div>
                <h2 className="mt-2 text-3xl font-black text-white">{mode === "login" ? "Welcome back" : "Create your parking profile"}</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-gray-400">
                {mode === "login" ? "Secure sign in" : "Tourist, commuter, host"}
              </div>
            </div>

            <div className="mb-8 flex rounded-2xl border border-white/8 bg-[#0f1720]/85 p-1.5">
              <button type="button" className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${mode === "login" ? "bg-[#3a86ff] text-white shadow-[0_10px_26px_rgba(58,134,255,0.28)]" : "text-gray-400 hover:text-white"}`} onClick={() => setMode("login")}>Login</button>
              <button type="button" className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${mode === "register" ? "bg-[#ff7a00] text-white shadow-[0_10px_26px_rgba(255,122,0,0.28)]" : "text-gray-400 hover:text-white"}`} onClick={() => setMode("register")}>Register</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
                {mode === "login" ? (
                  <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit("/auth/login", loginForm); }}>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
                      <input className={inputCls} value={loginForm.email} onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))} placeholder="Enter your email" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Password
                      <input className={inputCls} type="password" value={loginForm.password} onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))} placeholder="Enter your password" />
                    </label>
                    {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}
                    <button type="submit" className="mt-3 rounded-2xl bg-gradient-to-r from-[#3a86ff] to-[#4facfe] px-6 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(58,134,255,0.26)] transition-transform hover:-translate-y-0.5 disabled:opacity-60" disabled={busy}>
                      {busy ? "Signing in..." : "Sign in to dashboard"}
                    </button>
                  </form>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit("/auth/register", registerForm); }}>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Full name
                      <input className={inputCls} value={registerForm.fullName} onChange={(e) => setRegisterForm((c) => ({ ...c, fullName: e.target.value }))} placeholder="Your full name" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
                      <input className={inputCls} value={registerForm.email} onChange={(e) => setRegisterForm((c) => ({ ...c, email: e.target.value }))} placeholder="your@email.com" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Phone
                        <input className={inputCls} value={registerForm.phone} onChange={(e) => setRegisterForm((c) => ({ ...c, phone: e.target.value }))} placeholder="+91..." />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Role
                        <select className={`${inputCls} appearance-none`} value={registerForm.role} onChange={(e) => setRegisterForm((c) => ({ ...c, role: e.target.value }))}>
                          <option value="TOURIST" className="bg-[#101822]">Tourist</option>
                          <option value="COMMUTER" className="bg-[#101822]">Commuter</option>
                          <option value="HOST" className="bg-[#101822]">Host</option>
                        </select>
                      </label>
                    </div>
                    {registerForm.role !== "HOST" && (
                      <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-medium leading-6 text-gray-400">
                        Tourists can start booking instantly. Commuters can submit their driving license later in Settings to unlock the verified commuter discount.
                      </p>
                    )}
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Password
                      <input className={inputCls} type="password" value={registerForm.password} onChange={(e) => setRegisterForm((c) => ({ ...c, password: e.target.value }))} placeholder="Choose a password" />
                    </label>
                    {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}
                    <button type="submit" className="mt-3 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ffb347] px-6 py-4 text-sm font-black text-[#081019] shadow-[0_18px_42px_rgba(255,122,0,0.28)] transition-transform hover:-translate-y-0.5 disabled:opacity-60" disabled={busy}>
                      {busy ? "Creating..." : "Create account"}
                    </button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 grid gap-3">
              {landingSteps.map((step, index) => (
                <motion.div
                  key={step.role}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 + index * 0.06 }}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="text-sm font-bold text-white">{step.role}</div>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <section className="mt-20">
          <LandingSectionHeader
            eyebrow="Feature stack"
            title="Everything people need to move from search to parking"
            description="The `frontendidea1` design language is now carried into a fuller product story: discovery, hosting, verification, wallet flow, and booking history all have a visible place on the homepage."
            align="center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {marketingFeatures.map((feature, index) => (
              <MarketingFeatureTile key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </section>

        <section className="mt-24">
          <LandingSectionHeader
            eyebrow="GIF-style motion"
            title="Parking-themed animated moments that make the homepage feel alive"
            description="These looping scenes act like lightweight built-in GIFs, but stay native to the app so they match the theme and don’t rely on external media files."
            align="center"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {gifShowcaseCards.map((card, index) => (
              <GifShowcaseCard key={card.title} index={index} {...card} />
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-white/10 bg-[#0b1219]/88 p-7 shadow-[0_28px_70px_rgba(0,0,0,0.24)]"
          >
            <LandingSectionHeader
              eyebrow="Verified commuter"
              title="A premium commuter path without forcing tourists through verification"
              description="Tourists can keep booking immediately. Commuters get a dedicated verification lane in Settings, and once approved they unlock the permanent 5% discount."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#3a86ff]/15 bg-[#3a86ff]/10 p-5">
                <div className="flex items-center gap-3 text-[#93c0ff]">
                  <BadgeCheck size={18} />
                  <strong className="text-sm uppercase tracking-[0.18em]">Verified commuter</strong>
                </div>
                <p className="mt-4 text-3xl font-black text-white">5% off</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">Discount automatically appears in the booking breakdown after approval.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#ff7a00]/15 bg-[#ff7a00]/10 p-5">
                <div className="flex items-center gap-3 text-[#ffcf8a]">
                  <Clock3 size={18} />
                  <strong className="text-sm uppercase tracking-[0.18em]">Review flow</strong>
                </div>
                <p className="mt-4 text-3xl font-black text-white">Settings-first</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">The commuter submits driving-license documents from the profile area instead of a fake one-click badge.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081019]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.26)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(58,134,255,0.12),transparent_28%),radial-gradient(circle_at_86%_72%,rgba(255,122,0,0.12),transparent_24%)]" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-400">
                <CreditCard size={14} />
                Product preview
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardPreviewCards.map((card, index) => (
                  <DashboardPreviewCard key={card.title} index={index} {...card} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {trustMoments.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
            >
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Trust signal {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{item.copy}</p>
            </motion.article>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative mt-24 overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(58,134,255,0.14),rgba(255,122,0,0.12))] px-6 py-10 shadow-[0_32px_90px_rgba(0,0,0,0.28)] sm:px-10"
        >
          <div className="absolute inset-0 parking-grid opacity-[0.08]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                <Car size={14} />
                Ready to launch
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">Step into ShareSpace with a homepage that feels alive, premium, and product-driven.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                Use the cinematic landing flow to pull in tourists, commuters, and hosts, then move them directly into the same real app they already use.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setMode("register")}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#081019] transition-transform hover:-translate-y-0.5"
              >
                Start with registration
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-4 text-sm font-bold text-white"
              >
                Back to hero
              </button>
            </div>
          </div>
        </motion.section>

        <footer className="mt-16 border-t border-white/10 pb-8 pt-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a00] to-[#ffb347] text-[#081019] shadow-[0_12px_30px_rgba(255,122,0,0.28)]">
                  <Car size={20} />
                </div>
                <div>
                  <strong className="block text-sm font-black uppercase tracking-[0.22em] text-white">ShareSpace</strong>
                  <span className="text-xs text-gray-500">Smart parking marketplace</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                A richer homepage inspired by `frontendidea1`, now merged into the working ShareSpace app without losing live auth, wallet, booking, and host flows.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <div className="text-sm font-bold text-white">Product</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Find Parking</div>
                  <div>Host a Spot</div>
                  <div>Commuter Verification</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Experience</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Wallet Payments</div>
                  <div>Booking History</div>
                  <div>Map Guidance</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Audience</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Tourists</div>
                  <div>Commuters</div>
                  <div>Hosts</div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOST DASHBOARD
══════════════════════════════════════════════ */
function HostDashboard({ session, onSessionChange, onLogout, isLoaded, loadError, isDark, toggleDark }) {
  const [wallet, setWallet] = useState(session.wallet);
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState("dashboard");
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
      onSessionChange({ ...session, wallet: w });
    } catch (e) { setError(e.message); }
  }, [session.user.id]);

  useEffect(() => { refresh(); }, []);

  const topUp = async () => {
    try {
      const w = await apiRequest(`/wallets/${session.user.id}/top-up`, { method: "POST", body: JSON.stringify({ amount: 500 }) });
      setWallet(w); onSessionChange({ ...session, wallet: w }); setStatus("Wallet topped up.");
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
      setPage("spots");
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
    <div className="host-shell flex min-h-screen md:h-screen w-full relative bg-[#1a1c20] text-zinc-100 font-sans overflow-hidden selection:bg-[#3a86ff]/30 selection:text-[#3a86ff]">
      <AppNav role="HOST" page={page} setPage={setPage} user={session.user} wallet={wallet} onLogout={onLogout} isDark={isDark} toggleDark={toggleDark} />
      <main className="host-main flex-1 relative z-10 w-full overflow-y-auto bg-[linear-gradient(180deg,#2a2d31_0%,#1f2226_44%,#17191d_100%)] pb-[92px] md:pb-0">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 parking-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute inset-0 asphalt-noise opacity-60" />
        <div className="pointer-events-none absolute inset-0 parking-signs opacity-34" />
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#ff7a00]/6 blur-[140px]" />

        {page === "settings" && <SettingsPage session={session} onSessionChange={onSessionChange} onLogout={onLogout} isDark={isDark} toggleDark={toggleDark} />}

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
                  <button type="button" className="mt-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 px-6 rounded-xl transition-all" onClick={geocodeAddress} disabled={!isLoaded || geocoding}>
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
              {loadError ? <div className="flex items-center justify-center w-full h-full text-red-500 font-bold bg-[#111]">Google Maps failed to load.</div> : isLoaded ? (
                <GoogleMap
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
                  {spots.map((s) => <MarkerF key={s.id} position={{ lat: s.latitude, lng: s.longitude }} label="P" />)}
                  {selectedPoint && <MarkerF position={selectedPoint} label="N" />}
                  {form.landmarks.filter((l) => l.latitude && l.longitude).map((l, i) => (
                    <MarkerF key={`lm-${i}`} position={{ lat: Number(l.latitude), lng: Number(l.longitude) }} label={String(l.stepNumber)} />
                  ))}
                </GoogleMap>
              ) : <div className="flex items-center justify-center w-full h-full text-white bg-[#111] animate-pulse">Loading Map...</div>}
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

      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CUSTOMER DASHBOARD
══════════════════════════════════════════════ */
function CustomerDashboard({ session, onSessionChange, onLogout, isLoaded, loadError, isDark, toggleDark }) {
  const [wallet, setWallet] = useState(session.wallet);
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState("map");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
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
  /* proximity alerts */
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
      const [w, s, b] = await Promise.all([
        apiRequest(`/wallets/${session.user.id}`),
        apiRequest(query),
        apiRequest(`/bookings/guest/${session.user.id}`)
      ]);
      setWallet(w); setSpots(s); setBookings(b);
      onSessionChange({ ...session, wallet: w });
      setSelectedSpot(s.length ? s[0] : null);
      if (destination) setStatus(s.length ? `Found ${s.length} spot(s) within ${searchRadiusKm} km.` : "No spots found nearby.");
    } catch (e) { setError(e.message); }
  }, [session.user.id, searchRadiusKm]);

  const requestLocation = () => {
    if (!navigator.geolocation) { setStatus("Geolocation unavailable."); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setCurrentLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setStatus("Location detected."); },
      () => setStatus("Location denied. Search still works without it."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); refresh(null); }, []);

  /* live location watch */
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setCurrentLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (destinationPoint) refresh(destinationPoint);
  }, [searchRadiusKm]);

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
  /* reset triggered set when spot changes */
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

  const topUp = async () => {
    try {
      const w = await apiRequest(`/wallets/${session.user.id}/top-up`, { method: "POST", body: JSON.stringify({ amount: 500 }) });
      setWallet(w); onSessionChange({ ...session, wallet: w }); setStatus("Wallet topped up.");
    } catch (e) { setError(e.message); }
  };

  const bookSpot = async () => {
    if (!selectedSpot) return;
    setBusy(true);
    try {
      const receipt = await apiRequest("/bookings", { method: "POST", body: JSON.stringify({ guestId: session.user.id, spotId: selectedSpot.id }) });
      setWallet(receipt.wallet);
      onSessionChange({ ...session, wallet: receipt.wallet });
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

  return (
    <div className="flex min-h-screen md:h-screen w-full relative bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden selection:bg-[#3a86ff]/30 selection:text-[#3a86ff]">
      <AppNav role={session.user.role} page={page} setPage={(p) => { setPage(p); setError(""); }} user={session.user} wallet={wallet} onLogout={onLogout} isDark={isDark} toggleDark={toggleDark} />
      
      {/* Map is background of everything on 'map' view */}
      {page === "map" && (
        <div className="absolute inset-0 z-0">
          {loadError ? <div className="flex items-center justify-center w-full h-full text-red-400">Google Maps failed to load.</div> : isLoaded ? (
            <GoogleMap center={mapCenter} zoom={selectedSpot || destinationPoint || currentLocation ? 14 : 5}
              mapContainerClassName="w-full h-full" options={mapOptions}>
              {currentLocation && <MarkerF position={currentLocation} label="Y" />}
              {destinationPoint && <MarkerF position={destinationPoint} label="D" />}
              {spots.map((s) => (
                <MarkerF key={s.id} position={{ lat: s.latitude, lng: s.longitude }}
                  label={selectedSpot?.id === s.id ? "P" : "S"} />
              ))}
              {directions && (
                <DirectionsRenderer directions={directions}
                  options={{ suppressMarkers: true, polylineOptions: { strokeColor: "#3a86ff", strokeWeight: 6 } }} />
              )}
              {selectedSpot?.landmarks?.filter((l) => l.latitude && l.longitude).map((l) => (
                <MarkerF key={`glm-${l.id ?? l.stepNumber}`}
                  position={{ lat: l.latitude, lng: l.longitude }} label={String(l.stepNumber)} />
              ))}
            </GoogleMap>
          ) : <div className="flex items-center justify-center w-full h-full text-white">Loading map…</div>}
        </div>
      )}

      {/* Foreground Content */}
      <main className={`flex-1 relative z-10 w-full pb-[92px] md:pb-0 ${page === "map" ? "pointer-events-none" : "overflow-y-auto"}`}>
        {page === "settings" && <SettingsPage session={session} onSessionChange={onSessionChange} onLogout={onLogout} isDark={isDark} toggleDark={toggleDark} />}

        {page === "map" && (
          <div className="pointer-events-auto absolute top-4 left-4 right-4 md:top-6 md:left-6 md:w-[420px] flex flex-col gap-4">
            
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

                <LandmarkGuide landmarks={selectedSpot.landmarks} onFocusPoint={(pt) => setLandmarkFocusPoint(pt)} />
              </motion.section>
            )}
            </AnimatePresence>
          </div>
        )}

        {page === "history" && (
          <div className="p-5 pb-28 sm:p-8 md:pb-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
            <p className="text-gray-400 mt-2 mb-8">{bookings.length} confirmed sessions</p>
            <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-3">
              {bookings.length ? bookings.map((b) => (
                <ListItem key={b.id}>
                  <div>
                    <strong className="text-white block font-semibold">{b.spotTitle}</strong>
                    <span className="text-sm text-gray-400 mt-0.5 block">Hosted by {b.hostName}</span>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Base {formatCurrency(b.baseAmount ?? b.totalAmount)} · Fee {formatCurrency(b.platformFeeAmount ?? 0)} · Discount {formatCurrency(b.discountAmount ?? 0)}
                    </span>
                  </div>
                  <div className="text-[#3a86ff] font-bold bg-[#3a86ff]/10 px-3 py-1.5 rounded-lg border border-[#3a86ff]/20">{formatCurrency(b.totalAmount)}</div>
                </ListItem>
              )) : <p className="text-center py-10 text-gray-500 font-medium font-sm">No bookings yet. Find and book a spot from the map.</p>}
            </div>
          </div>
        )}

        {page === "wallet" && (
          <div className="p-5 pb-28 sm:p-8 md:pb-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white">Wallet</h1>
            <p className="text-gray-400 mt-2 mb-8">Demo balance for mock payments</p>
            <WalletCard wallet={wallet} onTopUp={topUp} />
          </div>
        )}
      </main>

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
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
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
