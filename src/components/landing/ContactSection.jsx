import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

export default function ContactSection() {
 const prefersReducedMotion = useReducedMotion();
 const { toast } = useToast();
 const [form, setForm] = useState({ name: "", email: "", website: "", message: "" });
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);

 const handleChange = (e) => {
 setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!form.name || !form.email) return;
 setSubmitting(true);
 try {
 await base44.functions.invoke("submitApplication", {
 name: form.name,
 email: form.email,
 website: form.website,
 message: form.message
 });
 setSubmitted(true);
 toast({ title: "Application Received", description: "We'll be in touch within 48 hours." });
 } catch (err) {
 toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
 } finally {
 setSubmitting(false);
 }
 };

 const fields = [
 { name: "name", label: "Full Name", type: "text", required: true },
 { name: "email", label: "Email Address", type: "email", required: true },
 { name: "website", label: "Current Website (if any)", type: "url", required: false },
 { name: "message", label: "Tell us about your project", type: "textarea", required: false }];


 return (
 <section id="admission" className="relative py-32 md:py-44 bg-[#F0EBE1]">
 <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
 <div className="mb-16 md:mb-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
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
 href="mailto:basirahdesigns@gmail.com"
 className="block text-[#1C1810] font-body font-semibold text-lg hover:text-[#B8973A] transition-colors duration-300 hidden">
 basirahdesigns@gmail.com
 </a>
 <a
 href="tel:8594475611"
 className="block text-[#7A6E62] font-body tracking-widest hover:text-[#B8973A] transition-colors duration-300 text-lg">859-447-5611

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
 <span className="outline-none">If there is any system or detailing you would like to apply to your project, please let us know! A reference website works best for us! This is an onboarding form, so please feel free to express your ideas!</span>
 </motion.p>
 </div>

 <div className="max-w-xl">
 {submitted ?
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="py-20 text-center">
 <div className="w-12 h-12 rounded-full border border-[#B8973A]/40 flex items-center justify-center mx-auto mb-6">
 <div className="w-3 h-3 rounded-full bg-[#B8973A]" />
 </div>
 <h3 className="font-body text-2xl text-[#1C1810] font-semibold mb-3">Application Received</h3>
 <p className="text-[#7A6E62] text-sm font-body">
 Our team will review your submission and respond within 48 hours.
 </p>
 </motion.div> :

 <form onSubmit={handleSubmit} className="space-y-10">
 {fields.map((field, i) =>
 <motion.div
 key={field.name}
 initial={{ opacity: 0, y: 15 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : i * 0.1 }}
 className="group">
 <label className="block text-[#1C1810] text-sm font-body font-semibold mb-2">
 {field.label}
 {field.required && <span className="text-[#B8973A] ml-1">*</span>}
 </label>
 {field.type === "textarea" ?
 <textarea
 name={field.name}
 value={form[field.name]}
 onChange={handleChange}
 required={field.required}
 rows={4}
 className="w-full bg-white border border-[#DDD4C0] rounded-md text-[#1C1810] text-base font-body font-medium py-3 px-4
 focus:border-[#B8973A] focus:outline-none focus:ring-1 focus:ring-[#B8973A] transition-colors duration-300
 placeholder:text-[#7A6E62]/60 resize-none"






















 placeholder="Describe your vision..." /> :

 <input
 type={field.type}
 name={field.name}
 value={form[field.name]}
 onChange={handleChange}
 required={field.required}
 className="w-full bg-white border border-[#DDD4C0] text-[#1C1810] text-base font-body font-medium py-3 px-4 focus:border-[#B8973A] focus:outline-none focus:ring-1 focus:ring-[#B8973A] transition-colors duration-300 placeholder:text-[#7A6E62]/60 rounded-lg" />







 }
 </motion.div>
 )}

 <motion.div
 initial={{ opacity: 0, y: 15 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.4 }}
 className="pt-6">
 <button
 type="submit"
 disabled={submitting}
 className="w-full py-5 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#F0EBE1] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] rounded-[10px]">









 {submitting ? "Submitting..." : "Submit Application for Review"}
 </button>
 </motion.div>
 </form>
 }
 </div>
 </div>
 </section>);

}