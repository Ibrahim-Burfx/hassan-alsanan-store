'use client';

import Link from "next/link";
import React from "react";
import { Star, Plus } from "lucide-react";
import type { Product } from "@/lib/products";

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

const isUrl = (str: string) =>
  str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`تقييم ${rating}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          fill={n <= full ? T.accent : "none"}
          color={T.accent}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export default function ProductCard({
  p,
  onAddToCart,
}: {
  p: Product;
  onAddToCart: (p: Product) => void;
}) {
  const mainPrice = Math.floor(p.price);
  const cents = Math.round((p.price - mainPrice) * 100);
  const centsFormatted = cents > 0 ? (cents < 10 ? `0${cents}` : `${cents}`) : "00";
  const savings = p.oldPrice && p.oldPrice > p.price ? Math.round(p.oldPrice - p.price) : 0;

  return (
    <div
      className="w-64 shrink-0 rounded-2xl bg-white hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
      style={{
        border: "1px solid rgba(17,24,39,0.04)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
      }}
    >
      <Link href={`/product/${p.id}`} className="relative block cursor-pointer p-4">
        <div
          className="h-44 rounded-xl p-3 border mb-3 relative overflow-hidden flex items-center justify-center text-5xl"
          style={{
            background: "linear-gradient(180deg, #faf9f6 0%, #ffffff 100%)",
            borderColor: "rgba(17,24,39,0.04)",
          }}
        >
          {isUrl(p.imageUrl) ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <span className="group-hover:scale-105 transition-transform duration-500 ease-out">
              {p.imageUrl}
            </span>
          )}

          {p.isOnSale && p.discountPercentage && (
            <span
              className="absolute top-2.5 right-2.5 bg-[#C8102E] text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md shadow-rose-900/20 z-10 tracking-wider"
              style={{ color: "#FFFFFF", WebkitFontSmoothing: "antialiased" }}
            >
              -{p.discountPercentage}%
            </span>
          )}

          {p.isBestSeller && !p.isOnSale && (
            <span
              className="absolute top-2.5 right-2.5 text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-md z-10"
              style={{
                background: T.accent,
                boxShadow: `0 0 0 3px ${T.accentBg}, 0 4px 10px -2px rgba(217,119,6,0.45)`,
              }}
            >
              الأكثر مبيعاً
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">
            {p.brand}
          </span>
          <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 h-10 leading-snug group-hover:text-black transition-colors">
            {p.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <Stars rating={p.rating} />
            <span className="text-[10px] font-medium" style={{ color: T.textMuted }}>
              ({p.reviewsCount})
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 border-t flex flex-col gap-3 bg-white" style={{ borderColor: T.cardBorder, background: "linear-gradient(180deg, #ffffff 0%, #fffdfb 100%)" }}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline text-slate-900 font-extrabold dir-ltr">
            <span className="text-xs font-semibold mr-1">جنيه</span>
            <span className="text-2xl font-black leading-none tracking-tight">{mainPrice}</span>
            <sup className="text-xs font-extrabold ml-0.5">{centsFormatted}</sup>
          </div>

          {p.oldPrice && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400 line-through text-xs font-semibold">
                {p.oldPrice} جنيه
              </span>
              {savings > 0 && (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  وفرت {savings} ج.م
                </span>
              )}
            </div>
          )}

          {p.isOnSale && (
            <span className="text-[#C8102E] font-bold text-[11px] mt-0.5">عرض لمدة محدودة</span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(p)}
          className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white shadow-md shadow-slate-900/10 hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <Plus size={15} /> أضف للسلة
        </button>
      </div>
    </div>
  );
}
