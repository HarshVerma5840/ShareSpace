import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

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

export default React.memo(LandmarkGuide);
