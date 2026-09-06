'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, ShoppingBag, Truck } from "lucide-react";
import { supabase } from "@/supabase";

const CART_STORAGE_KEY = "hassan-al-sinan-cart";
const WHATSAPP_NUMBER = "201010425992";
const SHIPPING_COST = 0;
const DISCOUNT_CODE = "WELCOME10";
const DISCOUNT_RATE = 0.1;

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس",
  "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ",
  "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج",
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  qty: number;
};

type CheckoutForm = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  governorate: string;
  phone: string;
};

const emptyForm: CheckoutForm = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  governorate: "القاهرة",
  phone: "",
};

const egp = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;
const isUrl = (value?: string) => Boolean(value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")));
const waLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) setCart(JSON.parse(storedCart) as CartItem[]);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.qty, 0), [cart]);
  const discount = discountApplied ? subtotal * DISCOUNT_RATE : 0;
  const total = subtotal - discount + SHIPPING_COST;

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyDiscount = () => {
    setDiscountApplied(discountCode.trim().toUpperCase() === DISCOUNT_CODE);
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("السلة فارغة. أضف منتجاً قبل إتمام الطلب.");
      return;
    }

    setIsSubmitting(true);
    const customerName = `${form.firstName} ${form.lastName}`.trim();
    const fullAddress = [form.address, form.apartment].filter(Boolean).join(" - ");
    const orderPayload = {
      customer_name: customerName,
      phone: form.phone.trim(),
      address: fullAddress,
      city: [form.city.trim(), form.governorate].filter(Boolean).join(" - "),
      total_price: Number(total.toFixed(2)),
      items: cart,
      status: "جديد",
    };

    try {
      const { error } = await supabase.from("orders").insert([orderPayload]);

      if (error) {
        console.error("Supabase Error details:", error);
        throw error;
      }

      const itemsList = cart
        .map((item, index) => `${index + 1}. ${item.name} (${item.qty}x) - ${egp(item.price * item.qty)}`)
        .join("\n");
      const message = `🛍️ *طلب جديد من المتجر*

👤 *بيانات العميل:*
- الاسم: ${customerName}
- البريد الإلكتروني: ${form.email}
- الهاتف: ${form.phone}
- المحافظة: ${form.governorate}
- المدينة: ${form.city}
- العنوان: ${fullAddress}

🚚 *طريقة الشحن:* شحن قياسي
📦 *المنتجات المطلوبة:*
${itemsList}

💰 *الإجمالي:* ${egp(total)}
📌 *طريقة الدفع:* الدفع عند الاستلام (COD)`;

      window.localStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
      setSubmitted(true);
      window.setTimeout(() => window.location.assign(waLink(message)), 1200);
    } catch (error) {
      console.error("Checkout error:", error);
      console.error("Supabase Error details:", error);
      setErrorMessage("تعذر تسجيل الطلب حالياً. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 text-center" dir="rtl">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={48} />
          <h1 className="text-2xl font-extrabold text-gray-900">تم تسجيل طلبك بنجاح</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">سيتم فتح واتساب لإرسال تفاصيل الطلب إلى المتجر.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-right" dir="rtl">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="order-2 px-4 py-8 sm:px-8 lg:order-1 lg:px-14 lg:py-12">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                  <ArrowRight size={16} /> العودة إلى المتجر
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">إتمام الطلب</h1>
              </div>
              <LockKeyhole className="text-gray-400" size={20} aria-label="دفع آمن" />
            </div>

            <form onSubmit={submitOrder} className="space-y-8">
              <fieldset className="space-y-4">
                <legend className="mb-4 text-xl font-bold text-gray-900">بيانات التوصيل</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">الاسم الأول<input required value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
                  <label className="text-sm font-semibold text-gray-700">اسم العائلة<input required value={form.lastName} onChange={(event) => updateForm("lastName", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
                </div>
                <label className="block text-sm font-semibold text-gray-700">المحافظة<select required value={form.governorate} onChange={(event) => updateForm("governorate", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100">{GOVERNORATES.map((governorate) => <option key={governorate}>{governorate}</option>)}</select></label>
                <label className="block text-sm font-semibold text-gray-700">رقم الهاتف<input type="tel" required value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
                <label className="block text-sm font-semibold text-gray-700">المدينة<input required value={form.city} onChange={(event) => updateForm("city", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
                <label className="block text-sm font-semibold text-gray-700">العنوان بالتفصيل<input required value={form.address} onChange={(event) => updateForm("address", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
                <label className="block text-sm font-semibold text-gray-700">الشقة أو الطابق <span className="font-normal text-gray-400">(اختياري)</span><input value={form.apartment} onChange={(event) => updateForm("apartment", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="mb-4 text-xl font-bold text-gray-900">بيانات التواصل</legend>
                <label className="block text-sm font-semibold text-gray-700">
                  البريد الإلكتروني <span className="font-normal text-gray-400">(اختياري)</span>
                  <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
                </label>
              </fieldset>

              <fieldset>
                <legend className="mb-4 text-xl font-bold text-gray-900">طريقة الشحن</legend>
                <label className="flex items-center justify-between rounded-lg border-2 border-amber-600 bg-amber-50 p-4 text-sm font-bold text-gray-800">
                  <span className="flex items-center gap-3"><Truck size={20} className="text-amber-600" /> الشحن القياسي</span>
                  <span>مجاني</span>
                  <input type="radio" checked readOnly aria-label="الشحن القياسي" className="accent-amber-600" />
                </label>
              </fieldset>

              {errorMessage && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage}</p>}
              <button type="submit" disabled={isSubmitting || cart.length === 0} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E293B] py-4 font-extrabold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
                {isSubmitting ? "جاري تسجيل الطلب..." : "تأكيد الطلب"}
              </button>
            </form>
          </div>
        </section>

        <aside className="order-1 border-b border-gray-200 bg-gray-50 px-4 py-8 sm:px-8 lg:order-2 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div className="sticky top-8">
            <h2 className="mb-6 text-xl font-extrabold text-gray-900">ملخص الطلب</h2>
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">السلة فارغة حالياً.</div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {isUrl(item.imageUrl) ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-1" /> : <ShoppingBag className="m-auto h-full text-gray-300" />}
                      <span
                        className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-bold shadow-md"
                        style={{ color: "#FFFFFF" }}
                      >
                        {item.qty}
                      </span>
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{item.name}</p>
                    <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>{egp(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="my-8 flex gap-2">
              <input value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="رمز الخصم" className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-amber-600" />
              <button type="button" onClick={applyDiscount} className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100">تطبيق</button>
            </div>
            {discountCode && <p className={`-mt-6 mb-6 text-xs font-semibold ${discountApplied ? "text-emerald-600" : "text-gray-500"}`}>{discountApplied ? "تم تطبيق الخصم" : `استخدم الرمز ${DISCOUNT_CODE}`}</p>}

            <div className="space-y-3 border-t border-gray-200 pt-5 text-sm text-gray-600">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{egp(subtotal)}</span></div>
              <div className="flex justify-between"><span>الشحن</span><span>{SHIPPING_COST ? egp(SHIPPING_COST) : "مجاني"}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-700"><span>الخصم</span><span>-{egp(discount)}</span></div>}
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-extrabold text-gray-900"><span>الإجمالي</span><span>{egp(total)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}