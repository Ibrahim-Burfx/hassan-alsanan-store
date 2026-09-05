'use client';
import Link from 'next/link'
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, ShoppingBag, X, Star, Plus, Minus, Trash2,
  ChevronLeft, ChevronRight, MessageCircle, ShieldCheck,
  CreditCard, Truck, Menu, CheckCircle2
} from "lucide-react";

// استدعاء عميل Supabase المربوط بملف supabase.ts
import { supabase } from "@/supabase";
import { CATEGORIES, normalizeProduct, type Product, type ProductRow } from "@/lib/products";

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
const CART_STORAGE_KEY = "hassan-al-sinan-cart";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس",
  "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ",
  "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج",
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  qty: number;
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

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path fill="#25F4EE" d="M14.4 2h3.1c.2 1.4.8 2.6 1.8 3.6.9.8 2 1.2 3.2 1.2 3.2v3.1a8.5 8.5 0 0 1-5-1.6v5.1a6.1 6.1 0 1 1-6.1-6.1c.3 0 .6 0 .9.1v3.2a2.9 2.9 0 1 0 2.3 2.8V2h1.8Z" />
      <path fill="#FE2C55" d="M12.9 3.4v12a6.1 6.1 0 0 1-6.1 6.1 6 6 0 0 1-3.5-1.1 6.1 6.1 0 0 0 10.7-4V11a8.5 8.5 0 0 0 5 1.6V9.5c-.8-.2-1.6-.6-2.2-1.2-1-1-1.6-2.2-1.8-3.6h-2.1V3.4Z" />
      <path fill="#111111" d="M13.5 2h3.1c.2 1.4.8 2.6 1.8 3.6.9.8 2 1.2 3.2 1.2v3.1a8.5 8.5 0 0 1-5-1.6v5.1a6.1 6.1 0 1 1-6.1-6.1c.3 0 .6 0 .9.1v3.2a2.9 2.9 0 1 0 2.3 2.8V2h-.2V2Z" />
    </svg>
  );
}

/* ============================= PRODUCT CARD ============================= */
function ProductCard({ p, onAddToCart }: { p: Product; onAddToCart: (p: Product) => void }) {
  return (
    <div
      className="w-64 shrink-0 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl bg-white group"
      style={{ borderColor: T.cardBorder }}
    >
      <Link href={`/product/${p.id}`} className="relative block cursor-pointer p-4 bg-slate-50/50">
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
      </Link>

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
function HorizontalSection({ title, products, onAddToCart }: {
  title: string;
  products: Product[];
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
          <ProductCard key={p.id} p={p} onAddToCart={onAddToCart} />
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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const emptyFormData = { name: "", phone: "", address: "", city: "القاهرة", notes: "" };
  const [formData, setFormData] = useState(emptyFormData);

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
      setFormData(emptyFormData);
      setShowCheckoutForm(false);
      setOrderSuccess(true);

      setTimeout(() => {
        window.location.href = waLink(waMessage);
      }, 2500);

    } catch (err) {
      console.error("Error submitting order:", err);
      setCart([]);
      setFormData(emptyFormData);
      setShowCheckoutForm(false);
      setOrderSuccess(true);
      setTimeout(() => {
        window.location.href = waLink(`طلب جديد بقيمة ${total} ج.م`);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    onClose();
    setOrderSuccess(false);
    setShowCheckoutForm(false);
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={closeDrawer}
      />
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: T.cardBorder }}>
          <h3 className="font-extrabold flex items-center gap-2 text-sm" style={{ color: T.primary }}>
            {orderSuccess ? (
              <>
                <CheckCircle2 size={18} color="#16A34A" /> تم إتمام الطلب
              </>
            ) : showCheckoutForm ? (
              <>
                <ShieldCheck size={18} color={T.accent} /> إتمام الشراء والتأكيد
              </>
            ) : (
              "سلة المشتريات"
            )}
          </h3>
          <button onClick={closeDrawer} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><X size={20} /></button>
        </div>

        {orderSuccess ? (
          <div className="flex flex-col items-center justify-center text-center px-6" style={{ height: "calc(100% - 65px)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "#DCFCE7" }}>
              <CheckCircle2 size={36} color="#16A34A" />
            </div>
            <p className="text-sm font-extrabold leading-relaxed" style={{ color: T.textMain }}>
              تم إتمام طلبك بنجاح! 🎉
            </p>
            <p className="text-xs font-medium leading-relaxed mt-2" style={{ color: T.textMuted }}>
              شكراً لثقتك بمتجر حسن السنان، وسنتواصل معك قريباً لتأكيد الطلب.
            </p>
            <p className="text-[11px] mt-4 text-slate-400">
              جاري تحويلك إلى واتساب الآن...
            </p>
          </div>
        ) : !showCheckoutForm ? (
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
                      <span>{i.imageUrl || "✨"}</span>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Failed to load products:", error);
      } else if (active) {
        setProducts((data as ProductRow[]).map(normalizeProduct));
      }
      if (active) setProductsLoading(false);
    };

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) setCart(JSON.parse(storedCart) as CartItem[]);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setCartHydrated(true);
      if (new URLSearchParams(window.location.search).get("cart") === "open") {
        setCartOpen(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (cartHydrated) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartHydrated]);

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

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen font-sans" style={{ background: T.bg, color: T.textMain }}>
      
      {/* Top Announcement Bar — Infinite RTL Marquee */}
      <div
        className="relative overflow-hidden py-2 shadow-sm"
        style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent}, ${T.primary})` }}
      >
        <div className="flex w-max whitespace-nowrap marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-6">
                  <CheckCircle2 size={15} className="shrink-0" color="#FFFFFF" />
                  <span
                    className="text-xs sm:text-sm font-extrabold tracking-wide"
                    style={{ color: "#FFFFFF" }}
                  >
                    شحن مجاني لفترة محدودة على جميع الطلبات! 🚚
                  </span>
                  <span className="mx-1 text-white/60">•</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <style jsx>{`
          .marquee-track {
            animation: marquee-rtl 22s linear infinite;
          }
          @keyframes marquee-rtl {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @media (max-width: 640px) {
            .marquee-track {
              animation-duration: 14s;
            }
          }
        `}</style>
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
              الكل
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`hover:text-amber-600 transition-colors flex items-center gap-1 ${activeCategory === cat.id ? "text-amber-600 border-b-2 border-amber-600 pb-1" : ""}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </nav>

          {/* Search Input & Cart Trigger Button */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64">
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 rounded-full pl-4 pr-10 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full border bg-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              style={{ borderColor: T.cardBorder }}
            >
              <ShoppingBag size={20} color={T.primary} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white bg-amber-600 shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer / Overlay */}
        {menuOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-4 space-y-3 shadow-md mt-2" style={{ borderColor: T.cardBorder }}>
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 rounded-xl pl-4 pr-10 py-2 text-xs font-semibold focus:outline-none"
              />
              <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
            </div>
            <div className="flex flex-col gap-2 font-bold text-xs">
              <button
                onClick={() => { setActiveCategory("all"); setMenuOpen(false); }}
                className={`p-2 rounded-lg text-right ${activeCategory === "all" ? "bg-amber-50 text-amber-600" : "text-slate-700"}`}
              >
                جميع المنتجات
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setMenuOpen(false); }}
                  className={`p-2 rounded-lg text-right flex items-center gap-2 ${activeCategory === cat.id ? "bg-amber-50 text-amber-600" : "text-slate-700"}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Pills Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "all" ? "bg-amber-600 text-white" : "bg-white border text-slate-700 hover:bg-slate-50"
            }`}
            style={{ borderColor: activeCategory === "all" ? "transparent" : T.cardBorder }}
          >
            ✨ الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                activeCategory === cat.id ? "bg-amber-600 text-white" : "bg-white border text-slate-700 hover:bg-slate-50"
              }`}
              style={{ borderColor: activeCategory === cat.id ? "transparent" : T.cardBorder }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Featured Horizontal Sections (when viewing all categories) */}
        {activeCategory === "all" && !searchQuery && (
          <>
            <HorizontalSection
              title="🔥 الأكثر مبيعاً"
              products={bestSellers}
              onAddToCart={handleAddToCart}
            />
            <HorizontalSection
              title="💥 عروض خاصة وخصومات"
              products={saleProducts}
              onAddToCart={handleAddToCart}
            />
          </>
        )}

        {/* Main Products Grid */}
        <div className="my-8">
          <h2 className="text-xl font-extrabold mb-6" style={{ color: T.textMain }}>
            {activeCategory === "all"
              ? searchQuery ? `نتائج البحث عن: "${searchQuery}"` : "جميع المنتجات"
              : CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border shadow-sm" style={{ borderColor: T.cardBorder }}>
              <p className="text-base font-bold text-slate-500">لا توجد منتجات تطابق اختيارك حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {filteredProducts.map((p) => (
                <div key={p.id} className="w-full flex justify-center">
                  <ProductCard p={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="!bg-slate-900 border-t mt-20" style={{ borderColor: T.cardBorder, backgroundColor: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h3 className="!text-white text-base font-extrabold mb-3" style={{ color: "#FFFFFF" }}>حسن السنان</h3>
            <p className="!text-gray-100 leading-relaxed" style={{ color: "#F3F4F6" }}>
              متجرك الموثوق لمستحضرات التجميل والعناية بالبشرة والشعر. نضمن لك جودة وأصالة كافة المنتجات مع أسرع خدمة توصيل.
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
              <a href="https://www.instagram.com/hassan.alsanan" target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2.5 rounded-full transition-all hover:opacity-90" style={{ backgroundColor: T.accent }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@hassan.alsanan" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 transition-all duration-200 hover:scale-110 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900" title="TikTok حسن السنان">
                <TikTokIcon />
              </a>
              <a href="https://www.facebook.com/p/%D8%AD%D8%B3%D9%86-%D8%A7%D9%84%D8%B3%D9%86%D8%A7%D9%86-%D9%84%D9%85%D8%B3%D8%AA%D8%AD%D8%B6%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D8%AC%D9%85%D9%8A%D9%84-61567231881425/" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2.5 rounded-full transition-all hover:opacity-90" style={{ backgroundColor: T.accent }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" /></svg>
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