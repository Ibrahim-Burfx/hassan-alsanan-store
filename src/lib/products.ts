export type RawProductTuple = [string, string, string, string, number, number | null, boolean, boolean, boolean, boolean, string];

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

export function makeProducts(): Product[] {
  return RAW.map((r, i) => {
    const [name, brand, category, subCategory, price, oldPrice, isNew, isBestSeller, isFeatured, isOnSale, imageUrl] = r;
    const discountPercentage = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    return {
      id: i + 1,
      sku: `HS-${category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
      name, brand, category, subCategory,
      description: `${name} من ${brand}، منتج أصلي 100% لتوفير أعلى مستوى من العناية.`,
      price, oldPrice: oldPrice || null, discountPercentage,
      stock: 8 + ((i * 7) % 40),
      rating: +(4.2 + ((i * 3) % 8) / 10).toFixed(1),
      reviewsCount: 15 + ((i * 11) % 150),
      isNew, isBestSeller, isFeatured, isOnSale: !!oldPrice,
      imageUrl: imageUrl || "✨",
    };
  });
}
