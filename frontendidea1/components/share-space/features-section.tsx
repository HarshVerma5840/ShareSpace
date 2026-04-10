"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { MapPin, Home, Plane, UserCheck, Wallet, History, Navigation } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "Find Parking Nearby",
    description: "Discover available parking spots around you with our real-time map. Filter by price, distance, and availability.",
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Home,
    title: "Host Your Space",
    description: "Turn your unused parking spot into income. Set your own prices, availability, and earn while you sleep.",
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Plane,
    title: "Tourist Instant Booking",
    description: "Traveling? Book parking in seconds. No subscription needed. Pay only for what you use.",
    color: "amber",
    gradient: "from-amber/20 to-amber/5",
  },
  {
    icon: UserCheck,
    title: "Commuter Verification",
    description: "Get verified as a commuter and unlock exclusive benefits. Waive platform fees and save 5% on every booking.",
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Wallet,
    title: "Wallet Payments",
    description: "Load your wallet once, park anywhere. Fast checkout, transaction history, and automatic top-ups available.",
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: History,
    title: "Booking History",
    description: "Track all your bookings in one place. View receipts, favorite spots, and rebook your regular destinations.",
    color: "amber",
    gradient: "from-amber/20 to-amber/5",
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const colorClasses = {
    primary: "bg-primary/20 text-primary border-primary/30",
    accent: "bg-accent/20 text-accent border-accent/30",
    amber: "bg-amber/20 text-amber border-amber/30",
  }

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
        <motion.div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${colorClasses[feature.color as keyof typeof colorClasses]}`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <feature.icon className="h-6 w-6" />
        </motion.div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        
        {/* Hover arrow */}
        <motion.div
          className="absolute bottom-6 right-6 text-primary opacity-0 transition-opacity group-hover:opacity-100"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <Navigation className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Powerful Features
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">Everything you need for smart parking</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            <span className="text-balance">From finding a spot to earning from your space, ShareSpace gives you all the tools for seamless urban parking.</span>
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
