"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { BadgeCheck, Shield, Percent, Clock, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    icon: Percent,
    title: "5% Discount",
    description: "Save on every booking by waiving platform fees",
  },
  {
    icon: Zap,
    title: "Priority Booking",
    description: "Get first access to high-demand parking spots",
  },
  {
    icon: Clock,
    title: "Quick Checkout",
    description: "Streamlined booking with saved preferences",
  },
  {
    icon: Star,
    title: "Exclusive Spots",
    description: "Access commuter-only parking locations",
  },
]

export function VerificationSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="verify" className="relative py-24" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <BadgeCheck className="h-4 w-4" />
              Verified Commuter Program
            </motion.div>

            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              <span className="text-balance">
                Get verified.{" "}
                <span className="text-primary">Save more.</span>
              </span>
            </h2>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              <span className="text-balance">
                Join our verified commuter program and unlock exclusive benefits. Waive platform fees, get priority access to premium spots, and save 5% on every booking.
              </span>
            </p>

            {/* Benefits grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <BadgeCheck className="mr-2 h-5 w-5" />
              Get Verified Now
            </Button>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Verification card mockup */}
            <div className="relative mx-auto max-w-sm">
              {/* Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-2xl" />

              {/* Main card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-border bg-card"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-accent/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
                      <BadgeCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified Status</p>
                      <p className="text-xl font-bold text-foreground">Commuter Pro</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* User info mockup */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                    <div>
                      <p className="font-semibold text-foreground">Alex Johnson</p>
                      <p className="text-sm text-muted-foreground">Member since 2024</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl bg-secondary/30 p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">47</p>
                      <p className="text-xs text-muted-foreground">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">$128</p>
                      <p className="text-xs text-muted-foreground">Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber">4.9</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  {/* Verification badge */}
                  <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Verified Commuter</span>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -right-4 top-1/4 rounded-xl border border-border bg-card p-3 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1, y: [0, -10, 0] } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">-5% Applied</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-4 bottom-1/4 rounded-xl border border-border bg-card p-3 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1, y: [0, 10, 0] } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Priority Access</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
