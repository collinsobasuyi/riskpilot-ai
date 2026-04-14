// components/layout/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, Shield, X } from "lucide-react";
import Container from "../../components/layout/Container";
import ButtonLink from "../../components/ui/ButtonLink";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "/#liability", label: "Liability Shift" },
    { href: "/#problem", label: "The Problem" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#score", label: "Score" },
    { href: "/#industries", label: "Industries" },
    { href: "/#book", label: "Book Call" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-zinc-900 text-lg">RiskPilot AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/assessment" variant="primary" className="text-sm py-2">
              Get Insurability Score
              <ArrowRight className="ml-1 h-3 w-3" />
            </ButtonLink>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-zinc-600" /> : <Menu className="h-6 w-6 text-zinc-600" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-lg py-4 px-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div onClick={() => setIsMenuOpen(false)}>
                <ButtonLink
                  href="/assessment"
                  variant="primary"
                  className="text-sm py-2 justify-center"
                >
                  Get Insurability Score
                  <ArrowRight className="ml-1 h-3 w-3" />
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}