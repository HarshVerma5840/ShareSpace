import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function AppNav() {
  const session = useAuthStore(s => s.session);
  const wallet = useDashboardStore(s => s.wallet);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const user = session?.user;
  const role = user?.role;
  const hostItems = [
    { key: "/host", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { key: "/host/register",  icon: <PlusCircle size={20} />, label: "Register Spot" },
    { key: "/host/spots",     icon: <LayoutList size={20} />, label: "My Spots" },
    { key: "/host/earnings",  icon: <Banknote size={20} />, label: "Earnings" },
    { key: "/settings",  icon: <Settings size={20} />, label: "Settings" }
  ];
  const guestItems = [
    { key: "/customer",     icon: <MapIcon size={20} />, label: "Find Parking" },
    { key: "/customer/history", icon: <History size={20} />, label: "My Bookings" },
    { key: "/customer/wallet",  icon: <Wallet size={20} />, label: "Wallet" },
    { key: "/settings",  icon: <Settings size={20} />, label: "Settings" }
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
          const isActive = currentPath === item.key;
          return (
            <li key={item.key} className="flex-shrink-0">
              <button
                type="button"
                className={`nav-item flex items-center flex-col md:flex-row gap-1 md:gap-3 w-[72px] md:w-full p-2 md:px-4 md:py-3 rounded-xl transition-all font-semibold text-[10px] md:text-sm
                  ${isActive 
                    ? "active bg-[#3a86ff]/10 text-[#3a86ff] shadow-inner border border-[#3a86ff]/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"}`}
                onClick={() => navigate(item.key)}
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

export default React.memo(AppNav);
