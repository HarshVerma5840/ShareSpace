import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default GifShowcaseCard;
