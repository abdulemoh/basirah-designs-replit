import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, Send } from "lucide-react";

const inputCls =
  "w-full bg-white border border-[#DDD4C0] rounded-md text-[#1C1810] text-base font-body py-3 px-4 focus:border-[#B8973A] focus:outline-none focus:ring-1 focus:ring-[#B8973A] transition-colors duration-300 placeholder:text-[#7A6E62]/60";

export default function SimpleContactForm() {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (!form.message.trim()) return setError("Please enter your question.");
    setError("");
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("sendApplicationAlert", form);
      if (res?.data?.error) throw new Error(res.data.error);
      setSent(true);
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className="py-12 text-center">
        <div className="w-14 h-14 rounded-full border border-[#B8973A]/40 flex items-center justify-center mx-auto mb-6">
          <Check className="w-6 h-6 text-[#B8973A]" />
        </div>
        <h3 className="font-body text-2xl text-[#1C1810] font-semibold mb-3">Thanks — message received</h3>
        <p className="text-[#7A6E62] text-sm font-body max-w-md mx-auto leading-relaxed">
          We've got your question and will reach out soon. If you'd like to start your project now, continue to the full onboarding form below.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <label className="text-[#1C1810] text-sm font-body font-semibold">
          Your Name<span className="text-[#B8973A] ml-1">*</span>
        </label>
        <input className={inputCls} value={form.name} onChange={setField("name")} placeholder="Jane Doe" />
      </div>
      <div className="space-y-2">
        <label className="text-[#1C1810] text-sm font-body font-semibold">
          Email<span className="text-[#B8973A] ml-1">*</span>
        </label>
        <input type="email" className={inputCls} value={form.email} onChange={setField("email")} placeholder="jane@email.com" />
      </div>
      <div className="space-y-2">
        <label className="text-[#1C1810] text-sm font-body font-semibold">
          Your Question<span className="text-[#B8973A] ml-1">*</span>
        </label>
        <textarea className={`${inputCls} resize-none`} rows={5} value={form.message} onChange={setField("message")} placeholder="Tell us who you are and what you'd like to know…" />
      </div>

      {error && (
        <p className="text-[#B8973A] text-sm font-body bg-[#B8973A]/[0.07] border border-[#B8973A]/30 rounded-md px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-8 py-3.5 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-[10px] min-h-[48px] disabled:opacity-50">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send Question <Send className="w-4 h-4" /></>}
      </button>
    </form>
  );
}