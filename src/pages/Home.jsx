import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import ServicesGrid from "@/components/landing/ServicesGrid";
import ProcessSection from "@/components/landing/ProcessSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-[#050505] min-h-screen">
      <Navbar />
      <HeroSection />
      <PricingSection />
      <ServicesGrid />
      <ProcessSection />
      <ContactSection />
      <Footer />
    </div>
  );
}