import { supabaseAdmin } from "../lib/supabaseAdmin";
import { SITE } from "../data/site";

export default async function sitemap() {
  const now = new Date();
  const staticPages = ["", "/blog", "/checkout", "/offers", "/categories"].map((p) => ({
    url: `${SITE.baseUrl}${p}`,
    lastModified: now,
  }));

  const [{ data: categories }, { data: products }, { data: posts }] = await Promise.all([
    supabaseAdmin.from("categories").select("slug").eq("is_active", true),
    supabaseAdmin.from("products").select("id"),
    supabaseAdmin.from("blog_posts").select("slug, published_at").eq("is_published", true),
  ]);

  const categoryPages = (categories || []).map((c) => ({
    url: `${SITE.baseUrl}/products/${c.slug}`,
    lastModified: now,
  }));

  const productPages = (products || []).map((p) => ({
    url: `${SITE.baseUrl}/product/${p.id}`,
    lastModified: now,
  }));

  const blogPages = (posts || []).map((p) => ({
    url: `${SITE.baseUrl}/blog/${p.slug}`,
    lastModified: p.published_at || now,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
