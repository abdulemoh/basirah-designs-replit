import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "When you submit a project application through our contact form, we collect your full name, email address, current website (if provided), and any project details or questions you share with us. When you create an account using Google Sign-In, we receive your name and email address from Google. Payment information is processed securely by Stripe — we never see or store your card details."
  },
  {
    title: "How We Use Your Information",
    body: "We use your contact information to respond to inquiries, discuss your project, and provide the web design services you've requested. Your account email is used to manage your subscription and send service-related communications. We do not sell, rent, or trade your personal information to third parties."
  },
  {
    title: "Third-Party Services",
    body: "We rely on trusted third-party services to operate: Stripe handles all payment processing and subscription management; Google provides authentication for account access. Each of these services has its own privacy policy governing how they handle your data. We encourage you to review their policies."
  },
  {
    title: "Data Retention",
    body: "We retain your application and account information for as long as your account is active or as needed to provide our services. If you cancel your subscription, we keep records of your project work but will remove your personal data upon request."
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can manage or cancel your subscription through your account dashboard. If you have questions about your data, reach out and we will respond promptly."
  },
  {
    title: "Security",
    body: "We take reasonable measures to protect your information using industry-standard security practices. Payment data is encrypted and handled exclusively by Stripe, a PCI-DSS compliant provider. However, no method of transmission over the internet is 100% secure."
  },
  {
    title: "Changes to This Policy",
    body: "We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on this page."
  }
];

export default function PrivacyPolicy() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-32 md:py-40 px-6 md:px-12 lg:px-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mb-16">
          <p className="text-[#B8973A] text-[10px] tracking-[0.4em] uppercase font-body mb-5">Legal</p>
          <h1 className="font-body text-4xl md:text-5xl text-[#1C1810] font-light italic mb-4">Privacy Policy</h1>
          <p className="text-[#7A6E62] text-sm font-body">Last updated: July 2026</p>
          <div className="w-16 h-px bg-[#B8973A] mt-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
          className="space-y-12">
          <p className="text-[#7A6E62] text-base font-body font-light leading-relaxed">
            At Basirah Designs, your privacy matters. This policy explains what information we collect, how we use it, and the choices you have. By using our website and services, you agree to the practices described below.
          </p>

          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : i * 0.05 }}>
              <h2 className="font-body text-xl text-[#1C1810] font-semibold mb-3">{section.title}</h2>
              <p className="text-[#7A6E62] text-base font-body font-light leading-relaxed">{section.body}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            className="pt-8 border-t border-[#E5DDD0]">
            <p className="text-[#7A6E62] text-base font-body font-light leading-relaxed">
              Questions about your privacy? Contact us at{" "}
              <a href="mailto:basirahdesigns@gmail.com" className="text-[#B8973A] font-semibold hover:underline">basirahdesigns@gmail.com</a>
              {" "}or call{" "}
              <a href="tel:8594475611" className="text-[#B8973A] font-semibold hover:underline">859-447-5611</a>.
            </p>
            <Link
              to="/"
              className="inline-block mt-8 text-[#B8973A] text-sm font-body font-semibold tracking-[0.15em] uppercase hover:text-[#a5862f] transition-colors duration-300">
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}