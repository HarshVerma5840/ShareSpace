"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Parking lot grid background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="parking-grid" width="120" height="200" patternUnits="userSpaceOnUse">
                <rect width="120" height="200" fill="none" />
                <line x1="0" y1="0" x2="0" y2="200" stroke="currentColor" strokeWidth="2" className="text-slate-light" />
                <line x1="120" y1="0" x2="120" y2="200" stroke="currentColor" strokeWidth="2" className="text-slate-light" />
                <line x1="0" y1="100" x2="120" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" className="text-slate-light" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#parking-grid)" />
          </svg>
        </div>

        {/* Animated car silhouette */}
        <div className="absolute bottom-1/3 left-0 w-full overflow-hidden">
          <motion.div
            className="flex items-center"
            initial={{ x: "-100%" }}
            animate={{ x: "100vw" }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          >
            <svg width="80" height="32" viewBox="0 0 80 32" fill="none" className="text-primary">
              <path
                d="M10 24H6C4 24 2 22 2 20V16C2 14 4 12 6 12H20L28 6H52L62 12H74C76 12 78 14 78 16V20C78 22 76 24 74 24H70"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="18" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="62" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M28 12H52V6H28V12Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            </svg>
            {/* Headlight glow */}
            <motion.div
              className="ml-2 h-4 w-16 rounded-full bg-gradient-to-r from-amber to-transparent opacity-60"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Parking P icon with pulse */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-primary bg-background">
              <motion.span
                className="text-5xl font-bold text-primary"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                P
              </motion.span>
            </div>
          </motion.div>

          {/* Brand name */}
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center"
              >
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Share<span className="text-primary">Space</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">Smart Parking Marketplace</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanning animation */}
          <div className="relative mb-6 h-1 w-64 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-transparent"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Scan line effect */}
            <motion.div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={{ x: [0, 256, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Progress text */}
          <motion.p
            className="text-sm font-mono text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {progress < 100 ? (
              <>Finding available spots... {progress}%</>
            ) : (
              <span className="text-primary">Spot found!</span>
            )}
          </motion.p>

          {/* Location pins animation */}
          <div className="absolute -bottom-20 flex gap-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="text-primary/40"
                initial={{ y: 0, opacity: 0.3 }}
                animate={{ y: [-5, 5, -5], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                <svg width="24" height="32" viewBox="0 0 24 32" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
