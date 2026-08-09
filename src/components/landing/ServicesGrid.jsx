import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Server, Mail, Wrench, Shield, Headphones } from "lucide-react";

const SERVICES_IMAGE = "https://media.base44.com/images/public/6a41cc1ad003cb8fb7f66133/0fb93d003_generated_20597acb.png";

const services = [
{
 icon: Server,
 title: "Premium Cloud Hosting",
 subtitle: "Global Infrastructure",
 description: "Your site runs on managed cloud infrastructure built for fast, reliable load times, with edge delivery so your pages reach visitors quickly from anywhere.",
 span: "col-span-2 md:col-span-1 md:row-span-2"
},
{
 icon: Mail,
 title: "Professional Email",
 subtitle: "Brand Identity",
 description: "Custom domain email addresses that match your brand. Fully configured and managed on your behalf.",
 span: "col-span-2 md:col-span-1"
},
{
 icon: Wrench,
 title: "Ongoing Maintenance",
 subtitle: "Continuous Evolution",
 description: "Regular updates, performance tuning, and content adjustments to keep your site running smoothly month after month.",
 span: "col-span-2 md:col-span-1"
},
{
 icon: Shield,
 title: "Security & Backups",
 subtitle: "Security First",
 description: "SSL encryption and proactive security practices to keep your site protected and your data safe.",
 span: "col-span-2 md:col-span-1"
},
{
 icon: Headphones,
 title: "Dedicated Support",
 subtitle: "Priority Access",
 description: "A direct line to us. Reach out anytime and we'll respond as quickly as we can.",
 span: "col-span-2 md:col-span-1"
}];


function ServiceCell({ service, index }) {
 const prefersReducedMotion = useReducedMotion();
 const Icon = service.icon;

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-60px" }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : index * 0.1 }}
 className={`${service.span} group relative overflow-hidden rounded-sm border border-[#E5DDD0] bg-[#F5F0E8] p-6 md:p-8
 hover:border-[#B8973A]/40 hover:bg-[#F0EBE1] transition-all duration-500`}>
 {/* Corner metadata */}


 <div className="relative z-10 flex flex-col h-full">
 <div className="w-10 h-10 rounded-sm border border-[#B8973A]/30 flex items-center justify-center mb-5 group-hover:border-[#B8973A]/60 transition-colors duration-500">
 <Icon className="w-5 h-5 text-[#B8973A] -headphones" strokeWidth={1.5} />
 </div>

 <p className="text-[#B8973A] text-[9px] tracking-[0.3em] uppercase mb-2 font-body">
 {service.subtitle}
 </p>

 <h3 className="text-[#1C1810] text-lg font-body font-semibold mb-3">
 <span className="outline-none">{service.title}</span>
 </h3>

 <p className="text-[#7A6E62] text-sm leading-relaxed font-body font-light mt-auto">
 <span className="outline-none">{service.description}</span>
 </p>
 </div>
 </motion.div>);

}

export default function ServicesGrid() {
 const prefersReducedMotion = useReducedMotion();

 return (
 <section id="services" className="relative py-32 md:py-44 bg-[#F0EBE1]">
 {/* Background image strip */}
 <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
 <img src={SERVICES_IMAGE} alt="" className="w-full h-full object-cover" />
 </div>

 <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
 {/* Section header */}
 <div className="mb-16 md:mb-24">
 <motion.p
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
 className="text-[#7A6E62] text-xs tracking-[0.3em] uppercase font-body mb-6 hidden">
 03 — The Service Mosaic
 </motion.p>

 <motion.h2
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.1 }}
 className="text-3xl md:text-5xl text-[#1C1810] max-w-xl [font-family:'Albert_Sans',_sans-serif] font-semibold no-underline not-italic">
 <span className="outline-none">What Your Membership Covers</span>
 </motion.h2>

 <motion.div
 initial={{ scaleX: 0 }}
 whileInView={{ scaleX: 1 }}
 viewport={{ once: true }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.3 }}
 className="w-16 h-px bg-[#B8973A] origin-left mt-6" />
 </div>

 {/* Bento Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
 {services.map((service, i) =>
 <ServiceCell key={i} service={service} index={i} />
 )}
 </div>
 </div>
 </section>);

}