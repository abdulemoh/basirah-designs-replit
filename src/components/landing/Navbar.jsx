import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "The Plan", href: "#pricing" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Apply", href: "#admission" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled ? "bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DDD0]" : "bg-[#FAF7F2]"}`}>

        <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-3 md:py-4">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm">
            <img
              src="https://media.base44.com/images/public/6a41cc1ad003cb8fb7f66133/c115ce08e_image-removebg-preview.png"
              alt="Basirah Designs Logo"
              className="w-28 md:w-32 lg:w-40 h-auto object-contain"
              style={{ backgroundColor: "#FAF7F2" }} />
          </a>

          {/* Center nav links — lg only */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) =>
              <a
                key={link.href}
                href={link.href}
                className="text-[#7A6E62] text-[11px] tracking-[0.2em] uppercase font-body font-medium hover:text-[#1C1810] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm">
                {link.label}
              </a>
            )}
          </nav>

          {/* Right side: call button + START A PROJECT grouped side by side */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:8594475611"
              className="flex items-center text-[#FAF7F2] text-xs font-semibold tracking-[0.15em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-2xl px-5 py-2.5 bg-[#B8973A] min-h-[40px]">
              859-447-5611
            </a>
            <a
              href="#admission"
              className="px-5 py-2.5 bg-[#B8973A] text-[#FAF7F2] tracking-[0.2em] uppercase font-body font-semibold hover:bg-[#a5862f] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] min-h-[40px] flex items-center rounded-2xl text-xs">
              Start a Project
            </a>
          </div>

          {/* Mobile/tablet toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-[#1C1810] min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm relative z-50"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile/tablet menu */}
      <AnimatePresence>
        {mobileOpen &&
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
            className="lg:hidden fixed inset-0 z-40 bg-[#FAF7F2] border-b border-[#E5DDD0] flex flex-col items-center justify-center gap-8 px-6">

            <div className="flex flex-col items-center gap-6">
              {links.map((link, i) =>
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1 + i * 0.06 }}
                  className="text-[#1C1810] text-xl font-body font-semibold tracking-tight hover:text-[#B8973A] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm px-4 py-1">
                  {link.label}
                </motion.a>
              )}
            </div>

            <div className="w-16 h-px bg-[#B8973A]/40" />

            <a
              href="#admission"
              onClick={() => setMobileOpen(false)}
              className="px-8 py-4 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] min-h-[48px] flex items-center">
              Start a Project
            </a>

            <a
              href="tel:8594475611"
              className="text-[#7A6E62] text-sm font-body tracking-widest hover:text-[#B8973A] transition-colors duration-300">
              859-447-5611
            </a>
          </motion.div>
        }
      </AnimatePresence>
    </>
  );
}