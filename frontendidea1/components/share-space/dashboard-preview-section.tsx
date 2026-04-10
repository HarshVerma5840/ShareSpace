"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { MapPin, Wallet, History, Settings, Plus, Search, Navigation, CreditCard, Clock, CheckCircle } from "lucide-react"

const dashboardPreviews = [
  {
    id: "map",
    title: "Map Search",
    icon: Search,
    color: "primary",
  },
  {
    id: "listing",
    title: "Spot Listing",
    icon: Plus,
    color: "accent",
  },
  {
    id: "wallet",
    title: "Wallet",
    icon: Wallet,
    color: "amber",
  },
  {
    id: "history",
    title: "Booking History",
    icon: History,
    color: "primary",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    color: "accent",
  },
]

function MapSearchPreview() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Find Parking</p>
          <p className="text-xs text-muted-foreground">Downtown Area</p>
        </div>
      </div>
      
      {/* Mini map */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-secondary/50">
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full">
            <defs>
              <pattern id="preview-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-light" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#preview-grid)" />
          </svg>
        </div>
        
        {/* Parking markers */}
        {[
          { x: "25%", y: "40%" },
          { x: "60%", y: "30%" },
          { x: "45%", y: "65%" },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos.x, top: pos.y }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            <div className="h-full w-full rounded-full bg-primary" />
          </motion.div>
        ))}
        
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>
      
      {/* Results */}
      <div className="space-y-2">
        {["Pine Street Garage", "City Center Lot"].map((name, i) => (
          <div key={name} className="flex items-center justify-between rounded-lg bg-secondary/30 p-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-xs text-foreground">{name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{i === 0 ? "0.2 mi" : "0.4 mi"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpotListingPreview() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">List Your Spot</p>
          <p className="text-xs text-muted-foreground">Create new listing</p>
        </div>
      </div>
      
      {/* Form preview */}
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Location</p>
          <p className="text-sm text-foreground">123 Main Street</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Hourly Rate</p>
            <p className="text-sm font-semibold text-primary">$4.50</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Daily Rate</p>
            <p className="text-sm font-semibold text-primary">$25.00</p>
          </div>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-xs text-foreground">Ready to publish</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WalletPreview() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/10 text-amber">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">My Wallet</p>
          <p className="text-xs text-muted-foreground">Balance & payments</p>
        </div>
      </div>
      
      {/* Balance card */}
      <div className="mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 p-4">
        <p className="mb-1 text-xs text-muted-foreground">Available Balance</p>
        <p className="text-2xl font-bold text-foreground">$127.50</p>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground">Add Funds</button>
          <button className="flex-1 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground">Withdraw</button>
        </div>
      </div>
      
      {/* Recent transactions */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">Recent</p>
      <div className="space-y-2">
        {[
          { name: "Parking - Oak St", amount: "-$8.00" },
          { name: "Wallet Top Up", amount: "+$50.00" },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between rounded-lg bg-secondary/30 p-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-foreground">{tx.name}</span>
            </div>
            <span className={`text-xs font-medium ${tx.amount.startsWith("+") ? "text-accent" : "text-foreground"}`}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingHistoryPreview() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <History className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Booking History</p>
          <p className="text-xs text-muted-foreground">Past reservations</p>
        </div>
      </div>
      
      {/* Bookings list */}
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-sm font-medium text-foreground">Pine Street Garage</p>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Today, 9:00 AM</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-sm font-medium text-foreground">City Center Lot</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Completed
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Yesterday</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex items-start justify-between">
            <p className="text-sm font-medium text-foreground">Mall Parking</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Completed
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Mar 15</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPreview() {
  return (
    <div className="h-full rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Settings</p>
          <p className="text-xs text-muted-foreground">Account preferences</p>
        </div>
      </div>
      
      {/* Settings list */}
      <div className="space-y-2">
        {[
          { icon: Navigation, label: "Default Navigation", value: "Google Maps" },
          { icon: CreditCard, label: "Payment Method", value: "****4242" },
        ].map((setting) => (
          <div key={setting.label} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-2">
              <setting.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-foreground">{setting.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{setting.value}</span>
          </div>
        ))}
        
        {/* Verify CTA */}
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Commuter Verification</p>
              <p className="text-[10px] text-muted-foreground">Get 5% off all bookings</p>
            </div>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const previewComponents: Record<string, () => JSX.Element> = {
  map: MapSearchPreview,
  listing: SpotListingPreview,
  wallet: WalletPreview,
  history: BookingHistoryPreview,
  settings: SettingsPreview,
}

export function DashboardPreviewSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="dashboard" className="relative py-24" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            Product Preview
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">A powerful dashboard at your fingertips</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            <span className="text-balance">Manage your parking experience with our intuitive dashboard. Search spots, track bookings, and manage your wallet all in one place.</span>
          </p>
        </motion.div>

        {/* Dashboard previews grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardPreviews.map((preview, index) => {
            const PreviewComponent = previewComponents[preview.id]
            return (
              <motion.div
                key={preview.id}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-2xl"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Glow on hover */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <PreviewComponent />
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
