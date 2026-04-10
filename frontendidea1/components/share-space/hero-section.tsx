"use client"

import { motion } from "framer-motion"
import { MapPin, ArrowRight, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const floatingCards = [
  { icon: MapPin, label: "12 spots nearby", color: "primary", delay: 0 },
  { icon: Shield, label: "Verified Host", color: "accent", delay: 0.2 },
  { icon: Clock, label: "2 min away", color: "amber", delay: 0.4 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full">
            <defs>
              <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live in 50+ cities
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mb-6 max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-balance">
              The{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">smartest</span>
                <motion.span
                  className="absolute bottom-2 left-0 -z-0 h-3 w-full bg-primary/20"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />
              </span>{" "}
              way to find parking
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mb-10 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-balance">
              Book parking spots instantly. List your space and earn. Join thousands of hosts and drivers in the smart parking revolution.
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="group bg-primary px-8 text-lg text-primary-foreground hover:bg-primary/90"
            >
              Find Parking
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border px-8 text-lg text-foreground hover:bg-secondary"
            >
              List Your Spot
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 text-center sm:gap-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              { value: "50K+", label: "Active Users" },
              { value: "10K+", label: "Parking Spots" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating cards */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                className={`absolute glass rounded-xl p-4 ${
                  i === 0 ? "left-[5%] top-[30%]" : i === 1 ? "right-[8%] top-[25%]" : "left-[10%] bottom-[25%]"
                }`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + card.delay }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      card.color === "primary" ? "bg-primary/20 text-primary" :
                      card.color === "accent" ? "bg-accent/20 text-accent" :
                      "bg-amber/20 text-amber"
                    }`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{card.label}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Hero visual - City parking map preview */}
          <motion.div
            className="relative mt-16 w-full max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2">
              {/* Map mockup */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary/50">
                {/* Street grid */}
                <svg className="absolute inset-0 h-full w-full opacity-30">
                  <defs>
                    <pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-light" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                </svg>
                
                {/* Parking spots */}
                {[
                  { x: "20%", y: "30%", available: true },
                  { x: "35%", y: "55%", available: true },
                  { x: "60%", y: "25%", available: false },
                  { x: "75%", y: "60%", available: true },
                  { x: "45%", y: "70%", available: true },
                ].map((spot, i) => (
                  <motion.div
                    key={i}
                    className={`absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      spot.available ? "bg-primary" : "bg-muted-foreground/50"
                    }`}
                    style={{ left: spot.x, top: spot.y }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    {spot.available && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    )}
                    <div className="relative flex h-full w-full items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">P</span>
                    </div>
                  </motion.div>
                ))}

                {/* User location */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-accent"
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                      <div className="h-3 w-3 rounded-full bg-accent-foreground" />
                    </div>
                  </div>
                </motion.div>

                {/* Search card overlay */}
                <motion.div
                  className="absolute left-4 top-4 glass rounded-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Downtown Area</p>
                      <p className="text-xs text-muted-foreground">4 spots available</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="h-12 w-6 rounded-full border border-border p-1">
            <motion.div
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
