import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Upload, Check, ArrowLeft, ArrowRight, Loader2, X, FileCheck2 } from "lucide-react";

const EMPTY = {
  business_name: "", business_email: "", business_description: "", three_things: "",
  on_google_maps: null, google_maps_link: "",
  inspiration_websites: "", color_preferences: "", overall_feeling: "", font_preferences: "",
  page_count: "", special_functionality: "", logo_url: "", photo_urls: [],
  has_website: null, current_website_link: "", current_website_likes_dislikes: "",
  website_type: "", main_goal: "", other_goal: "",
  social_links: "", testimonials: "",
  contact_methods: [], contact_phone: "", contact_email: "", contact_address: "", contact_hours: "",
};

const SECTIONS = [
  "Business Info",
  "Design Preferences",
  "Scope & Logistics",
  "Current State",
  "Business Goals",
  "Contact Info",
];

const WEBSITE_TYPES = ["E-commerce", "Business site", "Portfolio", "Blogs", "Booking website"];
const MAIN_GOALS = [
  "Get more phone calls", "Get more inquiries/leads", "Get more bookings",
  "Sell products", "Build credibility", "Provide information",
  "Showcase my work", "Other",
];
const CONTACT_METHODS = ["Business phone", "Address", "Business hours", "Social media"];

function Field({ label, required, children, hint }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#1C1810] text-sm font-body font-semibold">
        {label}{required && <span className="text-[#B8973A] ml-1">*</span>}
      </Label>
      {hint && <p className="text-[#7A6E62] text-xs font-body font-light">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-[#DDD4C0] rounded-md text-[#1C1810] text-base font-body py-3 px-4 focus:border-[#B8973A] focus:outline-none focus:ring-1 focus:ring-[#B8973A] transition-colors duration-300 placeholder:text-[#7A6E62]/60";

export default function OnboardingForm() {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0); // 0 = intro
  const [draftId, setDraftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState("");
  const ready = useRef(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!mounted) return;
        setUser(me);
        // Load an existing draft or detect a submitted application.
        const mine = await base44.entities.Application.filter(
          { created_by_id: me.id },
          "-updated_date",
          20
        );
        const draft = mine.find((a) => a.status === "draft");
        const submittedRec = mine.find((a) => ["new", "reviewing"].includes(a.status));
        if (submittedRec) {
          setSubmitted(true);
        } else if (draft) {
          setDraftId(draft.id);
          setForm({ ...EMPTY, ...draft });
          setStep(1);
        }
      } catch {
        // not signed in — guard, but the route is protected
      } finally {
        if (mounted) {
          setLoading(false);
          setTimeout(() => { ready.current = true; }, 600);
        }
      }
    })();
    return () => { mounted = false; if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  // Debounced auto-save of the draft.
  useEffect(() => {
    if (!ready.current || !user || submitted || step === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveDraft(false); }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const saveDraft = async (announce) => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = { ...form, name: user.full_name || "", email: user.email || "", status: "draft" };
      let id = draftId;
      if (id) {
        await base44.entities.Application.update(id, payload);
      } else {
        const rec = await base44.entities.Application.create(payload);
        id = rec.id;
        setDraftId(id);
      }
      setSavedAt(Date.now());
      if (announce) toast({ title: "Progress saved", description: "You can come back and finish later." });
    } catch (e) {
      // silent autosave failures; surface only on explicit save
      if (announce) toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (s) => {
    const f = form;
    if (s === 1) {
      if (!f.business_name?.trim()) return "Please enter your business name.";
      if (!f.business_email?.trim()) return "Please enter your business email.";
      if (!f.business_description?.trim()) return "Please describe your business.";
      if (!f.three_things?.trim()) return "Please share three things people should know.";
      if (f.on_google_maps === true && !f.google_maps_link?.trim()) return "Please paste your Google Maps link.";
    }
    if (s === 2) {
      if (!f.inspiration_websites?.trim()) return "Please share 2–3 websites you admire.";
      if (!f.overall_feeling?.trim()) return "Please choose an overall feeling.";
    }
    if (s === 3) {
      if (!f.page_count?.trim()) return "Please enter how many pages you'd like.";
      if (!f.special_functionality?.trim()) return "Please describe any features you'd like.";
    }
    if (s === 4) {
      if (f.has_website === null) return "Please choose Yes or No.";
      if (f.has_website === true) {
        if (!f.current_website_link?.trim()) return "Please provide your current website link.";
        if (!f.current_website_likes_dislikes?.trim()) return "Please tell us what you like and dislike.";
      }
    }
    if (s === 5) {
      if (!f.website_type?.trim()) return "Please choose a website type.";
      if (!f.main_goal?.trim()) return "Please choose your main goal.";
      if (f.main_goal === "Other" && !f.other_goal?.trim()) return "Please describe your other goal.";
    }
    if (s === 6) {
      if (!f.contact_methods || f.contact_methods.length === 0) return "Please select at least one contact method.";
      if (f.contact_methods.includes("Business phone") && !f.contact_phone?.trim()) return "Please add your business phone.";
      if (f.contact_methods.includes("Address") && !f.contact_address?.trim()) return "Please add your address.";
      if (f.contact_methods.includes("Business hours") && !f.contact_hours?.trim()) return "Please add your business hours.";
    }
    return null;
  };

  const next = async () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    await saveDraft(false);
    setStep((s) => Math.min(s + 1, 6));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    const err = validateStep(6);
    if (err) { setError(err); return; }
    setError("");
    setSubmitting(true);
    try {
      // Ensure a draft exists so we have an id to submit.
      let id = draftId;
      if (!id) {
        const rec = await base44.entities.Application.create({
          ...form, name: user.full_name || "", email: user.email || "", status: "draft"
        });
        id = rec.id;
        setDraftId(id);
      }
      const res = await base44.functions.invoke("submitApplication", { application_id: id, ...form });
      if (res?.data?.error) throw new Error(res.data.error);
      setSubmitted(true);
      toast({ title: "Application submitted", description: "We'll review it and reach out soon." });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 429) {
        setError("You already submitted recently. Please wait a few minutes before trying again.");
      } else {
        setError(e?.response?.data?.error || e?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setField("logo_url", res.file_url);
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const urls = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadFile({ file });
        urls.push(res.file_url);
      }
      setForm((p) => ({ ...p, photo_urls: [...(p.photo_urls || []), ...urls] }));
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const toggleMethod = (m) => {
    setForm((p) => {
      const has = p.contact_methods.includes(m);
      return { ...p, contact_methods: has ? p.contact_methods.filter((x) => x !== m) : [...p.contact_methods, m] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#B8973A] animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className="py-16 text-center">
        <div className="w-14 h-14 rounded-full border border-[#B8973A]/40 flex items-center justify-center mx-auto mb-6">
          <Check className="w-6 h-6 text-[#B8973A]" />
        </div>
        <h3 className="font-body text-2xl text-[#1C1810] font-semibold mb-3">Application Received</h3>
        <p className="text-[#7A6E62] text-sm font-body max-w-md mx-auto leading-relaxed">
          Thank you. We're reviewing your submission and will be in touch soon. Please don't purchase the build fee yet — we'll let you know exactly when to do so.
        </p>
      </motion.div>
    );
  }

  const progress = step === 0 ? 0 : (step / 6) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress + save indicator */}
      {step > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#B8973A] text-[10px] tracking-[0.3em] uppercase font-body">
              Step {step} of 6 — {SECTIONS[step - 1]}
            </span>
            <span className="text-[#7A6E62] text-[11px] font-body flex items-center gap-1.5">
              {saving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
              ) : savedAt ? (
                <><Check className="w-3 h-3 text-[#B8973A]" /> Saved</>
              ) : null}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#E5DDD0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#B8973A]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            className="space-y-6">
            <div className="bg-[#F5F0E8] border border-[#E5DDD0] rounded-xl p-7 md:p-9">
              <p className="text-[#B8973A] text-[10px] tracking-[0.4em] uppercase font-body mb-5">Things to Know</p>
              <ul className="space-y-4 text-[#1C1810] text-sm md:text-[15px] font-body font-light leading-relaxed">
                <li className="flex gap-3"><span className="text-[#B8973A] mt-0.5">•</span><span>Please do not buy the Build Fee yet; we will let you know when to do so.</span></li>
                <li className="flex gap-3"><span className="text-[#B8973A] mt-0.5">•</span><span>Once you begin the form, please submit it within 4 days so we can keep your project moving forward.</span></li>
                <li className="flex gap-3"><span className="text-[#B8973A] mt-0.5">•</span><span>You will need to purchase your own domain. We will provide instructions when it is time to connect it to your website.</span></li>
              </ul>
            </div>
            <p className="text-[#7A6E62] text-sm font-body font-light leading-relaxed text-center px-4">
              This form takes about 10–15 minutes. Don't worry if you don't have an answer for everything — we'll guide you through it and can make design decisions for you when needed. Your progress saves automatically.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="px-8 py-4 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-[10px] min-h-[48px] flex items-center focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#F0EBE1]">
                Begin Form <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {step > 0 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
            className="space-y-7">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <Field label="What is your business name?" required>
                  <input className={inputCls} value={form.business_name} onChange={(e) => setField("business_name", e.target.value)} placeholder="Your business name" />
                </Field>
                <Field label="What is your business email?" required>
                  <input type="email" className={inputCls} value={form.business_email} onChange={(e) => setField("business_email", e.target.value)} placeholder="hello@yourbusiness.com" />
                </Field>
                <Field label="What does your business do / sell / provide in 1–2 sentences?" required>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.business_description} onChange={(e) => setField("business_description", e.target.value)} placeholder="We help people…" />
                </Field>
                <Field label="What are three things you'd like someone to know about your business?" required>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.three_things} onChange={(e) => setField("three_things", e.target.value)} placeholder="1. … 2. … 3. …" />
                </Field>
                <Field label="Are you listed on Google Maps?">
                  <RadioGroup value={form.on_google_maps === null ? "" : form.on_google_maps ? "yes" : "no"} onValueChange={(v) => setField("on_google_maps", v === "yes")} className="flex gap-6">
                    {[{ v: "yes", l: "Yes" }, { v: "no", l: "No" }].map((o) => (
                      <div key={o.v} className="flex items-center gap-2">
                        <RadioGroupItem value={o.v} id={`gmaps-${o.v}`} />
                        <Label htmlFor={`gmaps-${o.v}`} className="text-[#1C1810] text-sm font-body cursor-pointer">{o.l}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Field>
                {form.on_google_maps && (
                  <Field label="Please share the Google Maps link" required>
                    <input className={inputCls} value={form.google_maps_link} onChange={(e) => setField("google_maps_link", e.target.value)} placeholder="https://maps.google.com/…" />
                  </Field>
                )}
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <Field label="Share 2–3 websites you admire and tell us what you like about each one." required>
                  <textarea className={`${inputCls} resize-none`} rows={4} value={form.inspiration_websites} onChange={(e) => setField("inspiration_websites", e.target.value)} placeholder="https://example.com — I like the clean layout…&#10;https://example2.com — …" />
                </Field>
                <Field label="What colors might fit your business? Any you'd dislike?" hint="If you're not sure, we'll choose colors that fit your brand.">
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.color_preferences} onChange={(e) => setField("color_preferences", e.target.value)} placeholder="I like warm neutrals. I'd avoid bright pink." />
                </Field>
                <Field label="What overall feeling would you like your website to show?" required hint="e.g. Luxurious, professional, playful, simple, bold, sleek">
                  <input className={inputCls} value={form.overall_feeling} onChange={(e) => setField("overall_feeling", e.target.value)} placeholder="Professional and sleek" />
                </Field>
                <Field label="Any font preferences?" hint="It's fine if you don't know; we can always pick for you.">
                  <input className={inputCls} value={form.font_preferences} onChange={(e) => setField("font_preferences", e.target.value)} placeholder="No preference" />
                </Field>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <Field label="How many pages would you want on this project?" required hint="Standard Plan covers 5–10 pages.">
                  <input type="number" min={5} max={10} className={inputCls} value={form.page_count} onChange={(e) => setField("page_count", e.target.value)} placeholder="e.g. 7" />
                </Field>
                <Field label="Any specific functionality or special features you'd like?" required hint="e.g. contact forms, booking a call, requesting a quote, login page, selling a product">
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.special_functionality} onChange={(e) => setField("special_functionality", e.target.value)} placeholder="A contact form and a quote request form…" />
                </Field>
                <Field label="Do you have a logo you can share with us?" hint="Please upload a high-resolution PNG/JPG/JPEG with a transparent background.">
                  {form.logo_url ? (
                    <div className="flex items-center gap-3 bg-white border border-[#DDD4C0] rounded-md p-3">
                      <FileCheck2 className="w-5 h-5 text-[#B8973A]" />
                      <span className="text-[#1C1810] text-sm font-body flex-1 truncate">Logo uploaded</span>
                      <button type="button" onClick={() => setField("logo_url", "")} className="text-[#7A6E62] hover:text-[#1C1810]"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 bg-white border border-dashed border-[#DDD4C0] rounded-md p-3 cursor-pointer hover:border-[#B8973A] transition-colors">
                      {uploadingLogo ? <Loader2 className="w-5 h-5 text-[#B8973A] animate-spin" /> : <Upload className="w-5 h-5 text-[#B8973A]" />}
                      <span className="text-[#7A6E62] text-sm font-body">{uploadingLogo ? "Uploading…" : "Click to upload logo"}</span>
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={uploadLogo} disabled={uploadingLogo} />
                    </label>
                  )}
                </Field>
                <Field label="Any photos of products, professional shots, office, or specific images to include?">
                  <label className="flex items-center gap-3 bg-white border border-dashed border-[#DDD4C0] rounded-md p-3 cursor-pointer hover:border-[#B8973A] transition-colors">
                    {uploadingPhotos ? <Loader2 className="w-5 h-5 text-[#B8973A] animate-spin" /> : <Upload className="w-5 h-5 text-[#B8973A]" />}
                    <span className="text-[#7A6E62] text-sm font-body">{uploadingPhotos ? "Uploading…" : "Click to upload photos (multiple allowed)"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={uploadPhotos} disabled={uploadingPhotos} />
                  </label>
                  {form.photo_urls?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.photo_urls.map((u, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white border border-[#DDD4C0] rounded-md p-3">
                          <FileCheck2 className="w-5 h-5 text-[#B8973A]" />
                          <span className="text-[#1C1810] text-sm font-body flex-1 truncate">Photo {i + 1}</span>
                          <a href={u} target="_blank" rel="noreferrer" className="text-[#B8973A] text-xs font-body">View</a>
                          <button type="button" onClick={() => setForm((p) => ({ ...p, photo_urls: p.photo_urls.filter((_, idx) => idx !== i) }))} className="text-[#7A6E62] hover:text-[#1C1810]"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <Field label="Do you currently have a website?" required>
                  <RadioGroup value={form.has_website === null ? "" : form.has_website ? "yes" : "no"} onValueChange={(v) => setField("has_website", v === "yes")} className="flex gap-6">
                    {[{ v: "yes", l: "Yes" }, { v: "no", l: "No" }].map((o) => (
                      <div key={o.v} className="flex items-center gap-2">
                        <RadioGroupItem value={o.v} id={`hw-${o.v}`} />
                        <Label htmlFor={`hw-${o.v}`} className="text-[#1C1810] text-sm font-body cursor-pointer">{o.l}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-[#7A6E62] text-xs font-body font-light pt-2">If not, just select "No" and continue to the next section.</p>
                </Field>
                {form.has_website && (
                  <>
                    <Field label="Please provide the link" required>
                      <input className={inputCls} value={form.current_website_link} onChange={(e) => setField("current_website_link", e.target.value)} placeholder="https://your-current-site.com" />
                    </Field>
                    <Field label="What do you like and dislike about your website?" required>
                      <textarea className={`${inputCls} resize-none`} rows={3} value={form.current_website_likes_dislikes} onChange={(e) => setField("current_website_likes_dislikes", e.target.value)} placeholder="I like… I dislike…" />
                    </Field>
                  </>
                )}
              </>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <>
                <Field label="What type of website do you want?" required>
                  <RadioGroup value={form.website_type} onValueChange={(v) => setField("website_type", v)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {WEBSITE_TYPES.map((t) => (
                      <div key={t} className="flex items-center gap-2 bg-white border border-[#DDD4C0] rounded-md px-3 py-2.5">
                        <RadioGroupItem value={t} id={`wt-${t}`} />
                        <Label htmlFor={`wt-${t}`} className="text-[#1C1810] text-sm font-body cursor-pointer">{t}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Field>
                <Field label="What is the main goal of your website?" required>
                  <RadioGroup value={form.main_goal} onValueChange={(v) => setField("main_goal", v)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MAIN_GOALS.map((g) => (
                      <div key={g} className="flex items-center gap-2 bg-white border border-[#DDD4C0] rounded-md px-3 py-2.5">
                        <RadioGroupItem value={g} id={`mg-${g}`} />
                        <Label htmlFor={`mg-${g}`} className="text-[#1C1810] text-sm font-body cursor-pointer">{g}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Field>
                {form.main_goal === "Other" && (
                  <Field label="Please describe your goal" required>
                    <input className={inputCls} value={form.other_goal} onChange={(e) => setField("other_goal", e.target.value)} placeholder="My goal is…" />
                  </Field>
                )}
              </>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <>
                <Field label="What contact information should appear on your website?" required>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CONTACT_METHODS.map((m) => (
                      <label key={m} className="flex items-center gap-3 bg-white border border-[#DDD4C0] rounded-md px-3 py-2.5 cursor-pointer">
                        <Checkbox checked={form.contact_methods.includes(m)} onCheckedChange={() => toggleMethod(m)} />
                        <span className="text-[#1C1810] text-sm font-body">{m}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                {form.contact_methods.includes("Business phone") && (
                  <Field label="Business phone" required>
                    <input className={inputCls} value={form.contact_phone} onChange={(e) => setField("contact_phone", e.target.value)} placeholder="(859) 000-0000" />
                  </Field>
                )}
                {form.contact_methods.includes("Address") && (
                  <Field label="Address" required>
                    <textarea className={`${inputCls} resize-none`} rows={2} value={form.contact_address} onChange={(e) => setField("contact_address", e.target.value)} placeholder="Street, City, State ZIP" />
                  </Field>
                )}
                {form.contact_methods.includes("Business hours") && (
                  <Field label="Business hours" required>
                    <input className={inputCls} value={form.contact_hours} onChange={(e) => setField("contact_hours", e.target.value)} placeholder="Mon–Fri 9am–5pm" />
                  </Field>
                )}
                <Field label="What social media links would you like to display?" hint="Optional">
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.social_links} onChange={(e) => setField("social_links", e.target.value)} placeholder="Instagram: …&#10;Facebook: …" />
                </Field>
                <Field label="Do you have customer testimonials you'd like us to feature?" hint="Paste them below or provide a link. Optional.">
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.testimonials} onChange={(e) => setField("testimonials", e.target.value)} placeholder="“Great service…” — Jane D." />
                </Field>
              </>
            )}

            {error && (
              <p className="text-[#B8973A] text-sm font-body bg-[#B8973A]/[0.07] border border-[#B8973A]/30 rounded-md px-4 py-3">{error}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={back}
                disabled={step <= 1}
                className="flex items-center gap-2 text-[#7A6E62] text-xs tracking-[0.2em] uppercase font-body hover:text-[#1C1810] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-3.5 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-[10px] min-h-[48px] disabled:opacity-50">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#B8973A] text-[#FAF7F2] text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#a5862f] transition-colors duration-300 rounded-[10px] min-h-[48px] disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit Application</>}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => saveDraft(true)}
              disabled={saving}
              className="text-[#7A6E62] text-[11px] tracking-[0.15em] uppercase font-body hover:text-[#B8973A] transition-colors mx-auto block disabled:opacity-50">
              {saving ? "Saving…" : "Save progress & finish later"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}