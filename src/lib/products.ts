export interface ProductRow {
  id: number | string;
  name: string;
  brand?: string | null;
  description?: string | null;
  price: number | null;
  old_price?: number | null;
  selling_price?: number | null;
  discount_percentage?: number | null;
  category?: string | null;
  sub_category?: string | null;
  stock?: number | null;
  rating?: number | null;
  reviews_count?: number | null;
  sku?: string | null;
  images?: string[] | null;
  image_url?: string | null;
  is_new?: boolean | null;
  is_bestseller?: boolean | null;
  is_featured?: boolean | null;
}

export interface Product {
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

export const CATEGORIES = [
  { id: "skincare", name: "العناية بالبشرة", icon: "🧴" },
  { id: "haircare", name: "العناية بالشعر", icon: "💇‍♀️" },
  { id: "bodycare", name: "العناية بالجسم", icon: "🧼" },
  { id: "makeup", name: "المكياج", icon: "💄" },
  { id: "perfume", name: "العطور", icon: "🌸" },
  { id: "accessories", name: "الإكسسوارات", icon: "🎀" },
  { id: "salon", name: "مستلزمات الكوافير", icon: "✂️" },
];

export function normalizeProduct(row: ProductRow): Product {
  const originalPrice = Number(row.price ?? 0);
  const discountedPrice = row.selling_price == null ? originalPrice : Number(row.selling_price);
  const discountPercentage = row.discount_percentage == null
    ? (row.old_price && originalPrice < row.old_price ? Math.round(((row.old_price - originalPrice) / row.old_price) * 100) : 0)
    : Number(row.discount_percentage);

  return {
    id: Number(row.id),
    sku: row.sku || `PRODUCT-${row.id}`,
    name: row.name,
    brand: row.brand || "حسن السنان",
    category: row.category || "all",
    subCategory: row.sub_category || "",
    description: row.description || `${row.name} من منتجات حسن السنان الأصلية.`,
    price: discountedPrice,
    oldPrice: row.selling_price != null && discountedPrice < originalPrice ? originalPrice : row.old_price ?? null,
    discountPercentage,
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_bestseller),
    isFeatured: Boolean(row.is_featured),
    isOnSale: discountedPrice < originalPrice || Boolean(row.old_price && row.old_price > originalPrice),
    imageUrl: row.images?.[0] || row.image_url || "✨",
  };
}
