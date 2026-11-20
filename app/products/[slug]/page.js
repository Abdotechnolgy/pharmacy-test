import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import CategoryCatalogClient from "../../../components/CategoryCatalogClient";

// مفيش generateStaticParams ثابت هنا عمدًا — أي تصنيف جديد من الأدمن (بما فيه
// اللي اتضاف بعد آخر build) لازم يشتغل فورًا. dynamicParams شغالة افتراضيًا في
// Next.js، فالصفحة بتتعمل server-render وقت الطلب لأي slug مش معروف مسبقًا.
async function getCategory(slug) {
  const { data } = await supabaseAdmin.from("categories").select("*").eq("slug", slug).eq("is_active", true).single();
  return data;
}

export async function generateMetadata({ params }) {
  const category = await getCategory(params.slug);
  if (!category) return { title: "التصنيف" };
  return {
    title: category.name,
    description: category.description
      ? `${category.description} تسوّق ${category.name} الآن من صيدلية الدكتور سالم أحمد فؤاد بأبو المطامير.`
      : `تسوّق ${category.name} الآن من صيدلية الدكتور سالم أحمد فؤاد بأبو المطامير.`,
  };
}

export default function CategoryPage({ params }) {
  return <CategoryCatalogClient slug={params.slug} />;
}
