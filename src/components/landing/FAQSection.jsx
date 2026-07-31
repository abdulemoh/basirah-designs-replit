import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "Do I get to own the website?",
    a: "No — we handle it all for you and save you the headache. With our included hosting plan, we manage the infrastructure, hosting, and ongoing upkeep so your site stays online and secure without you lifting a finger."
  },
  {
    q: "What is in my monthly maintenance plan?",
    a: "Your Standard Plan monthly maintenance covers hosting your website, fixing bugs, performing requested changes, keeping everything updated, and providing priority support — all handled by our team so your site runs smoothly month after month."
  },
  {
    q: "Where can I ask questions or submit information about my website and how I want it to be built?",
    a: "Right here — use the onboarding form below. It's designed for you to share your vision, ask questions, and provide details about how you'd like your website built. A reference website helps us get it just right."
  },
  {
    q: "How long does a typical project take from start to finish?",
    a: "It will take from a week to a month. This timeframe allows us to ensure the quality and attention to detail your website deserves, while keeping your project moving forward efficiently."
  }
];

export default function FAQSection() {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative py-32 md:py-44 bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="mb-16 md:mb-20 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            className="text-[#B8973A] text-[9px] tracking-[0.4em] uppercase font-body mb-5">
            Frequently Asked
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.1 }}
            className="font-body font-black text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] tracking-tight text-[#1C1810]">
            Questions, <span className="text-[#B8973A]">Answered.</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
            className="w-16 h-px bg-[#B8973A] origin-center mt-6 mx-auto" />
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : i * 0.1 }}
                className="border border-[#DDD4C0] rounded-xl bg-[#F5F0E8] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left p-6 md:p-7 focus:outline-none">
                  <span className="font-body font-semibold text-lg text-[#1C1810]">{faq.q}</span>
                  <Plus
                    className={`w-5 h-5 text-[#B8973A] flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                      className="overflow-hidden">
                      <p className="px-6 md:px-7 pb-6 md:pb-7 text-[#7A6E62] text-sm md:text-base font-body font-light leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}