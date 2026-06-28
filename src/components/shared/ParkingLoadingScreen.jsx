import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default ParkingLoadingScreen;
