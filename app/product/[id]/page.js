import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowToCamel } from "../../../lib/caseMap";
import ProductDetailClient from "../../../components/ProductDetailClient";

// مفيش generateStaticParams هنا عمدًا — المنتجات بقت ديناميكية بالكامل من
// Supabase، فأي منتج جديد من الأدمن بيشتغل فورًا على /product/[id] من غير
// أي rebuild للموقع (الصفحة بتتعمل server-render وقت الطلب نفسه).
async function getProduct(id) {
  const { data, error } = await supabaseAdmin.from("products").select("*, categories(name, slug)").eq("id", id).single();
  if (error || !data) return null;
  const { categories, ...rest } = data;
  return { ...rowToCamel(rest), category: categories?.name || "", categorySlug: categories?.slug || null };
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.name,
    description: `اطلب ${product.name} الآن من صيدلية الدكتور سالم أحمد فؤاد بأبو المطامير بسعر ${product.price} جنيه، مع توصيل سريع وضمان أصالة المنتج.`,
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return <div className="pt-32 pb-24 text-center text-navy/60">هذا المنتج غير موجود أو تم حذفه.</div>;
  }

  return <ProductDetailClient product={product} />;
}
