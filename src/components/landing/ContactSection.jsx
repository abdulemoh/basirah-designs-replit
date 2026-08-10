import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function ContactSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="admission" className="relative py-32 md:py-44 bg-[#F0EBE1]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-16 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          {/* Left: heading */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-[#B8973A] text-[9px] tracking-[0.4em] uppercase font-body mb-5">
              Let's Work Together
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.1 }}
              className="font-body font-black text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-tight text-[#1C1810]">
              <span className="outline-none">Start Your</span><br />
              <span className="text-[#B8973A] outline-none">Project.</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
              className="w-16 h-px bg-[#B8973A] origin-left mt-8" />

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.4 }}
              className="mt-8 space-y-3">
              <p className="text-[#7A6E62] text-[9px] tracking-[0.3em] uppercase font-body">Direct Contact</p>
              <a
                href="tel:8594475611"
                className="block text-[#7A6E62] font-body tracking-widest hover:text-[#B8973A] transition-colors duration-300 text-lg">
                859-447-5611
              </a>
            </motion.div>
          </div>

          {/* Right: description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.5 }}
            className="text-[#7A6E62] text-sm md:text-base font-body font-light max-w-md md:pb-2">
            <span className="outline-none">Fill out the onboarding form below to tell us about your business, your vision, and how you'd like your website built. A reference website helps us get it just right. Your progress saves automatically while you're signed in.</span>
          </motion.p>
        </div>

        <OnboardingForm />
      </div>
    </section>
  );
}