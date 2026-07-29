import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <p className="font-body text-xl text-[#1C1810] font-semibold italic mb-1">Basirah Designs</p>
            <p className="text-[#7A6E62] text-xs font-body">High-quality web design for the uncompromising few.

            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-6 md:gap-8">
            {[
            { label: "The Plan", href: "#pricing" },
            { label: "Services", href: "#services" },
            { label: "Process", href: "#process" },
            { label: "Apply", href: "#admission" },
            { label: "Privacy Policy", href: "/privacy-policy" }].
            map((link) =>
            <a
              key={link.href}
              href={link.href}
              className="text-[#7A6E62] text-xs tracking-[0.15em] uppercase font-body hover:text-[#B8973A] transition-colors duration-300
                           focus:outline-none focus:ring-2 focus:ring-[#B8973A] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] rounded-sm">
              
              

              
                {link.label}
              </a>
            )}
          </nav>
        </div>

        <div className="w-full h-px bg-[#E5DDD0] my-8" />

        <div className="flex items-center justify-center">
          <p className="text-[#7A6E62]/70 text-[11px] font-body">
            © {new Date().getFullYear()} Basirah Designs. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>);

}