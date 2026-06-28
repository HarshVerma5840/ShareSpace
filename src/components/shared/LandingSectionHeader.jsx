import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default LandingSectionHeader;
