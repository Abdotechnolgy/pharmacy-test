import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import Seal from "../../components/Seal";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { rowsToCamel } from "../../lib/caseMap";

export const metadata = {
  title: "المدونة الصحية",
  description: "مقالات ونصائح صحية من فريق صيدلية الدكتور سالم أحمد فؤاد بأبو المطامير، محافظة البحيرة.",
};

async function getPublishedPosts() {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) return [];
  return rowsToCamel(data);
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center mb-14">
          <Seal className="w-12 h-12 mb-4" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy">المدونة الصحية</h1>
          <p className="text-navy/60 mt-3 max-w-lg">نصائح وإرشادات صحية موثوقة من فريق صيدلية الدكتور سالم أحمد فؤاد.</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-navy/50 py-12">مفيش مقالات منشورة لسه.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_10px_30px_rgba(14,42,74,0.06)] hover:shadow-[0_18px_40px_rgba(14,42,74,0.12)] hover:-translate-y-0.5 transition-all duration-400 p-7"
              >
                <div className="flex items-center gap-2 text-xs text-navy/40 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar-EG") : ""}
                </div>
                <h2 className="font-display font-bold text-lg text-navy group-hover:text-emerald transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-navy/60 leading-relaxed">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald mt-4">
                  اقرأ المزيد
                  <ArrowLeft className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
