import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const HERO_IMAGE = "https://media.base44.com/images/public/6a41cc1ad003cb8fb7f66133/653fdf4a4_generated_bf5f3d32.png";

function MagneticButton({ children, onClick }) {
 const btnRef = useRef(null);
 const [offset, setOffset] = useState({ x: 0, y: 0 });
 const prefersReducedMotion = useReducedMotion();

 const handleMouseMove = (e) => {
 if (prefersReducedMotion) return;
 const rect = btnRef.current.getBoundingClientRect();
 const cx = rect.left + rect.width / 2;
 const cy = rect.top + rect.height / 2;
 const dx = (e.clientX - cx) * 0.25;
 const dy = (e.clientY - cy) * 0.25;
 setOffset({ x: dx, y: dy });
 };

 const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

 return (
 <motion.button
 ref={btnRef}
 onMouseMove={handleMouseMove}
 onMouseLeave={handleMouseLeave}
 onClick={onClick}
 animate={{ x: offset.x, y: offset.y }}
 transition={{ type: "spring", stiffness: 200, damping: 15 }}
 className="relative px-10 py-4 md:px-14 md:py-5 bg-[#B8973A] text-[#FAF7F2] font-body text-sm md:text-sm font-semibold tracking-[0.2em] uppercase cursor-pointer hover:bg-[#a5862f] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] min-h-[48px] min-w-[48px] rounded-[10px]">













 {children}
 </motion.button>);

}

export default function HeroSection() {
 const prefersReducedMotion = useReducedMotion();

 const scrollToForm = () => {
 document.getElementById("admission")?.scrollIntoView({ behavior: "smooth" });
 };

 return (
 <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF7F2]">
 <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-32 md:pt-36 pb-20">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">

 {/* Left: Text */}
 <div className="flex flex-col justify-center">
 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
 className="text-[#7A6E62] text-xs md:text-xs tracking-[0.3em] uppercase font-body font-medium mb-6 md:mb-8 hidden">
 Boutique Web Design Agency
 </motion.p>

 <motion.h1
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.4 }}
 className="leading-[0.88] tracking-tight mb-4">
 <span className="block text-[clamp(2.8rem,6.5vw,7.5rem)] text-[#1C1810] font-extrabold font-body outline-none focus:border-b focus:border-[#B8973A]/40">Basirah</span>
 <span className="block text-[clamp(2.8rem,6.5vw,7.5rem)] text-[#B8973A] no-underline [font-family:'Alegreya',_serif] font-bold italic outline-none focus:border-b focus:border-[#B8973A]/40">Designs</span>
 </motion.h1>

 <motion.div
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ duration: prefersReducedMotion ? 0 : 1, delay: 0.8 }}
 className="w-20 h-px bg-[#B8973A] origin-left mb-8 md:mb-10" />

 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 1 }}
 className="text-[#7A6E62] leading-relaxed max-w-sm md:mb-12 font-body font-light mb-10 text-base md:text-base">
 <span className="outline-none focus:border-b focus:border-[#B8973A]/40">We architect websites with simplicity and neatness. Any style and any design, we can architect.</span>
 </motion.p>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 1.2 }}>
 <MagneticButton onClick={scrollToForm}>
 <span className="outline-none" onClick={(e) => e.stopPropagation()}>Commence Project</span>
 </MagneticButton>
 </motion.div>
 </div>

 {/* Right: Sphere Image */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: prefersReducedMotion ? 0 : 1.2, delay: 0.6 }}
 className="flex items-center justify-center lg:justify-end">
 <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]">
 <div className="absolute inset-0 rounded-full bg-[#B8973A]/10 blur-3xl" />
 <div className="absolute inset-0 rounded-full bg-[#F0EBE1] overflow-hidden border border-[#E5DDD0]">
 <img
 src={HERO_IMAGE}
 alt="Polished sphere with gold light reflection"
 className="w-full h-full object-cover" />
 </div>
 </div>
 </motion.div>
 </div>
 </div>

 {/* Scroll indicator */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 2, duration: 1 }}
 className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
 <span className="text-[#7A6E62] text-[10px] tracking-[0.3em] uppercase font-body">Scroll</span>
 <motion.div
 animate={{ y: [0, 8, 0] }}
 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
 className="w-px h-8 bg-gradient-to-b from-[#B8973A] to-transparent" />
 </motion.div>
 </section>);

}