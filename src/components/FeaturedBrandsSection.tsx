'use client';

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const T = {
  bg: "#FAFAFA",
  cardBg: "#FFFFFF",
  cardBorder: "#E5E7EB",
  textMain: "#111827",
  textMuted: "#6B7280",
  primary: "#1E293B",
  primaryHover: "#0F172A",
  accent: "#D97706",
  accentBg: "#FEF3C7",
  accentRose: "#E11D48",
};

const BRAND_LOGOS: string[] = [
  "CLARY",
  "SHAAN",
  "STARVILLE",
  "GLAMY LAB",
  "SEROPIPE",
  "BOBAI",
  "NUTRIVILLE",
  "STRONGVILLE",
];

interface BrandHighlight {
  id: string;
  label: string;
  image: string;
}

const BRAND_HIGHLIGHTS: BrandHighlight[] = [
  { id: "bobai", label: "بوباي", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop" },
  { id: "seropipe", label: "سيروبايب", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop" },
  { id: "superkids", label: "سوبر كيدز", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop" },
  { id: "clary-hair", label: "كلاري مجموعة العناية بالشعر", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" },
  { id: "dermadic", label: "ديرماديك", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
  { id: "glamylab", label: "جلامي لاب", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop" },
];

function BrandLogosStrip() {
  return (
    <div
      className="overflow-x-auto no-scrollbar border-b"
      style={{ borderColor: T.cardBorder }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-8 whitespace-nowrap px-4 py-4 md:gap-12 md:px-8">
        {BRAND_LOGOS.map((name) => (
          <span
            key={name}
            className="shrink-0 cursor-pointer text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-black"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function BrandHighlightsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold md:text-xl" style={{ color: T.textMain }}>
          تسوق حسب البراند
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("right")}
            aria-label="التالي"
            className="rounded-full border bg-white p-2 text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90"
            style={{ borderColor: T.cardBorder }}
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => scroll("left")}
            aria-label="السابق"
            className="rounded-full border bg-white p-2 text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90"
            style={{ borderColor: T.cardBorder }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-6 overflow-x-auto pb-2 scroll-smooth md:gap-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {BRAND_HIGHLIGHTS.map((brand) => (
          <button
            key={brand.id}
            className="group flex shrink-0 flex-col items-center gap-3"
            type="button"
          >
            <div
              className="h-28 w-28 overflow-hidden rounded-full border-2 shadow-sm transition-transform duration-300 group-hover:scale-105 md:h-36 md:w-36"
              style={{
                background: "linear-gradient(180deg, #fffaf4 0%, #fff 100%)",
                borderColor: "rgba(217,119,6,0.12)",
                boxShadow: "0 8px 18px rgba(217,119,6,0.08)",
              }}
            >
              <img
                src={brand.image}
                alt={brand.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <span
              className="max-w-[8rem] text-center text-xs font-bold leading-snug md:text-sm"
              style={{ color: T.textMain }}
            >
              {brand.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeaturedBrandsSection() {
  return (
    <section
      className="rounded-[26px]"
      style={{
        background: "linear-gradient(180deg, rgba(250,250,248,0.9) 0%, rgba(255,255,255,0.4) 100%)",
        border: "1px solid rgba(17,24,39,0.04)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-8">
        <div className="flex items-center justify-center gap-4 text-slate-500">
          <span className="h-px w-10 bg-slate-300" />
          <span
            className="text-[20px] font-black leading-none tracking-[0.08em] text-slate-800 md:text-[30px]"
            style={{
              letterSpacing: "0.08em",
              textShadow: "0 2px 0 rgba(255,255,255,0.7)",
            }}
          >
            حسن السنان
          </span>
          <span className="h-px w-10 bg-slate-300" />
        </div>
      </div>
      <BrandLogosStrip />
      <div className="mx-auto my-10 max-w-7xl px-4 md:px-8">
        <BrandHighlightsCarousel />
      </div>
    </section>
  );
}
