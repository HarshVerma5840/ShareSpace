import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function SmallAction({ children, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={`inline-flex min-h-[36px] items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
        danger
          ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          : "border-[#3a86ff]/20 bg-[#3a86ff]/10 text-[#8eb7ff] hover:bg-[#3a86ff]/15"
      }`}
    >
      {children}
    </button>
  );
}

export default SmallAction;
