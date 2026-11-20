import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import Seal from "../../../components/Seal";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowToCamel } from "../../../lib/caseMap";
import { splitParagraphs } from "../../../lib/blogStore";

// مفيش generateStaticParams هنا عمدًا — مقال جديد من الأدمن لازم يشتغل فورًا.
async function getPost(slug) {
  const { data, error } = await supabaseAdmin.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).single();
  if (error || !data) return null;
  return rowToCamel(data);
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "المقال غير موجود" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    return <div className="pt-32 pb-24 text-center text-navy/60">هذا المقال غير موجود.</div>;
  }

  const paragraphs = splitParagraphs(post.content);

  return (
    <article className="pt-28 pb-24 px-4 sm:px-6 min-h-screen bg-ivory">
      <div className="mx-auto max-w-2xl">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-navy/60 hover:text-emerald mb-8">
          <ChevronRight className="w-4 h-4" />
          الرجوع للمدونة
        </Link>

        <Seal className="w-11 h-11 mb-5" />
        <div className="flex items-center gap-2 text-xs text-navy/40 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar-EG") : ""}
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy mb-8 leading-relaxed">{post.title}</h1>

        <div className="flex flex-col gap-5">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-navy/70 leading-loose text-base">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-mist p-6 text-center">
          <p className="text-sm text-navy/70 mb-3">محتاج استشارة صيدلانية بخصوص الموضوع ده؟</p>
          <Link href="/#booking" className="inline-block rounded-full bg-emerald text-ivory px-6 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            احجز استشارتك الآن
          </Link>
        </div>
      </div>
    </article>
  );
}
