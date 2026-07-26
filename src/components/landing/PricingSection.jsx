import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FEATURES = [
"Bespoke website design & development",
"Premium cloud infrastructure",
"Professional email configuration",
"Continuous maintenance & updates",
"Enterprise-grade security",
"Priority dedicated support"];

export default function PricingSection() {
  const prefersReducedMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app in a new tab.");
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke("stripeCheckout", {});
      window.location.href = response.data.url;
    } catch (error) {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="relative py-32 md:py-44 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-16 md:mb-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="text-[#7A6E62] text-xs tracking-[0.3em] uppercase font-body hidden">
          02 — The Sovereign Plan
        </motion.p>
      </div>

      <div className="flex justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          className="relative w-full max-w-lg">
          {/* Shimmer border */}
          <div
            className="absolute -inset-px rounded-sm"
            style={{
              background: "linear-gradient(135deg, #B8973A 0%, transparent 40%, transparent 60%, #B8973A 100%)",
              backgroundSize: "200% 200%",
              animation: prefersReducedMotion ? "none" : "shimmer-border 4s ease-in-out infinite"
            }} />

          {/* Card body */}
          <div className="relative bg-[#F5F0E8] p-8 md:p-12 border border-[#E5DDD0] rounded-xl">
            {/* Header */}
            <div className="text-center mb-10">
              <p className="text-[#B8973A] text-[10px] tracking-[0.4em] uppercase font-body mb-6">THE ONE PAGE</p>
              <h2 className="font-body text-4xl md:text-5xl text-[#1C1810] italic font-light mb-2">
                Standard Plan
              </h2>
              <p className="text-[#7A6E62] text-sm font-body">
                <span className="text-xs">A clean website consisting of 4-5 pages that displays business info,  contact emails, Fa already set up and handled for you. Includes a default maintenance plan that takes care of hosting your website, fixing bugs, performing requested changes, etc.</span>
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#B8973A]/50 to-transparent mb-10" />

            {/* Pricing blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 items-stretch">
              <div className="text-center p-4 border border-[#DDD4C0] rounded-sm bg-[#FAF7F2] flex flex-col justify-between">
                <p className="text-[#7A6E62] text-[9px] tracking-[0.3em] uppercase mb-3 font-body text-center px-5">STANDARD FEE</p>
                <span className="text-[#B8973A] font-body font-bold text-4xl md:text-5xl">$1,000</span>
                <p className="text-[#7A6E62] text-[10px] tracking-widest uppercase mt-3">One-Time</p>
              </div>

              <div className="text-center p-4 border border-[#B8973A]/40 rounded-sm bg-[#B8973A]/[0.05] flex flex-col justify-between">
                <p className="text-[#7A6E62] text-[9px] tracking-[0.3em] uppercase mb-3 font-body">Monthly Maintenance</p>
                <span className="text-[#B8973A] font-body font-bold text-4xl md:text-5xl">$79</span>
                <p className="text-[#7A6E62] text-[10px] tracking-widest uppercase mt-3">Per Month</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#E5DDD0] mb-8" />

            {/* Features */}
            <ul className="space-y-4 mb-10">
              {FEATURES.map((feature, i) =>
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReducedMotion ? 0 : i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#B8973A]/50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#B8973A]" />
                  </div>
                  <span className="text-[#1C1810] text-sm font-body font-light">{feature}</span>
                </motion.li>
              )}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] min-h-[48px] rounded-[10px] disabled:opacity-60">
              {loading ? "Loading..." : "JOIN"}
            </button>

            <p className="text-center text-[#7A6E62] text-xs mt-6 font-body hidden">
              Limited availability — acceptance by review only
            </p>
          </div>
        </motion.div>
      </div>
    </section>);

}