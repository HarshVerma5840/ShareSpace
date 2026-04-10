"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Star, Quote, Building2, Users, MapPin, TrendingUp } from "lucide-react"

const testimonials = [
  {
    quote: "ShareSpace has completely changed how I commute. I save almost $200 a month on parking fees and always have a guaranteed spot.",
    author: "Sarah Chen",
    role: "Daily Commuter",
    image: null,
    rating: 5,
  },
  {
    quote: "As a host, I earn over $800 monthly from my unused parking spot. The platform handles everything - payments, bookings, everything.",
    author: "Michael Torres",
    role: "Parking Host",
    image: null,
    rating: 5,
  },
  {
    quote: "Traveling for work used to mean parking stress. Now I just open ShareSpace and book a spot in seconds. Game changer for business travel.",
    author: "Emily Watson",
    role: "Frequent Traveler",
    image: null,
    rating: 5,
  },
]

const stats = [
  { icon: Building2, value: "50+", label: "Cities" },
  { icon: Users, value: "50K+", label: "Active Users" },
  { icon: MapPin, value: "10K+", label: "Parking Spots" },
  { icon: TrendingUp, value: "$2M+", label: "Host Earnings" },
]

export function TestimonialsSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

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
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Trusted by Thousands
          </motion.div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-balance">Smart parking for smart cities</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            <span className="text-balance">Join a growing community of hosts and drivers who are transforming urban parking.</span>
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <motion.div
                className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Quote icon */}
                <Quote className="mb-4 h-8 w-8 text-primary/20" />

                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber text-amber" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="mb-6 text-sm text-muted-foreground">Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["TechCorp", "CityGov", "MetroTransit", "UrbanPlan", "SmartCity"].map((brand) => (
              <div
                key={brand}
                className="text-lg font-bold tracking-wide text-muted-foreground"
              >
                {brand}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
