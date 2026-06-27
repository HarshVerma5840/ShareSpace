import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default ListItem;
