import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, ShieldAlert, Wallet, Building2, Plane, BadgeCheck, History, ArrowRight } from "lucide-react";
import AuthScreen from "./Auth/AuthScreen";
import LandingSectionHeader from "../components/shared/LandingSectionHeader";
import GifShowcaseCard from "../components/shared/GifShowcaseCard";


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


export default LandingPage;
