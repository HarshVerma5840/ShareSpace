import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default WalletCard;
