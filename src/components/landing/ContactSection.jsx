import React, { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import SimpleContactForm from "@/components/onboarding/SimpleContactForm";

export default function ContactSection() {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState("questions"); // "questions" | "onboarding"
  const sectionRef = useRef(null);

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      const el = document.getElementById("admission-section-top");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const goToOnboarding = () => {
    setView("onboarding");
    scrollToTop();
  };

  const goToQuestions = () => {
    setView("questions");
    scrollToTop();
  };

  return (
    <section id="admission" ref={sectionRef} className="relative py-32 md:py-44 bg-[#F0EBE1]">
      <div id="admission-section-top" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-16 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
          {/* Left: heading */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-[#B8973A] text-[9px] tracking-[0.4em] uppercase font-body mb-5">
              {view === "questions" ? "Have a Question?" : "Let's Work Together"}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.1 }}
              className="font-body font-black text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-tight text-[#1C1810]">
              <span className="outline-none">{view === "questions" ? "Ask Us" : "Start Your"}</span><br />
              <span className="text-[#B8973A] outline-none">{view === "questions" ? "Anything." : "Project."}</span>
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
            {view === "questions" ? (
              <span className="outline-none">Just have a quick question? Tell us who you are and what you'd like to know — we'll get back to you. When you're ready to start your project, scroll down to continue to the full onboarding form.</span>
            ) : (
              <span className="outline-none">Fill out the onboarding form below to tell us about your business, your vision, and how you'd like your website built. A reference website helps us get it just right. Your progress saves automatically while you're signed in.</span>
            )}
          </motion.p>
        </div>

        {/* View switch */}
        {view === "questions" ? (
          <>
            <SimpleContactForm />

            {/* CTA to the full onboarding form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="max-w-2xl mx-auto mt-20 pt-10 border-t border-[#DDD4C0]">
              <div className="text-center">
                <p className="text-[#B8973A] text-[9px] tracking-[0.4em] uppercase font-body mb-4">Ready to begin?</p>
                <h3 className="font-body text-2xl md:text-3xl text-[#1C1810] font-semibold mb-4">Continue to the full onboarding form</h3>
                <p className="text-[#7A6E62] text-sm font-body font-light max-w-lg mx-auto mb-8 leading-relaxed">
                  Share your business, vision, and design preferences in detail. Your progress saves automatically so you can come back any time.
                </p>
                <button
                  type="button"
                  onClick={goToOnboarding}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-[10px] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#F0EBE1]">
                  Go to Onboarding Form <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Back to questions */}
            <button
              type="button"
              onClick={goToQuestions}
              className="flex items-center gap-2 text-[#7A6E62] text-xs tracking-[0.2em] uppercase font-body hover:text-[#B8973A] transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to questions
            </button>
            <OnboardingForm />
          </div>
        )}
      </div>
    </section>
  );
}