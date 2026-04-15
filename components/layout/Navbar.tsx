"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Shield, X } from "lucide-react";
import Container from "./Container";

const navLinks = [
  { href: "/#problem", label: "The Problem" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#score", label: "Report" },
  { href: "/#industries", label: "Industries" },
  { href: "/about", label: "About" },
];

const SECTION_IDS = ["problem", "how-it-works", "score", "industries"];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Track active section on homepage via scroll position
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const update = () => {
      const offset = window.scrollY + 120;
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) current = `/#${id}`;
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return activeSection === href;
    return pathname === href;
  };

  return (
    <>
      {/* Top accent stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-blue-700 z-50" />

      <nav className={`fixed top-0.5 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled ? "bg-white/98 backdrop-blur border-b border-slate-200 shadow-sm py-3" : "bg-transparent py-4"
      }`}>
        <Container>
          <div className="flex items-center justify-between gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Shield className="h-5 w-5 text-blue-700" />
              <span className="font-bold text-slate-900 tracking-tight">RiskPilot AI</span>
              <span className="hidden sm:inline-block text-xs text-slate-400 font-normal border-l border-slate-200 pl-2.5 ml-0.5">
                AI Governance
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                    isActive(l.href)
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                  {isActive(l.href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-700" />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href="/assessment"
                className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${
                  pathname === "/assessment"
                    ? "bg-blue-800 text-white"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
              >
                Get Your Governance Score
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
              <div className="flex flex-col divide-y divide-slate-100">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-5 py-3.5 text-sm font-medium transition-colors ${
                      isActive(l.href)
                        ? "text-blue-700 bg-blue-50 border-l-2 border-blue-700"
                        : "text-slate-700 hover:text-blue-700 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="p-4">
                  <Link
                    href="/assessment"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                  >
                    Get Your Governance Score
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </nav>
    </>
  );
}
