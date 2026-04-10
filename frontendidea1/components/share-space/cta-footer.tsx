"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, MapPin, Car, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTAFooter() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <>
      {/* CTA Section */}
      <section className="relative py-24" ref={sectionRef}>
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />
          
          {/* Animated grid */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="h-full w-full">
              <defs>
                <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>

          {/* Glowing orbs */}
          <motion.div
            className="absolute left-1/4 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icons */}
            <motion.div
              className="mb-8 flex justify-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {[MapPin, Car, Building].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  <Icon className="h-7 w-7" />
                </motion.div>
              ))}
            </motion.div>

            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              <span className="text-balance">
                Ready to transform your{" "}
                <span className="text-primary">parking experience</span>?
              </span>
            </h2>

            <p className="mb-10 text-lg text-muted-foreground">
              <span className="text-balance">
                Join thousands of hosts and drivers who have already discovered smarter parking. Get started in minutes.
              </span>
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group w-full bg-primary px-8 text-lg text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                Find Parking Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-border px-8 text-lg text-foreground hover:bg-secondary sm:w-auto"
              >
                List Your Space
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                Free to join
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                No hidden fees
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <a href="#" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/50 bg-primary/10">
                  <span className="text-lg font-bold text-primary">P</span>
                </div>
                <span className="text-lg font-semibold text-foreground">
                  Share<span className="text-primary">Space</span>
                </span>
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                The smartest way to find, book, and manage parking in your city.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Find Parking", "List Your Spot", "Commuter Program", "Pricing"].map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-foreground">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["About", "Careers", "Press", "Contact"].map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-foreground">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"].map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-foreground">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ShareSpace. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
