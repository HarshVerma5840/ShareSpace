import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function LandmarkEditor({ landmarks, onChange }) {
  const add = () =>
    onChange([...landmarks, { stepNumber: landmarks.length + 1, description: "", latitude: "", longitude: "", showPin: false }]);

  const update = (i, field, value) =>
    onChange(landmarks.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const remove = (i) =>
    onChange(landmarks.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, stepNumber: idx + 1 })));

  const inputCls = "w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-2 px-3 text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#ff7a00] transition-all";

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#ff7a00]/5 border border-[#ff7a00]/20">
      <div>
        <strong className="text-[#ff7a00] font-bold text-lg flex items-center gap-2"><MapPin size={18}/> Navigation Guide <span className="text-sm font-normal text-gray-500">(optional)</span></strong>
        <p className="text-gray-400 text-sm mt-1">Add step-by-step directions — shown live as commuters approach each waypoint.</p>
      </div>
      <div className="flex flex-col gap-3">
      {landmarks.map((lm, i) => (
        <motion.div layout key={i} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex flex-col gap-3 p-4 rounded-xl bg-[#121212]/90 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="bg-[#ff7a00] text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-md shadow-[#ff7a00]/30">{lm.stepNumber}</span>
            <button type="button" className="text-red-400 hover:bg-red-400/10 p-1 rounded-md transition-colors" onClick={() => remove(i)} title="Remove">✕</button>
          </div>
          <textarea
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 resize-y focus:outline-none focus:border-[#ff7a00] transition-all"
            placeholder={`e.g. "Take the third lane left after the petrol pump"`}
            value={lm.description}
            onChange={(e) => update(i, "description", e.target.value)}
            rows={2}
          />
          <button type="button" className="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg py-1.5 px-3 self-start hover:bg-white/5 transition-all w-fit"
            onClick={() => update(i, "showPin", !lm.showPin)}>
            {lm.showPin ? "▲ Hide pin coordinates" : "📍 Add optional map pin"}
          </button>
          {lm.showPin && (
            <div className="flex flex-row gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400 flex-1">Latitude
                <input type="number" className={inputCls} value={lm.latitude} onChange={(e) => update(i, "latitude", e.target.value)} placeholder="e.g. 28.6139" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-400 flex-1">Longitude
                <input type="number" className={inputCls} value={lm.longitude} onChange={(e) => update(i, "longitude", e.target.value)} placeholder="e.g. 77.2090" />
              </label>
            </div>
          )}
        </motion.div>
      ))}
      </div>
      <button type="button" className="bg-[#ff7a00]/20 hover:bg-[#ff7a00]/30 text-[#ff7a00] border border-[#ff7a00]/30 rounded-xl py-2.5 text-sm w-full font-bold transition-colors active:scale-95" onClick={add}>
        + Add navigation step
      </button>
    </div>
  );
}

export default LandmarkEditor;
