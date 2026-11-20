-- ============================================================================
-- صيدلية الدكتور سالم أحمد فؤاد — Database Schema
-- ============================================================================
-- طريقة التشغيل:
-- 1. افتح مشروعك في supabase.com/dashboard
-- 2. من القائمة الجانبية: SQL Editor → New query
-- 3. الصق الملف ده كامل واضغط Run
-- 4. لو شغال صح، هتلاقي رسالة "Success. No rows returned"
--
-- ملحوظة: الملف ده آمن للتشغيل أكتر من مرة (DROP TABLE IF EXISTS في الأول)،
-- لكن ده معناه إنه هيمسح أي بيانات موجودة فعلاً لو شغّلته تاني بعد ما تضيف
-- بيانات حقيقية من لوحة التحكم. شغّله مرة واحدة بس في البداية.
-- ============================================================================

drop table if exists offers cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists services cascade;
drop table if exists site_settings cascade;
drop table if exists latest_products_config cascade;

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text default '',
  image text default '',
  icon text default 'Layers',
  is_active boolean not null default true,
  show_on_homepage boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- (category مربوطة بالاسم زي ما كانت في localStorage، مش foreign key رقمي —
-- عشان لو الأدمن غيّر اسم تصنيف، بيتحدّث في كل منتجاته المرتبطة بنفس منطق
-- lib/categoriesStore.js الحالي بدون تغيير كبير في الكود)
-- ----------------------------------------------------------------------------
create table products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null,
  icon text default 'Pill',
  image text default '',
  badge text default '',
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- offers
-- ----------------------------------------------------------------------------
create table offers (
  id bigint generated always as identity primary key,
  product_id bigint references products (id) on delete cascade,
  old_price numeric(10, 2) not null,
  new_price numeric(10, 2) not null,
  description text default '',
  image text default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- services
-- ----------------------------------------------------------------------------
create table services (
  id bigint generated always as identity primary key,
  icon text default 'Sparkles',
  title text not null,
  description text not null default '',
  cta jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- site_settings (صف واحد بس، id ثابت = 1)
-- ----------------------------------------------------------------------------
create table site_settings (
  id integer primary key default 1,
  whatsapp_primary text default '',
  whatsapp_secondary text default '',
  google_maps_url text default '',
  facebook_url text default '',
  instagram_url text default '',
  tiktok_url text default '',
  homepage_category_limit integer not null default 8,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ----------------------------------------------------------------------------
-- latest_products_config (صف واحد بس، id ثابت = 1)
-- ----------------------------------------------------------------------------
create table latest_products_config (
  id integer primary key default 1,
  mode text not null default 'auto' check (mode in ('auto', 'manual')),
  entries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ============================================================================
-- Row Level Security — الوصول كله من السيرفر بس (Service Role Key بيتخطى RLS
-- تلقائيًا)، فمفيش أي policy هنا معناها إن أي مفتاح تاني (anon) مش هيقدر يقرا
-- أو يكتب أي حاجة خالص. ده أمان إضافي حتى لو حصل أي تسريب لمفتاح تاني غلط.
-- ============================================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table offers enable row level security;
alter table services enable row level security;
alter table site_settings enable row level security;
alter table latest_products_config enable row level security;

-- ============================================================================
-- Seed data — نفس البيانات الحقيقية الموجودة فعليًا في المشروع بالظبط
-- (data/categories.js, data/products.js, data/services.js, data/settings.js)
-- ============================================================================

insert into categories (id, name, slug, description, image, icon, is_active, show_on_homepage, featured, sort_order) values
  (1, 'أدوية', 'medicines', 'أدوية ومستحضرات علاجية موثوقة، حسب إرشادات الصيدلي.', '', 'Pill', true, true, true, 1),
  (2, 'مكملات غذائية', 'supplements', 'فيتامينات ومكملات غذائية مختارة بعناية لدعم صحتك اليومية.', '', 'Leaf', true, true, false, 2),
  (3, 'تجميل وعناية', 'beauty-care', 'منتجات عناية وتجميل يومية مناسبة لكل أنواع البشرة.', '', 'Sparkles', true, true, false, 3);

insert into products (id, name, category, price, icon, badge, description) values
  (1, 'فيتامين سي ١٠٠٠ فوار', 'مكملات غذائية', 85, 'Droplet', '', 'أقراص فوارة لدعم المناعة اليومي، بطعم منعش وسهلة الذوبان.'),
  (2, 'أوميجا ٣ كبسولات', 'مكملات غذائية', 220, 'Leaf', '', 'مكمل غذائي لدعم صحة القلب والدماغ، جرعة يومية واحدة.'),
  (3, 'زنك + فيتامين د', 'مكملات غذائية', 140, 'Sun', 'الأكثر طلبًا', 'تركيبة مزدوجة لدعم المناعة والعظام، مناسبة لكل أفراد الأسرة.'),
  (4, 'بروبيوتيك كبسولات', 'مكملات غذائية', 260, 'Leaf', '', 'يدعم صحة الجهاز الهضمي وتوازن البكتيريا النافعة بالأمعاء.'),
  (5, 'كولاجين مشروب', 'مكملات غذائية', 380, 'Droplet', '', 'مشروب يومي لدعم مرونة البشرة وصحة المفاصل.'),
  (6, 'كريم عناية بالبشرة SPF50', 'تجميل وعناية', 310, 'Sun', 'الأكثر طلبًا', 'حماية يومية من أشعة الشمس مع ترطيب خفيف مناسب لكل أنواع البشرة.'),
  (7, 'سيروم فيتامين سي للوجه', 'تجميل وعناية', 450, 'Sparkles', '', 'سيروم مركّز لتوحيد لون البشرة وإضفاء إشراقة طبيعية.'),
  (8, 'غسول وجه لطيف', 'تجميل وعناية', 190, 'Droplet', '', 'تنظيف يومي لطيف يحافظ على رطوبة البشرة الطبيعية.'),
  (9, 'مرطب شفاه بالشيا', 'تجميل وعناية', 65, 'Heart', '', 'ترطيب مكثف للشفاه بزبدة الشيا الطبيعية.'),
  (10, 'باراسيتامول أقراص', 'أدوية', 15, 'Pill', '', 'مسكّن وخافض حرارة للاستخدام العام حسب إرشادات الصيدلي.'),
  (11, 'شراب خافض حرارة للأطفال', 'أدوية', 28, 'Heart', '', 'تركيبة آمنة لخفض الحرارة لدى الأطفال، بطعم مقبول للصغار.'),
  (12, 'كمادات جل للحمى', 'أدوية', 40, 'Sparkles', '', 'كمادات جل سريعة المفعول لخفض الحرارة الموضعي.');

-- العروض بتبدأ فاضية عمدًا — نفس فلسفة data/offers.js (مفيش خصومات وهمية)
-- أضف عروضك الحقيقية من /admin/offers بعد ما الموقع يشتغل.

insert into services (id, icon, title, description, cta, is_active, sort_order) values
  (1, 'Truck', 'توصيل سريع', 'نوصل طلبك داخل مدينة أبو المطامير والمناطق المجاورة مباشرة إلى باب منزلك.', null, true, 1),
  (2, 'MessageCircle', 'استشارة صيدلية', 'تواصل مع الصيدلي مباشرة عبر واتساب لأي استفسار دوائي في أي وقت.', '{"type":"whatsapp","value":"مرحبًا، أرغب في استشارة صيدلية","label":"تواصل الآن"}'::jsonb, true, 2),
  (3, 'Pill', 'طلب الأدوية', 'اطلب أدويتك ومستلزماتك بسهولة من الكتالوج، أو أرسل الروشتة مباشرة.', '{"type":"anchor","value":"/categories","label":"تصفّح الأقسام"}'::jsonb, true, 3),
  (4, 'Clock', 'خدمة على مدار الساعة', 'الصيدلية متاحة لخدمتكم ٢٤ ساعة، طوال أيام الأسبوع، من غير استثناء.', null, true, 4);

insert into site_settings (id, whatsapp_primary, whatsapp_secondary, google_maps_url, facebook_url, instagram_url, tiktok_url, homepage_category_limit) values
  (1, '201080737870', '201010274823', 'https://maps.app.goo.gl/Cq2dfr2CUskbyDn68', '', '', '', 8);

insert into latest_products_config (id, mode, entries) values
  (1, 'auto', '[]'::jsonb);

-- ----------------------------------------------------------------------------
-- عشان الـ id اللي جاي بعد كده (منتج/تصنيف جديد من لوحة التحكم) يبدأ صح من
-- أول رقم فاضي، مش يتصادم مع الـ ids اللي احنا زرعناها يدويًا فوق (identity
-- columns بتفضل عادةً بتعد من 1 لوحدها، فلازم نظبطها يدويًا بعد الـ insert اليدوي)
-- ----------------------------------------------------------------------------
select setval(pg_get_serial_sequence('categories', 'id'), (select max(id) from categories));
select setval(pg_get_serial_sequence('products', 'id'), (select max(id) from products));
select setval(pg_get_serial_sequence('services', 'id'), (select max(id) from services));
