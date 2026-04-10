"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { LoadingScreen } from "@/components/share-space/loading-screen"
import { Navbar } from "@/components/share-space/navbar"
import { HeroSection } from "@/components/share-space/hero-section"
import { FeaturesSection } from "@/components/share-space/features-section"
import { HowItWorksSection } from "@/components/share-space/how-it-works-section"
import { VerificationSection } from "@/components/share-space/verification-section"
import { DashboardPreviewSection } from "@/components/share-space/dashboard-preview-section"
import { TestimonialsSection } from "@/components/share-space/testimonials-section"
import { CTAFooter } from "@/components/share-space/cta-footer"

export default function ShareSpaceLanding() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if this is a fresh page load or navigation
    const hasLoaded = sessionStorage.getItem("sharespace-loaded")
    if (hasLoaded) {
      setIsLoading(false)
      setShowContent(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem("sharespace-loaded", "true")
    setIsLoading(false)
    setTimeout(() => setShowContent(true), 100)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {showContent && (
        <>
          <Navbar />
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <VerificationSection />
          <DashboardPreviewSection />
          <TestimonialsSection />
          <CTAFooter />
        </>
      )}
    </main>
  )
}
