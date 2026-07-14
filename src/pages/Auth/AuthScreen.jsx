import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Navigation2, Search, MapPin, ShieldAlert, LogOut, Moon, Sun, Settings, History, Wallet, LayoutDashboard, PlusCircle, LayoutList, Banknote, ListPlus, Map as MapIcon, BadgeCheck, Users, FileCheck2, BarChart3, ParkingCircle, RefreshCw, Trash2, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useMapStore from "../../stores/mapStore";
import useDashboardStore from "../../stores/dashboardStore";
import { formatCurrency, formatCovered, getUserRoleLabel, getVerificationLabel, emptySpot, emptyLogin, emptyRegister, isVerifiedCommuter, getPlatformFeePreview, getVerifiedDiscountPreview } from "../../utils/helpers";
import { apiRequest, apiBaseUrl } from "../../utils/api";

function AuthScreen() {
  const onAuthenticated = useAuthStore((s) => s.authenticate);
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (path, payload) => {
    setBusy(true); setError("");
    try { onAuthenticated(await apiRequest(path, { method: "POST", body: JSON.stringify(payload) })); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const inputCls = "w-full rounded-2xl border border-white/10 bg-[#0f1720]/88 px-4 py-3.5 text-sm font-medium text-white placeholder-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all focus:border-[#3a86ff] focus:outline-none focus:ring-1 focus:ring-[#3a86ff]";

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#22252a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,164,76,0.12),transparent_24%),linear-gradient(180deg,#2b2f34_0%,#1e2126_48%,#17191d_100%)]" />
      <div className="absolute inset-0 parking-grid opacity-[0.08]" />
      <div className="absolute inset-0 asphalt-noise opacity-60" />
      <div className="absolute inset-0 parking-signs opacity-40" />
      <div className="pointer-events-none absolute -top-20 left-[12%] h-72 w-72 rounded-full bg-white/6 blur-[110px]" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] h-72 w-72 rounded-full bg-[#ff7a00]/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex items-start justify-start"
        >
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(255,122,0,0.18)]">
              <img src="/applogo.png" alt="ShareSpace logo" className="h-10 w-10 object-cover" />
            </div>
            <div>
              <strong className="block text-sm font-black uppercase tracking-[0.22em] text-white">ShareSpace</strong>
              <span className="text-xs text-gray-400">Parking marketplace for India</span>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-2xl sm:px-8 lg:px-10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff7a00]/20 bg-[#ff7a00]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#ffb86b]">
                <Navigation2 size={14} />
                Urban Mobility | Smart Parking
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find better parking, unlock commuter perks, and run host operations from one premium grid.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                Inspired by the `frontendidea1` concept, this ShareSpace front door now feels more cinematic and product-led while still connecting directly into your real login, booking, wallet, and host workflows.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ffb347] px-6 py-4 text-sm font-black text-[#081019] shadow-[0_18px_45px_rgba(255,122,0,0.3)] transition-transform hover:-translate-y-0.5"
                >
                  Create account
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.07]"
                >
                  Sign in to continue
                </button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {marketingStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + index * 0.08 }}
                    className="rounded-[1.4rem] border border-white/10 bg-[#09131c]/75 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.2)]"
                  >
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071018]/90 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(58,134,255,0.12),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(255,122,0,0.1),transparent_22%)]" />
                <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-white/8 bg-[#0a141d]/80 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <strong className="text-base font-bold text-white">Live parking overview</strong>
                      <span className="rounded-full bg-[#3a86ff]/10 px-3 py-1 text-xs font-semibold text-[#8eb7ff]">Realtime discovery</span>
                    </div>
                    <div className="relative h-64 overflow-hidden rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent),#101820]">
                      <div className="absolute inset-0 parking-grid opacity-25" />
                      {floatingHeroCards.map((card, index) => (
                        <motion.div
                          key={card.label}
                          initial={{ opacity: 0, scale: 0.86, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.45 + index * 0.1 }}
                          className={`absolute hidden rounded-2xl border border-white/10 bg-[#0b1218]/80 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex ${card.position}`}
                        >
                          <card.icon size={16} className={card.tone === "orange" ? "text-[#ffb347]" : card.tone === "amber" ? "text-[#ffd27d]" : "text-[#89b9ff]"} />
                          <span className="ml-2">{card.label}</span>
                        </motion.div>
                      ))}
                      {[
                        { left: "18%", top: "32%", active: true },
                        { left: "34%", top: "62%", active: true },
                        { left: "53%", top: "28%", active: false },
                        { left: "76%", top: "55%", active: true },
                        { left: "61%", top: "72%", active: true }
                      ].map((spot, index) => (
                        <motion.div
                          key={`${spot.left}-${spot.top}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.6 + index * 0.08 }}
                          className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${spot.active ? "bg-[#ff7a00]" : "bg-white/25"}`}
                          style={{ left: spot.left, top: spot.top }}
                        >
                          {spot.active && (
                            <motion.div
                              animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 2.1, repeat: Infinity, delay: index * 0.18 }}
                              className="absolute inset-0 rounded-full bg-[#ff7a00]"
                            />
                          )}
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.95 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#3a86ff] shadow-[0_0_40px_rgba(58,134,255,0.35)]">
                          <div className="h-4 w-4 rounded-full bg-white" />
                          <motion.div
                            animate={{ scale: [1, 2.1, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border border-[#3a86ff]"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {landingHighlights.map((item) => (
                      <LandingFeatureCard key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-[#0b1219]/88 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-3xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.26em] text-gray-500">Access ShareSpace</div>
                <h2 className="mt-2 text-3xl font-black text-white">{mode === "login" ? "Welcome back" : "Create your parking profile"}</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-gray-400">
                {mode === "login" ? "Secure sign in" : "Tourist, commuter, host"}
              </div>
            </div>

            <div className="mb-8 flex rounded-2xl border border-white/8 bg-[#0f1720]/85 p-1.5">
              <button type="button" className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${mode === "login" ? "bg-[#3a86ff] text-white shadow-[0_10px_26px_rgba(58,134,255,0.28)]" : "text-gray-400 hover:text-white"}`} onClick={() => setMode("login")}>Login</button>
              <button type="button" className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${mode === "register" ? "bg-[#ff7a00] text-white shadow-[0_10px_26px_rgba(255,122,0,0.28)]" : "text-gray-400 hover:text-white"}`} onClick={() => setMode("register")}>Register</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
                {mode === "login" ? (
                  <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit("/auth/login", loginForm); }}>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
                      <input className={inputCls} value={loginForm.email} onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))} placeholder="Enter your email" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Password
                      <input className={inputCls} type="password" value={loginForm.password} onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))} placeholder="Enter your password" />
                    </label>
                    {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}
                    <button type="submit" className="mt-3 rounded-2xl bg-gradient-to-r from-[#3a86ff] to-[#4facfe] px-6 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(58,134,255,0.26)] transition-transform hover:-translate-y-0.5 disabled:opacity-60" disabled={busy}>
                      {busy ? "Signing in..." : "Sign in to dashboard"}
                    </button>
                  </form>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit("/auth/register", registerForm); }}>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Full name
                      <input className={inputCls} value={registerForm.fullName} onChange={(e) => setRegisterForm((c) => ({ ...c, fullName: e.target.value }))} placeholder="Your full name" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Email
                      <input className={inputCls} value={registerForm.email} onChange={(e) => setRegisterForm((c) => ({ ...c, email: e.target.value }))} placeholder="your@email.com" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Phone
                        <input className={inputCls} value={registerForm.phone} onChange={(e) => setRegisterForm((c) => ({ ...c, phone: e.target.value }))} placeholder="+91..." />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Role
                        <select className={`${inputCls} appearance-none`} value={registerForm.role} onChange={(e) => setRegisterForm((c) => ({ ...c, role: e.target.value }))}>
                          <option value="TOURIST" className="bg-[#101822]">Tourist</option>
                          <option value="COMMUTER" className="bg-[#101822]">Commuter</option>
                          <option value="HOST" className="bg-[#101822]">Host</option>
                        </select>
                      </label>
                    </div>
                    {registerForm.role !== "HOST" && (
                      <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-medium leading-6 text-gray-400">
                        Tourists can start booking instantly. Commuters can submit their driving license later in Settings to unlock the verified commuter discount.
                      </p>
                    )}
                    <label className="flex flex-col gap-2 text-sm font-semibold text-gray-300">Password
                      <input className={inputCls} type="password" value={registerForm.password} onChange={(e) => setRegisterForm((c) => ({ ...c, password: e.target.value }))} placeholder="Choose a password" />
                    </label>
                    {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}
                    <button type="submit" className="mt-3 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ffb347] px-6 py-4 text-sm font-black text-[#081019] shadow-[0_18px_42px_rgba(255,122,0,0.28)] transition-transform hover:-translate-y-0.5 disabled:opacity-60" disabled={busy}>
                      {busy ? "Creating..." : "Create account"}
                    </button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 grid gap-3">
              {landingSteps.map((step, index) => (
                <motion.div
                  key={step.role}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 + index * 0.06 }}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="text-sm font-bold text-white">{step.role}</div>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <section className="mt-20">
          <LandingSectionHeader
            eyebrow="Feature stack"
            title="Everything people need to move from search to parking"
            description="The `frontendidea1` design language is now carried into a fuller product story: discovery, hosting, verification, wallet flow, and booking history all have a visible place on the homepage."
            align="center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {marketingFeatures.map((feature, index) => (
              <MarketingFeatureTile key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </section>

        <section className="mt-24">
          <LandingSectionHeader
            eyebrow="GIF-style motion"
            title="Parking-themed animated moments that make the homepage feel alive"
            description="These looping scenes act like lightweight built-in GIFs, but stay native to the app so they match the theme and don’t rely on external media files."
            align="center"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {gifShowcaseCards.map((card, index) => (
              <GifShowcaseCard key={card.title} index={index} {...card} />
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-white/10 bg-[#0b1219]/88 p-7 shadow-[0_28px_70px_rgba(0,0,0,0.24)]"
          >
            <LandingSectionHeader
              eyebrow="Verified commuter"
              title="A premium commuter path without forcing tourists through verification"
              description="Tourists can keep booking immediately. Commuters get a dedicated verification lane in Settings, and once approved they unlock the permanent 5% discount."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#3a86ff]/15 bg-[#3a86ff]/10 p-5">
                <div className="flex items-center gap-3 text-[#93c0ff]">
                  <BadgeCheck size={18} />
                  <strong className="text-sm uppercase tracking-[0.18em]">Verified commuter</strong>
                </div>
                <p className="mt-4 text-3xl font-black text-white">5% off</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">Discount automatically appears in the booking breakdown after approval.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#ff7a00]/15 bg-[#ff7a00]/10 p-5">
                <div className="flex items-center gap-3 text-[#ffcf8a]">
                  <Clock3 size={18} />
                  <strong className="text-sm uppercase tracking-[0.18em]">Review flow</strong>
                </div>
                <p className="mt-4 text-3xl font-black text-white">Settings-first</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">The commuter submits driving-license documents from the profile area instead of a fake one-click badge.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081019]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.26)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(58,134,255,0.12),transparent_28%),radial-gradient(circle_at_86%_72%,rgba(255,122,0,0.12),transparent_24%)]" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-400">
                <CreditCard size={14} />
                Product preview
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardPreviewCards.map((card, index) => (
                  <DashboardPreviewCard key={card.title} index={index} {...card} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {trustMoments.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
            >
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Trust signal {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">{item.copy}</p>
            </motion.article>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative mt-24 overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(58,134,255,0.14),rgba(255,122,0,0.12))] px-6 py-10 shadow-[0_32px_90px_rgba(0,0,0,0.28)] sm:px-10"
        >
          <div className="absolute inset-0 parking-grid opacity-[0.08]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                <Car size={14} />
                Ready to launch
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">Step into ShareSpace with a homepage that feels alive, premium, and product-driven.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                Use the cinematic landing flow to pull in tourists, commuters, and hosts, then move them directly into the same real app they already use.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setMode("register")}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#081019] transition-transform hover:-translate-y-0.5"
              >
                Start with registration
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-4 text-sm font-bold text-white"
              >
                Back to hero
              </button>
            </div>
          </div>
        </motion.section>

        <footer className="mt-16 border-t border-white/10 pb-8 pt-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a00] to-[#ffb347] text-[#081019] shadow-[0_12px_30px_rgba(255,122,0,0.28)]">
                  <Car size={20} />
                </div>
                <div>
                  <strong className="block text-sm font-black uppercase tracking-[0.22em] text-white">ShareSpace</strong>
                  <span className="text-xs text-gray-500">Smart parking marketplace</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                A richer homepage inspired by `frontendidea1`, now merged into the working ShareSpace app without losing live auth, wallet, booking, and host flows.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <div className="text-sm font-bold text-white">Product</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Find Parking</div>
                  <div>Host a Spot</div>
                  <div>Commuter Verification</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Experience</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Wallet Payments</div>
                  <div>Booking History</div>
                  <div>Map Guidance</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Audience</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>Tourists</div>
                  <div>Commuters</div>
                  <div>Hosts</div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AuthScreen;
