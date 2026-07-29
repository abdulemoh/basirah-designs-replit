import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserInfo(user);
    } else {
      setUserInfo(null);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuthenticated) return null;

  const displayName = userInfo?.full_name || userInfo?.email?.split("@")[0] || "Member";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-full"
        aria-label="Profile menu">
        <div className="w-10 h-10 rounded-full bg-[#B8973A] flex items-center justify-center text-[#FAF7F2] text-sm font-semibold">
          {initials}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#7A6E62] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl shadow-lg overflow-hidden z-50">
            {/* Profile header */}
            <div className="p-4 border-b border-[#E5DDD0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#B8973A]/10 border border-[#B8973A]/30 flex items-center justify-center text-[#B8973A] text-lg font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[#1C1810] text-sm font-semibold font-body truncate">{displayName}</p>
                  {userInfo?.email && (
                    <p className="text-[#7A6E62] text-xs font-body truncate">{userInfo.email}</p>
                  )}
                </div>
              </div>
              {userInfo?.membership_status && (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-body px-2 py-1 rounded-full ${
                    userInfo.membership_status === "active"
                      ? "bg-[#B8973A]/10 text-[#B8973A]"
                      : "bg-[#7A6E62]/10 text-[#7A6E62]"
                  }`}>
                    {userInfo.membership_status === "active" ? "Active Member" : "Inactive"}
                  </span>
                </div>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={() => { setOpen(false); logout(false); window.location.href = "/login"; }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#7A6E62] text-sm font-body hover:bg-[#F0EBE1] hover:text-[#1C1810] transition-colors duration-200">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}