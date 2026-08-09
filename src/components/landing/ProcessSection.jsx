import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function ProcessSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="process" className="relative py-32 md:py-44 bg-[#FAF7F2] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* Section heading */}
        <div className="mb-20 md:mb-28">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            className="font-body text-3xl md:text-5xl text-[#1C1810] font-light italic max-w-lg">
            <span className="outline-none">Why Us</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
            className="w-16 h-px bg-[#B8973A] origin-left mt-6" />
        </div>

        {/* Statement blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Block 1 — Affordable */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}>
            <p className="text-[#B8973A] text-[9px] tracking-[0.35em] uppercase font-body mb-5">Our Belief</p>
            <h3 className="font-body font-black text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight text-[#1C1810] outline-none mb-8 not-italic">Your digital presence, fully managed.




            </h3>
            <p className="text-[#7A6E62] text-base leading-relaxed font-body font-light max-w-sm outline-none">
              We take the technical heavy lifting essentially off your plate. From development to daily maintenance, we handle it all — no stress, just results.
            </p>
          </motion.div>

          {/* Block 2 — Sales-driven */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="md:mt-24">
            <p className="text-[#B8973A] text-[9px] tracking-[0.35em] uppercase font-body mb-5">Our Edge</p>
            <h3 className="font-body font-black text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight text-[#1C1810] outline-none mb-8">
              Elegant.<br />
              And it<br />
              <span className="text-[#B8973A]">$ells
</span>
            </h3>
            <p className="text-[#7A6E62] text-base leading-relaxed font-body font-light max-w-sm outline-none">
              We don't just build beautiful — we build websites engineered to convert visitors into customers. Every element earns its place on the page.
            </p>
          </motion.div>

        </div>
      </div>
    </section>);

}