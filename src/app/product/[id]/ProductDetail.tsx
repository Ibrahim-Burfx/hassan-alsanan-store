'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import type { Product } from "@/lib/products";

const CART_STORAGE_KEY = "hassan-al-sinan-cart";
const egp = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;
const isUrl = (value: string) => value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");

type CartItem = Pick<Product, "id" | "name" | "price" | "category" | "imageUrl"> & { qty: number };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`تقييم ${rating}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} fill={star <= Math.round(rating) ? "#D97706" : "none"} color="#D97706" strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();

  const addToCart = (buyNow = false) => {
    let cart: CartItem[] = [];
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) cart = JSON.parse(storedCart) as CartItem[];
    } catch {
      cart = [];
    }

    const existing = cart.find((item) => item.id === product.id);
    const nextCart = existing
      ? cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { id: product.id, name: product.name, price: product.price, category: product.category, imageUrl: product.imageUrl, qty: 1 }];

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    router.push("/?cart=open");
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 text-right" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-black">الرئيسية</Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
            {isUrl(product.imageUrl) ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-6" />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">{product.imageUrl}</div>
            )}
            {product.isOnSale && <span className="absolute right-4 top-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">خصم {product.discountPercentage}%</span>}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-amber-600">{product.brand}</span>
              <h1 className="mb-2 mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mb-4 text-sm text-gray-500">كود المنتج: {product.sku}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-extrabold text-gray-900">{egp(product.price)}</span>
                {product.oldPrice && <span className="text-lg text-gray-400 line-through">{egp(product.oldPrice)}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm text-gray-500">{product.rating} من 5 ({product.reviewsCount} تقييم)</span>
            </div>
            <hr className="border-gray-200" />

            <div>
              <h2 className="mb-2 text-lg font-bold text-gray-800">وصف المنتج</h2>
              <p className="leading-relaxed text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              متوفر في المخزون ({product.stock} قطعة)
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-xs text-gray-700">
              <div className="flex items-center justify-center gap-2"><Truck size={16} /> شحن سريع للمحافظات</div>
              <div>معاينة المنتج عند الاستلام</div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button onClick={() => addToCart()} className="flex-1 rounded-xl bg-[#1E293B] py-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95">
                <ShoppingBag className="ml-2 inline" size={18} /> أضف إلى السلة
              </button>
              <button onClick={() => addToCart(true)} className="flex-1 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95">
                شراء الآن
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-500" aria-label="الكمية الافتراضية: قطعة واحدة">
              <Minus size={15} /> <span className="text-sm font-bold">الكمية تضاف للسلة: 1</span> <Plus size={15} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
