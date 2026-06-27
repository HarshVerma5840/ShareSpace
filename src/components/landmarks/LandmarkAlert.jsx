import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function LandmarkAlert({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div className="alert-stack">
      {alerts.map((alert) => (
        <div key={alert.id} className="landmark-alert">
          <div className="alert-header">
            <span className="step-badge">{alert.stepNumber}</span>
            <strong>You're at a navigation point!</strong>
            <button type="button" className="alert-dismiss" onClick={() => onDismiss(alert.id)}>×</button>
          </div>
          <p className="alert-message">{alert.description}</p>
          <div className="alert-countdown" style={{ "--duration": `${alert.duration}ms` }} />
        </div>
      ))}
    </div>
  );
}

export default LandmarkAlert;
