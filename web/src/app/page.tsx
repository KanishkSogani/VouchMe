"use client";
import HeroSection from "@/components/LandingPage/HeroSection";
import TestimonialsSection from "@/components/LandingPage/TestimonialSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import Footer from "@/components/LandingPage/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </main>
  );
}
