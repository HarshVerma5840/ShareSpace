"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Home, Plane, Briefcase, MapPin, CreditCard, Car, Plus, Clock, DollarSign, BadgeCheck, Percent } from "lucide-react"

const userTypes = [
  {
    id: "host",
    label: "Host",
    icon: Home,
    color: "primary",
    description: "Earn money from your parking space",
    steps: [
      { icon: Plus, title: "List Your Spot", description: "Add your parking space with photos, pricing, and availability" },
      { icon: Clock, title: "Set Schedule", description: "Choose when your spot is available - hourly, daily, or monthly" },
      { icon: DollarSign, title: "Start Earning", description: "Get paid directly to your wallet when drivers book your spot" },
    ],
  },
  {
    id: "tourist",
    label: "Tourist",
    icon: Plane,
    color: "accent",
    description: "Book parking instantly when traveling",
    steps: [
      { icon: MapPin, title: "Search Location", description: "Find parking near your destination on our interactive map" },
      { icon: CreditCard, title: "Book & Pay", description: "Reserve your spot instantly with secure one-tap payment" },
      { icon: Car, title: "Park & Go", description: "Navigate to your spot and start exploring worry-free" },
    ],
  },
  {
    id: "commuter",
    label: "Commuter",
    icon: Briefcase,
    color: "amber",
    description: "Save 5% with verified commuter status",
    steps: [
      { icon: BadgeCheck, title: "Get Verified", description: "Verify your commuter status with employer or transit details" },
      { icon: Percent, title: "Unlock Discount", description: "Waive platform fees and get 5% off every booking" },
      { icon: Car, title: "Park Daily", description: "Book your regular spots faster with saved preferences" },
    ],
  },
]

export function HowItWorksSection() {
  const [activeType, setActiveType] = useState("host")
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  const activeUser = userTypes.find((u) => u.id === activeType)!

  const colorClasses = {
    primary: {
      bg: "bg-primary",
      bgLight: "bg-primary/10",
      border: "border-primary",
      text: "text-primary",
    },
    accent: {
      bg: "bg-accent",
      bgLight: "bg-accent/10",
      border: "border-accent",
      text: "text-accent",
    },
    amber: {
      bg: "bg-amber",
      bgLight: "bg-amber/10",
      border: "border-amber",
      text: "text-amber",
    },
  }

  return (
    <section id="how-it-works" className="relative py-24" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

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
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Simple Process
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">How ShareSpace Works</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            <span className="text-balance">Whether you&apos;re a host, tourist, or daily commuter - getting started is easy.</span>
          </p>
        </motion.div>

        {/* User type selector */}
        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {userTypes.map((type) => {
            const colors = colorClasses[type.color as keyof typeof colorClasses]
            const isActive = activeType === type.id

            return (
              <motion.button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`relative flex items-center gap-3 rounded-xl px-6 py-4 transition-all ${
                  isActive
                    ? `${colors.bgLight} ${colors.border} border-2`
                    : "border border-border bg-card hover:border-muted-foreground/30"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? colors.bg : "bg-muted"}`}>
                  <type.icon className={`h-5 w-5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${isActive ? colors.text : "text-foreground"}`}>{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            className="grid gap-6 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeUser.steps.map((step, index) => {
              const colors = colorClasses[activeUser.color as keyof typeof colorClasses]

              return (
                <motion.div
                  key={step.title}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                >
                  <div className="relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    {/* Step number */}
                    <div className="absolute -top-3 left-6">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${colors.bg} text-xs font-bold text-foreground`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`mb-4 mt-2 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bgLight}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <step.icon className={`h-7 w-7 ${colors.text}`} />
                    </motion.div>

                    {/* Content */}
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                    {/* Connector line (on larger screens) */}
                    {index < 2 && (
                      <div className="absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-border md:block">
                        <div className={`absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t ${colors.border}`} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
