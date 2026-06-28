import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function Badge({ children }) {
  return (
    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-gray-300">
      {children}
    </span>
  );
}

export default Badge;
