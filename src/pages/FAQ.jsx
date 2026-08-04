import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const FAQS = [
  {
    category: "Ownership & Hosting",
    q: "Do I get to own the website, and why not?",
    a: "No, instead we handle it all for you and save you the headache. Because your website is built on and tied to our managed hosting infrastructure, the design and code are maintained as part of your subscription rather than handed over as a separate asset. This is what lets us keep everything secure, updated, and online with no work on your end — the infrastructure, hosting, and ongoing upkeep are all included."
  },
  {
    category: "Ownership & Hosting",
    q: "Am I able to get a refund if I don't want the website?",
    a: "No, you cannot get a refund. Because each website is custom-built to your specifications from the start, the work performed cannot be undone, and all sales are final."
  },
  {
    category: "Ownership & Hosting",
    q: "Will a domain be included in my website?",
    a: "No, a domain is not included. It is for you to decide your domain name and what you want it to be. At porkbun.com, you can get cheap domains for your website! Once you have one, we will ask you for the information of your domain so we can connect it to your website."
  },
  {
    category: "Ownership & Hosting",
    q: "What happens to my domain name if I cancel my subscription?",
    a: "Your domain name is registered separately and belongs to you. If you cancel, we'll help you point your domain wherever you'd like it to go."
  },
  {
    category: "Maintenance & Support",
    q: "What is in my monthly maintenance plan?",
    a: "Your Standard Plan monthly maintenance covers hosting your website, fixing bugs, performing requested changes, keeping everything updated, and providing priority support — all handled by our team so your site runs smoothly month after month."
  },
  {
    category: "Maintenance & Support",
    q: "What happens to my website if I stop paying the monthly maintenance fee?",
    a: "Your website will ultimately stop running, and you will no longer receive updates, bug fixes, or priority support. We'll make sure to notify you if this happens."
  },
  {
    category: "Maintenance & Support",
    q: "What if I need to cancel my monthly maintenance plan?",
    a: "You can manage your subscription anytime through the Stripe Customer Portal — no lock-in. We simply ask that you let us know so we can transition your site gracefully."
  },
  {
    category: "Maintenance & Support",
    q: "Can I make my own updates to the website text or images?",
    a: "Requested changes are handled by our team as part of your maintenance plan. Just send us what you'd like updated and we'll take care of it for you."
  },
  {
    category: "Project Timeline & Process",
    q: "How long does a typical project take from start to finish?",
    a: "It will take from a week to a month. This timeframe allows us to ensure the quality and attention to detail your website deserves, while keeping your project moving forward efficiently."
  },
  {
    category: "Project Timeline & Process",
    q: "What information do I need to provide to get started?",
    a: "Anything you have — business name, a short description, photos or logos, preferred colors, links to websites you admire, and contact details. The more context you share in the onboarding form, the closer we can get to your vision."
  },
  {
    category: "Project Timeline & Process",
    q: "Can I request revisions during the design process?",
    a: "Absolutely. We work iteratively and share progress along the way, so you'll have opportunities to request adjustments before we finalize your site."
  },
  {
    category: "Design & Branding",
    q: "Will my website be mobile-friendly?",
    a: "Always. Every site we build is fully responsive and looks polished on phones, tablets, and desktops alike."
  },
  {
    category: "Getting Started",
    q: "Where can I ask questions or submit information about my website and how I want it to be built?",
    a: "Right here — use the onboarding form on the home page. It's designed for you to share your vision, ask questions, and provide details about how you'd like your website built. A reference website helps us get it just right."
  },
  {
    category: "Getting Started",
    q: "How do I get started?",
    a: "Scroll to the onboarding form on the home page, fill in your details, and we'll be in touch to kick off your project."
  }
];

export default function FAQ() {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <div className="bg-[#FAF7F2] min-h-screen flex flex-col">
      <Navbar />
      <section className="relative pt-32 md:pt-44 pb-32 md:pb-44 flex-1">
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
                  transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : Math.min(i * 0.05, 0.4) }}
                  className="border border-[#DDD4C0] rounded-xl bg-[#F5F0E8] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 text-left p-6 md:p-7 focus:outline-none">
                    <span>
                      <span className="block text-[#B8973A] text-[9px] tracking-[0.3em] uppercase font-body mb-1">{faq.category}</span>
                      <span className="font-body font-semibold text-lg text-[#1C1810]">{faq.q}</span>
                    </span>
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

          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#B8973A] text-xs tracking-[0.2em] uppercase font-body hover:text-[#a5862f] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}