'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, ShoppingBag, X, Star, Plus, Minus, Trash2,
  ChevronLeft, ChevronRight, MessageCircle, ShieldCheck,
  CreditCard, Truck, Menu, CheckCircle2
} from "lucide-react";

// استدعاء عميل Supabase المربوط بملف supabase.ts
import { supabase } from "@/supabase";

/* ============================= DESIGN TOKENS ============================= */
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
  whatsapp: "#25D366",
};

const WHATSAPP_NUMBER = "201010425992";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس",
  "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ",
  "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج",
];

/* ============================= CATEGORY DATA ============================= */
interface Category {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "skincare", name: "العناية بالبشرة", icon: "🧴" },
  { id: "haircare", name: "العناية بالشعر", icon: "💇‍♀️" },
  { id: "bodycare", name: "العناية بالجسم", icon: "🧼" },
  { id: "makeup", name: "المكياج", icon: "💄" },
  { id: "perfume", name: "العطور", icon: "🌸" },
  { id: "accessories", name: "الإكسسوارات", icon: "🎀" },
  { id: "salon", name: "مستلزمات الكوافير", icon: "✂️" },
];

const catById = (id: string) => CATEGORIES.find((c) => c.id === id);

/* ============================= RAW PRODUCT SEED ============================= */
type RawProductTuple = [string, string, string, string, number, number | null, boolean, boolean, boolean, boolean, string];

const RAW: RawProductTuple[] = [
  ["كريم أساس مطفي للبشرة الدهنية", "L'Oréal Paris", "makeup", "الوجه", 420, 480, false, true, false, false, "https://m.media-amazon.com/images/I/51J79-cUeRL._AC_SL1500_.jpg"],
  ["كونسيلر لتغطية الهالات السوداء", "Maybelline New York", "makeup", "الوجه", 210, null, true, false, false, true, "https://i.makeup.ae/a/ah/ah1tq2cjhyus.jpg"],
  ["باودر مضغوط شفاف طويل الثبات", "Essence", "makeup", "الوجه", 180, 220, false, false, false, true, "💄"],
  ["بلاشر كريمي بلمسة وردية طبيعية", "NYX Professional Makeup", "makeup", "الوجه", 260, null, false, false, true, false, "💄"],
  ["ماسكارا تكثيف وتطويل مقاومة للماء", "Maybelline New York", "makeup", "العيون", 320, 380, false, true, false, false, "https://cdn.salla.sa/XjKDR/35898ce7-7dcb-43ac-8daa-8df0b7dab1fc-1000x1000-uJa133Dp96TT9eAJoRSDufsh88udJ8HbcysMoyLt.jpg"],
  ["آيلاينر سائل دقيق مقاوم للماء", "NYX Professional Makeup", "makeup", "العيون", 190, null, true, false, false, false, "👁️"],
  ["غسول منظف بالزنك للبشرة الدهنية", "CeraVe", "skincare", "غسول", 380, 450, false, true, false, false, "🧴"],
  ["غسول لطيف بدون رغوة للبشرة الحساسة", "La Roche-Posay", "skincare", "غسول", 420, null, false, false, true, false, "🧴"],
  ["سيروم فيتامين سي 23% للتفتيح", "The Ordinary", "skincare", "سيروم", 380, 450, false, true, false, false, "🧪"],
  ["سيروم نياسيناميد 10% لتقليل المسام", "The Ordinary", "skincare", "سيروم", 260, null, false, false, true, false, "🧪"],
  ["واقي شمس SPF50 غير دهني", "La Roche-Posay", "skincare", "واقي الشمس", 480, 560, false, true, true, false, "☀️"],
  ["شامبو بدون سلفات للشعر الجاف", "Kerastase", "haircare", "شامبو", 650, 750, false, false, true, false, "💇‍♀️"],
  ["ماسك مغذي عميق للشعر الجاف", "Schwarzkopf", "haircare", "ماسكات", 320, 380, false, true, false, false, "💇‍♀️"],
  ["علاج مكثف لتساقط الشعر", "Kerastase", "haircare", "علاج الشعر", 720, 850, false, true, true, false, "💇‍♀️"],
  ["لوشن مرطب للجسم بزبدة الشيا", "Jergens", "bodycare", "مرطبات الجسم", 220, 260, false, true, false, false, "🧼"],
  ["عطر نسائي فاخر فانيليا وياسمين", "حسن السنان", "perfume", "عطور نسائية", 480, 560, false, true, true, false, "🌸"],
  ["عطر رجالي خشبي بالعود", "حسن السنان", "perfume", "عطور رجالية", 520, 600, false, true, false, false, "🪵"],
  ["طقم فرش مكياج احترافي 12 قطعة", "Essence", "accessories", "فرش مكياج", 350, 420, false, true, false, false, "🎀"],
  ["مكواة فرد شعر سيراميك احترافية", "Wella", "salon", "أدوات تصفيف", 950, 1100, false, true, true, false, "✂️"],
];

interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  description: string;
  price: number;
  oldPrice: number | null;
  discountPercentage: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  imageUrl: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  qty: number;
}

function makeProducts(): Product[] {
  return RAW.map((r, i) => {
    const [name, brand, category, subCategory, price, oldPrice, isNew, isBestSeller, isFeatured, isOnSale, imageUrl] = r;
    const discountPercentage = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    return {
      id: i + 1,
      sku: `HS-${category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
      name, brand, category, subCategory,
      description: `${name} من ${brand}، منتج أصلي 100% لتوفير أعلى مستوى من العناية.`,
      price, oldPrice: oldPrice || null,
      discountPercentage,
      stock: 8 + ((i * 7) % 40),
      rating: +(4.2 + ((i * 3) % 8) / 10).toFixed(1),
      reviewsCount: 15 + ((i * 11) % 150),
      isNew, isBestSeller, isFeatured,
      isOnSale: !!oldPrice,
      imageUrl: imageUrl || catById(category)?.icon || "✨",
    };
  });
}

/* ============================= HELPERS ============================= */
const egp = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`تقييم ${rating}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={12} fill={n <= full ? T.accent : "none"} color={T.accent} strokeWidth={1.5} />
      ))}
    </span>
  );
}

const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/");

/* ============================= PRODUCT CARD ============================= */
function ProductCard({ p, onOpen, onAddToCart }: { p: Product; onOpen: (p: Product) => void; onAddToCart: (p: Product) => void }) {
  return (
    <div
      className="w-64 shrink-0 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl bg-white group"
      style={{ borderColor: T.cardBorder }}
    >
      <div className="relative cursor-pointer p-4 bg-slate-50/50" onClick={() => onOpen(p)}>
        <div className="h-44 rounded-xl bg-white flex items-center justify-center text-5xl relative border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
          {isUrl(p.imageUrl) ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
          ) : (
            <span>{p.imageUrl}</span>
          )}

          {p.isOnSale && (
            <span className="absolute top-2 right-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm z-10" style={{ background: T.accentRose }}>
              خصم {p.discountPercentage}%
            </span>
          )}
          {p.isBestSeller && !p.isOnSale && (
            <span className="absolute top-2 right-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm z-10" style={{ background: T.accent }}>
              الأكثر مبيعاً
            </span>
          )}
        </div>
        <div className="mt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: T.accent }}>{p.brand}</span>
          <h3 className="text-xs font-bold line-clamp-2 h-8 leading-snug" style={{ color: T.textMain }}>
            {p.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <Stars rating={p.rating} />
            <span className="text-[10px] font-medium" style={{ color: T.textMuted }}>({p.reviewsCount})</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t flex flex-col gap-3 bg-white" style={{ borderColor: T.cardBorder }}>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-black" style={{ color: T.textMain }}>{egp(p.price)}</span>
          {p.oldPrice && <span className="text-xs line-through font-medium" style={{ color: T.textMuted }}>{egp(p.oldPrice)}</span>}
        </div>
        <button
          onClick={() => onAddToCart(p)}
          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-sm active:scale-95"
          style={{ background: T.primary, color: "#fff" }}
        >
          <Plus size={15} /> أضف للسلة
        </button>
      </div>
    </div>
  );
}

/* ============================= HORIZONTAL SECTION ============================= */
function HorizontalSection({ title, products, onOpen, onAddToCart }: {
  title: string;
  products: Product[];
  onOpen: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex justify-between items-end mb-5 px-4 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: T.textMain }}>
            {title}
          </h2>
          <div className="h-1 w-12 rounded-full mt-1.5" style={{ background: T.accent }} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('right')} className="p-2 rounded-full border bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90" style={{ borderColor: T.cardBorder }}>
            <ChevronRight size={20} />
          </button>
          <button onClick={() => scroll('left')} className="p-2 rounded-full border bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-90" style={{ borderColor: T.cardBorder }}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 px-4 scroll-smooth max-w-7xl mx-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onOpen={onOpen} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

/* ============================= PRODUCT MODAL ============================= */
function ProductModal({ p, onClose, onAddToCart }: { p: Product | null; onClose: () => void; onAddToCart: (p: Product, qty: number) => void }) {
  const [qty, setQty] = useState(1);
  if (!p) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl bg-white border"
        style={{ borderColor: T.cardBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: T.cardBorder }}>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100" style={{ color: T.textMuted }}>كود: {p.sku}</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="h-48 rounded-2xl bg-slate-50 flex items-center justify-center text-6xl border border-slate-100 overflow-hidden">
            {isUrl(p.imageUrl) ? (
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span>{p.imageUrl}</span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: T.accent }}>{p.brand}</span>
            <h2 className="text-lg font-extrabold mt-1" style={{ color: T.textMain }}>{p.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Stars rating={p.rating} />
              <span className="text-xs text-slate-500 font-medium">({p.reviewsCount} تقييم)</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{p.description}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black" style={{ color: T.textMain }}>{egp(p.price)}</span>
            {p.oldPrice && <span className="text-sm line-through text-slate-400 font-medium">{egp(p.oldPrice)}</span>}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border rounded-xl p-1.5 bg-slate-50" style={{ borderColor: T.cardBorder }}>
              <button className="px-2 text-slate-600 hover:text-black" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
              <span className="px-4 text-sm font-bold">{qty}</span>
              <button className="px-2 text-slate-600 hover:text-black" onClick={() => setQty((q) => q + 1)}><Plus size={16} /></button>
            </div>
            <button
              onClick={() => { onAddToCart(p, qty); onClose(); }}
              className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all text-white"
              style={{ background: T.primary }}
            >
              <ShoppingBag size={18} /> إضافة للسلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================= CART DRAWER & CHECKOUT ============================= */
function CartDrawer({ open, onClose, cart, setCart }: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", city: "القاهرة", notes: "" });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (id: number, delta: number) => {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const remove = (id: number) => setCart((c) => c.filter((i) => i.id !== id));

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("الرجاء ملء جميع البيانات المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("orders").insert([
        {
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          total_price: total,
          items: cart,
          status: "جديد",
        },
      ]);

      if (error) {
        console.error("Supabase Error:", error);
      }

      const itemsList = cart
        .map((item, idx) => `${idx + 1}. ${item.name} (${item.qty}x) - ${item.price * item.qty} ج.م`)
        .join("\n");

      const waMessage = `🛍️ *طلب جديد من المتجر*

👤 *بيانات العميل:*
• الاسم: ${formData.name}
• الهاتف: ${formData.phone}
• المحافظة: ${formData.city}
• العنوان: ${formData.address}
${formData.notes ? `• ملاحظات: ${formData.notes}\n` : ""}
📦 *المنتجات المطلوبة:*
${itemsList}

💰 *إجمالي الطلب:* ${total.toLocaleString("ar-EG")} ج.م
📌 *طريقة الدفع:* الدفع عند الاستلام (COD)`;

      setCart([]);
      setShowCheckoutForm(false);
      onClose();

      window.open(waLink(waMessage), "_blank");

    } catch (err) {
      console.error("Error submitting order:", err);
      alert("حدث خطأ، سيتم تحويلك للواتساب مباشرة.");
      window.open(waLink(`طلب جديد بقيمة ${total} ج.م`), "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: T.cardBorder }}>
          <h3 className="font-extrabold flex items-center gap-2 text-sm" style={{ color: T.primary }}>
            {showCheckoutForm ? (
              <>
                <ShieldCheck size={18} color={T.accent} /> إتمام الشراء والتأكيد
              </>
            ) : (
              "سلة المشتريات"
            )}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><X size={20} /></button>
        </div>

        {!showCheckoutForm ? (
          <>
            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100% - 150px)" }}>
              {cart.length === 0 && (
                <div className="text-center py-16 space-y-2">
                  <ShoppingBag size={40} className="mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-500">سلتك فارغة حاليًا</p>
                </div>
              )}
              {cart.map((i) => (
                <div key={i.id} className="flex gap-3 border-b pb-3 items-center" style={{ borderColor: T.cardBorder }}>
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border flex items-center justify-center text-2xl shrink-0 overflow-hidden" style={{ borderColor: T.cardBorder }}>
                    {i.imageUrl && isUrl(i.imageUrl) ? (
                      <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{i.imageUrl || catById(i.category)?.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold line-clamp-1" style={{ color: T.textMain }}>{i.name}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: T.accent }}>{egp(i.price)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateQty(i.id, -1)} className="border rounded-md p-1 hover:bg-slate-50" style={{ borderColor: T.cardBorder }}><Minus size={10} /></button>
                      <span className="text-xs font-extrabold">{i.qty}</span>
                      <button onClick={() => updateQty(i.id, 1)} className="border rounded-md p-1 hover:bg-slate-50" style={{ borderColor: T.cardBorder }}><Plus size={10} /></button>
                      <button onClick={() => remove(i.id)} className="mr-auto text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 p-4 border-t bg-white space-y-3 shadow-lg" style={{ borderColor: T.cardBorder }}>
                <div className="flex justify-between text-sm font-extrabold" style={{ color: T.textMain }}>
                  <span>الإجمالي:</span>
                  <span style={{ color: T.accent }}>{egp(total)}</span>
                </div>
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-md transition-all hover:opacity-90"
                  style={{ background: T.primary }}
                >
                  <CreditCard size={16} /> متابعة لإدخال البيانات
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs" style={{ maxHeight: "calc(100% - 60px)" }}>
            <div className="p-3.5 rounded-xl border flex justify-between items-center" style={{ background: T.accentBg, borderColor: "#FCD34D" }}>
              <span className="font-bold text-amber-900">المبلغ المطلوب عند الاستلام:</span>
              <span className="font-black text-sm text-amber-900">{egp(total)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.primary }}>الاسم بالكامل *</label>
              <input
                type="text" required placeholder="مثال: إبراهيم محمد"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50" style={{ borderColor: T.cardBorder }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.primary }}>رقم الهاتف (واتساب) *</label>
              <input
                type="tel" required placeholder="010xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50" style={{ borderColor: T.cardBorder }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.primary }}>المحافظة *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50" style={{ borderColor: T.cardBorder }}
              >
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: T.primary }}>العنوان التفصيلي *</label>
              <textarea
                required rows={2} placeholder="اسم الشارع / رقم العمارة / الشقة"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50" style={{ borderColor: T.cardBorder }}
              />
            </div>

            <div className="p-3 border rounded-xl bg-slate-50" style={{ borderColor: T.cardBorder }}>
              <div className="flex items-center gap-2">
                <Truck size={16} color={T.accent} />
                <span className="font-bold text-slate-800">طريقة الدفع: الدفع عند الاستلام (كاش)</span>
              </div>
              <p className="text-[10px] mt-1 text-slate-500">الدفع يتم نقداً عند معاينة واستلام الشحنة.</p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md text-white"
                style={{ background: T.whatsapp }}
              >
                <MessageCircle size={18} />
                {isSubmitting ? "جاري تسجيل الطلب..." : "تأكيد الطلب وإرسال عبر واتساب"}
              </button>

              <button
                type="button" onClick={() => setShowCheckoutForm(false)}
                className="w-full py-1.5 text-xs text-center block underline text-slate-500 hover:text-black"
              >
                الرجوع وتعديل السلة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================= MAIN STORE APP ============================= */
export default function StoreApp() {
  const [products] = useState<Product[]>(makeProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.name.includes(searchQuery) || p.brand.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller), [products]);
  const saleProducts = useMemo(() => products.filter((p) => p.isOnSale), [products]);

  const handleAddToCart = (p: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) {
        return prev.map((item) => (item.id === p.id ? { ...item, qty: item.qty + qty } : item));
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, category: p.category, imageUrl: p.imageUrl, qty }];
    });
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: T.bg, color: T.textMain }}>
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <CheckCircle2 size={13} color={T.accent} />
        <span>شحن سريع لجميع محافظات مصر - التوصيل والدفع عند الاستلام</span>
      </div>

      {/* Main Header / Navigation Bar — Sticky Shrinking Header */}
      <header
        className={`sticky top-0 z-40 bg-white border-b transition-all duration-300 ease-in-out ${
          isScrolled ? "py-2 shadow-md" : "py-4 sm:py-6 shadow-sm"
        }`}
        style={{ borderColor: T.cardBorder }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100">
            <Menu size={24} />
          </button>

          {/* Logo Area */}
          <div 
            className="flex items-center cursor-pointer transition-transform hover:scale-105 py-1" 
            onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
          >
            <img 
              src="/logo.jpg" 
              alt="حسن السنان" 
              className={`w-auto object-contain mix-blend-multiply transition-all duration-300 ease-in-out ${
                isScrolled ? "h-14 sm:h-16 md:h-20" : "h-32 sm:h-40 md:h-48 max-h-48"
              }`}
            />
          </div>

          {/* Desktop Navbar Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-extrabold text-slate-700">
            <button
              onClick={() => setActiveCategory("all")}
              className={`hover:text-amber-600 transition-colors ${activeCategory === "all" ? "text-amber-600 border-b-2 border-amber-600 pb-1" : ""}`}
            >
              الرئيسية
            </button>
            {CATEGORIES.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`hover:text-amber-600 transition-colors ${activeCategory === c.id ? "text-amber-600 border-b-2 border-amber-600 pb-1" : ""}`}
              >
                {c.name}
              </button>
            ))}
          </nav>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <input
              type="text" 
              placeholder="ابحث عن منتج أو ماركة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-full pl-4 pr-9 py-2 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500" 
              style={{ borderColor: T.cardBorder }}
            />
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-3 rounded-full border bg-slate-50 text-slate-800 transition-all hover:bg-slate-100 active:scale-95"
            style={{ borderColor: T.cardBorder }}
          >
            <ShoppingBag size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-sm" style={{ background: T.accentRose }}>
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-b p-4 space-y-2 text-xs font-bold border-slate-200">
            <button onClick={() => { setActiveCategory("all"); setMenuOpen(false); }} className="block w-full text-right py-2 border-b">الرئيسية</button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveCategory(c.id); setMenuOpen(false); }}
                className="block w-full text-right py-2 border-b text-slate-700"
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Hero Banner */}
      {activeCategory === "all" && !searchQuery && (
        <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white py-12 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
              منتجات أصلية 100%
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              عالمك المتكامل للعناية بالبشرة والتجميل
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl mx-auto font-medium">
              تصفحي أفضل الماركات العالمية والمحلية بأسعار خاصة وشحن سريع لكل مصر.
            </p>
          </div>
        </section>
      )}

      {/* Main Content Areas */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-100"}`}
            style={{ borderColor: activeCategory === "all" ? T.primary : T.cardBorder }}
          >
            ✨ الكل
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === c.id ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 hover:bg-slate-100"}`}
              style={{ borderColor: activeCategory === c.id ? T.accent : T.cardBorder }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Horizontal Sections (Only on Home & No active Search) */}
        {activeCategory === "all" && !searchQuery && (
          <>
            <HorizontalSection
              title="🔥 الأكثر مبيعاً"
              products={bestSellers}
              onOpen={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
            <HorizontalSection
              title="💥 عروض وخصومات خاصة"
              products={saleProducts}
              onOpen={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          </>
        )}

        {/* Catalog Grid Section */}
        <section className="my-10">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold" style={{ color: T.textMain }}>
              {activeCategory === "all" ? "جميع المنتجات" : catById(activeCategory)?.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">عرض {filteredProducts.length} منتج</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border rounded-2xl" style={{ borderColor: T.cardBorder }}>
              <Search size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">لم نجد أي منتجات تطابق البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onOpen={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="!bg-slate-900 border-t mt-20" style={{ borderColor: T.cardBorder, backgroundColor: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h3 className="!text-white text-base font-extrabold mb-3" style={{ color: "#FFFFFF" }}>حسن السنان</h3>
            <p className="!text-gray-100 leading-relaxed" style={{ color: "#F3F4F6" }}>
              متجرك المتخصص الأول لمستحضرات التجميل والعناية بالبشرة والشعر. نضمن لك جودة وأصالة كافة المنتجات مع أسرع خدمة توصيل.
            </p>
          </div>

          <div>
            <h4 className="!text-white font-bold mb-3 text-sm" style={{ color: "#FFFFFF" }}>خدمة العملاء</h4>
            <ul className="space-y-2 !text-gray-100" style={{ color: "#F3F4F6" }}>
              <li style={{ color: "#F3F4F6" }}>الشحن والتوصيل لجميع المحافظات</li>
              <li style={{ color: "#F3F4F6" }}>سياسة الاستبدال والاسترجاع</li>
              <li style={{ color: "#F3F4F6" }}>الدفع كاش عند الاستلام</li>
            </ul>
          </div>

          <div>
            <h4 className="!text-white font-bold mb-3 text-sm" style={{ color: "#FFFFFF" }}>فروعنا</h4>
            <ul className="space-y-3 !text-gray-100" style={{ color: "#F3F4F6" }}>
              <li className="leading-relaxed" style={{ color: "#F3F4F6" }}>
                <span className="!text-white block font-bold" style={{ color: "#FFFFFF" }}>الفرع الأول</span>
                الزقازيق - شارع الحمام
              </li>
              <li className="leading-relaxed" style={{ color: "#F3F4F6" }}>
                <span className="!text-white block font-bold" style={{ color: "#FFFFFF" }}>الفرع الثاني</span>
                الزقازيق - شارع الأمن الغذائي بجوار مسجد الخشاب
                <span className="block" style={{ color: "#F3F4F6" }}>Zagazig, Egypt, 44511</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="!text-white font-bold mb-3 text-sm" style={{ color: "#FFFFFF" }}>تواصل معنا</h4>
            <p className="!text-gray-100 mb-3" style={{ color: "#F3F4F6" }}>لأي استفسار أو طلب خاص عبر الواتساب:</p>
            <a
              href={waLink("مرحباً حسن السنان، أود الاستفسار عن المنتجات")}
              target="_blank"
              rel="noreferrer"
              className="!text-white inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-green-600 hover:bg-green-700 transition-all"
              style={{ color: "#FFFFFF" }}
            >
              <MessageCircle size={16} color="#FFFFFF" /> تواصل عبر الواتساب
            </a>

            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.instagram.com/hassan.alsanan"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: T.accent }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@hassan.alsanan"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="p-2.5 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: T.accent }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.6h-3.1v13.9c0 1.62-1.32 2.94-2.94 2.94a2.94 2.94 0 0 1-2.94-2.94 2.94 2.94 0 0 1 2.94-2.94c.29 0 .57.04.83.12v-3.15a6.1 6.1 0 0 0-.83-.06A6.06 6.06 0 0 0 3.1 18.05a6.06 6.06 0 0 0 6.06 6.06 6.06 6.06 0 0 0 6.06-6.06V9.68a8.5 8.5 0 0 0 4.96 1.58V8.16c-1.16 0-2.28-.4-3.18-1.13a5.6 5.6 0 0 1-.4-1.21z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/p/%D8%AD%D8%B3%D9%86-%D8%A7%D9%84%D8%B3%D9%86%D8%A7%D9%86-%D9%84%D9%85%D8%B3%D8%AA%D8%AD%D8%B6%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D8%AC%D9%85%D9%8A%D9%84-61567231881425/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-2.5 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: T.accent }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 text-center py-4 text-[11px] !text-gray-100" style={{ color: "#F3F4F6" }}>
          جميع الحقوق محفوظة © {new Date().getFullYear()} - حسن السنان
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductModal
        p={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />

    </div>
  );
}