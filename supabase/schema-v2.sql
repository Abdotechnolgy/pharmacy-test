-- ============================================================================
-- صيدلية الدكتور سالم أحمد فؤاد — Migration v2 (إضافية وآمنة)
-- ============================================================================
-- الملف ده إضافي بس — مبيمسحش ولا يلمس أي بيانات موجودة في categories أو
-- products أو offers أو services أو site_settings. شغّله بعد ما تكون شغّلت
-- schema.sql الأساسي قبل كده.
--
-- طريقة التشغيل: SQL Editor في Supabase Dashboard → الصق الملف كامل → Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) products.category_id — Foreign Key حقيقي بدل النص
-- ----------------------------------------------------------------------------
alter table products add column if not exists category_id bigint references categories (id);

-- ترحيل آمن: نربط كل منتج بالتصنيف بتاعه حسب الاسم الحالي (products.category)
update products p
set category_id = c.id
from categories c
where p.category = c.name
  and p.category_id is null;

create index if not exists idx_products_category_id on products (category_id);

-- ملحوظة: عمود products.category (النص) اتسيب عمدًا من غير ما يتحذف — عشان أي
-- كود قديم لسه بيقرأ منه يفضل شغال أثناء فترة الانتقال، وكـ سجل احتياطي.
-- الـ API دلوقتي بيرجّع category (join مع categories.name) و category_id
-- و category_slug مع بعض، فمفيش داعي نغيّر شكل البيانات اللي الفرونت إند متعود عليه.

-- ----------------------------------------------------------------------------
-- 2) customers
-- ----------------------------------------------------------------------------
create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  address text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_customers_phone on customers (phone);

-- ----------------------------------------------------------------------------
-- 3) orders + order_items
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers (id),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  notes text default '',
  payment_method text default 'cod',
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders (id) on delete cascade,
  product_id bigint references products (id),
  product_name text not null, -- محفوظ وقت الطلب، عشان لو المنتج اتغيّر/اتحذف بعد كده الفاتورة تفضل صحيحة
  price numeric(10, 2) not null,
  old_price numeric(10, 2),
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order_id on order_items (order_id);

-- ----------------------------------------------------------------------------
-- 4) blog_posts
-- ----------------------------------------------------------------------------
create table if not exists blog_posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  excerpt text default '',
  content text not null default '',
  cover_image_url text default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ترحيل المقالات الحقيقية الموجودة فعليًا في data/blog.js — الفقرات
-- (كانت array) بقت متخزنة كنص واحد مفصول بسطرين فاضيين، وبتترجع لمصفوفة
-- تاني وقت العرض. مبيتعملش insert لو المقال موجود بالفعل (نفس الـ slug).
insert into blog_posts (title, slug, excerpt, content, is_published, published_at)
select * from (values
  (
    'خمس نصائح صيدلانية لتقوية المناعة في تغيّر الفصول',
    'نصائح-لتقوية-المناعة',
    'دليل مبسّط من فريق الصيدلية للحفاظ على مناعة قوية مع تغيّر الجو، ومتى يكون المكمل الغذائي فعلاً محتاج.',
    E'تغيّر الفصول بيأثر على مناعة الجسم، وده بيخلي كتير من الناس يسألوا الصيدلي عن أفضل طريقة يحافظوا بيها على صحتهم.\n\nأول نصيحة هي الاهتمام بفيتامين سي وفيتامين د بشكل يومي، خصوصًا في الأيام اللي فيها الشمس بتكون قليلة.\n\nثانيًا، النوم الكافي له دور كبير جدًا في مناعة الجسم، ولازم نحافظ على ٧ إلى ٨ ساعات نوم يوميًا.\n\nثالثًا، شرب كمية مياه كافية يوميًا بيساعد الجسم يتخلص من السموم وبيحسّن كفاءة الجهاز المناعي.\n\nرابعًا، تجنب الإفراط في السكريات، لأنها بتقلل من كفاءة خلايا المناعة لفترة مؤقتة بعد الأكل مباشرة.\n\nأخيرًا، لو حسّيت إن مناعتك ضعيفة باستمرار، استشر الصيدلي أو الطبيب قبل ما تاخد أي مكمل غذائي بمفردك.',
    true,
    '2026-08-01T00:00:00Z'
  ),
  (
    'كيف تختار كريم الوقاية من الشمس المناسب لبشرتك؟',
    'كيف-تختار-كريم-الوقاية-من-الشمس',
    'معايير بسيطة تساعدك تختار SPF المناسب لنوع بشرتك، وأخطاء شائعة كتير من الناس بتقع فيها.',
    E'اختيار كريم الوقاية من الشمس مش بس مسألة رقم SPF، لكن كمان نوع البشرة وطبيعة يومك.\n\nلو بشرتك دهنية، يفضل تختار كريم بقوام خفيف (gel-based) عشان يقلل من لمعان البشرة أثناء اليوم.\n\nلو بشرتك جافة، الأفضل كريم بقوام غني يحتوي على مرطبات إضافية زي حمض الهيالورونيك.\n\nلازم يكون الكريم بيغطي الأشعة UVA وUVB معًا، ومكتوب عليه Broad Spectrum.\n\nأهم نصيحة: إعادة وضع الكريم كل ٢-٣ ساعات لو كنت في الشمس مباشرة لفترة طويلة.\n\nلو عندك أي حساسية جلدية، استشر الصيدلي عندنا قبل تجربة أي منتج جديد.',
    true,
    '2026-08-10T00:00:00Z'
  ),
  (
    'متى تستشير الصيدلي أولاً قبل زيارة الطبيب؟',
    'متى-تستشير-الصيدلي-قبل-الطبيب',
    'الصيدلي أول خط دفاع في كتير من الحالات البسيطة — إليك متى يكون استشارته كافية ومتى لازم تروح للطبيب.',
    E'كتير من الحالات البسيطة زي نزلات البرد الخفيفة أو الصداع العادي ممكن الصيدلي يساعدك فيها بسرعة وأمان.\n\nلو عندك أعراض بسيطة ومؤقتة، استشارة الصيدلي بتوفر عليك وقت وتساعدك تاخد القرار الصح من غير ما تنتظر ميعاد دكتور.\n\nلكن لو الأعراض استمرت أكتر من ٣ أيام أو زادت شدتها، لازم تروح لطبيب متخصص فورًا.\n\nالحالات المزمنة زي الضغط والسكر لازم يكون فيها متابعة دورية مع الطبيب، والصيدلي بيكمل دوره في متابعة الالتزام بالعلاج.\n\nفي صيدليتنا، فريق الصيادلة متاح ٢٤ ساعة يقدر يوجهك صح في أي وقت محتاج فيه استشارة سريعة وموثوقة.',
    true,
    '2026-08-20T00:00:00Z'
  )
) as v(title, slug, excerpt, content, is_published, published_at)
where not exists (select 1 from blog_posts bp where bp.slug = v.slug);

-- ----------------------------------------------------------------------------
-- 5) user_roles — تحديد مين الأدمن (لازم تضيف نفسك هنا يدويًا بعد إنشاء
-- المستخدم من Authentication → Users، شوف تعليمات README)
-- ----------------------------------------------------------------------------
create table if not exists user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table blog_posts enable row level security;
alter table user_roles enable row level security;

-- القراءة العامة مسموحة بس للمقالات المنشورة (زوار الموقع بيقرو المدونة)
drop policy if exists "public can read published posts" on blog_posts;
create policy "public can read published posts" on blog_posts
  for select using (is_published = true);

-- customers / orders / order_items / user_roles: مفيش أي policy للقراءة أو
-- الكتابة من anon أو authenticated — الوصول الوحيد المسموح هو عن طريق
-- Service Role Key من السيرفر (بيتخطى RLS تلقائيًا). ده أمان مقصود:
-- بيانات العملاء والطلبات حساسة ومينفعش حد يقراها غير من خلال لوحة التحكم.

-- نفس الكلام لباقي الجداول القديمة (categories/products/offers/services/
-- site_settings/latest_products_config) — RLS شغالة عليهم من schema.sql
-- الأساسي بدون أي policy، يعني مفيش وصول غير عن طريق Service Role.

-- ============================================================================
-- Storage Buckets — لتخزين الصور بدل base64 جوه قاعدة البيانات
-- ============================================================================
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('offers', 'offers', true),
  ('services', 'services', true),
  ('blog', 'blog', true)
on conflict (id) do nothing;

-- كل الـ buckets دي public للقراءة (الصور تظهر في الموقع لأي زائر)، لكن الرفع/
-- الحذف مسموح بس عن طريق Service Role Key (من app/api/upload/route.js) —
-- مفيش policy هنا لـ anon/authenticated للكتابة، يعني الرفع المباشر من المتصفح
-- من غير ما يعدي على الـ API مرفوض تلقائيًا.
drop policy if exists "public can view bucket images" on storage.objects;
create policy "public can view bucket images" on storage.objects
  for select using (bucket_id in ('products', 'categories', 'offers', 'services', 'blog'));
