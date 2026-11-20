# اختبارات الأمان — `__security_tests__/`

## تشغيل الاختبارات

```bash
npm run test:security
```

(بيستخدم `node --test` المدمج في Node.js — مفيش أي dependency إضافية مطلوبة
لتشغيل الاختبارات دي بالذات. النسخة المستخدمة وقت الكتابة: Node v22.)

نتيجة آخر تشغيل فعلي: **34 اختبار، كلهم PASS، صفر FAIL** (شوف تقرير المراجعة
الكامل للتفاصيل والأوامر بالظبط).

## مهم جدًا: نوع الاختبارات دي بالظبط

الاختبارات دي **مش** اختبارات ضد قاعدة بيانات Supabase حقيقية. هي:

### 1) اختبارات تكامل "مموّهة" (mocked integration tests)
دول اللي موجودين هنا (`01-orders.test.mjs`, `02-admin-and-errors.test.mjs`,
`00-smoke.test.mjs`). بيشغّلوا **كود الـ route files الحقيقي نفسه من غير أي
تعديل** (`app/api/orders/route.js`, `app/api/products/[id]/route.js`,
`app/api/auth/login/route.js`, إلخ) — لكن بدل ما يتكلموا مع Supabase حقيقي،
بيتكلموا مع **قاعدة بيانات وهمية في الذاكرة** (`__security_tests__/stubs/supabase-js.mjs`)
بتحاكي شكل `select/eq/in/order/single/insert/update/delete` بتاع Supabase JS
client، وكمان `auth.getUser` / `auth.signInWithPassword`.

بيثبتوا فعليًا:
- منطق الـ route نفسه (التحقق من الأسعار، رفض المنتجات الموقوفة، حماية بيانات
  العميل، rate limiting، رسائل الخطأ الآمنة) شغال زي ما هو متوقع.
- الـ authorization checks (`isAuthorizedAdminRequest`) بترفض فعليًا من غير
  الكوكي الصحيح.

**مش** بيثبتوا:
- إن الـ Row Level Security (RLS) policies في `supabase/schema*.sql` شغالة
  فعليًا زي ما هي مكتوبة على قاعدة بيانات Postgres حقيقية.
- إن أي unique constraint أو foreign key أو check constraint في السكيما
  بتتصرف زي ما احنا متوقعين على بيانات حقيقية.
- أي حاجة عن أداء أو سلوك Supabase الحقيقي (network errors, connection
  pooling, إلخ).

القيود التقنية دي موثّقة كمان جوه `stubs/supabase-js.mjs` نفسه.

### 2) اختبار Node.js syntax check (مش unit test حقيقي)
`node --check` اتشغّل على كل ملفات الـ API routes وملفات `lib/` (كلهم JS عادي
من غير JSX) — بيتأكد إن الكود مفيهوش أخطاء نحوية (syntax errors) بس، مش أكتر.
اتأكدنا كمان إنه **مش قادر يكتشف أخطاء JSX** (جربناه على ملف JSX متعمّد فيه
خطأ ومرّره من غير ما ياخد باله) — يعني الملفات اللي فيها JSX زي
`app/checkout/page.js` اتراجعت يدويًا بس، مش بأي أداة آلية.

### 3) اللي **لسه محتاج** اختبار حقيقي (real database security tests)
عشان تتأكد فعليًا إن الحماية شغالة على قاعدة بيانات Supabase حقيقية (حتى لو
تجريبية/staging)، لازم كده يتعمل — ده لسه متعملش هنا:

1. أنشئ مشروع Supabase تجريبي (مش الإنتاج، ومفيش بيانات عملاء حقيقية فيه).
2. شغّل `supabase/schema.sql` ثم `schema-v2.sql` ثم `schema-v3.sql` بالترتيب
   (شوف "طريقة التشغيل" في تعليقات كل ملف).
3. جرّب فعليًا من متصفح/Postman **بمفتاح anon (مش service role)**:
   - إن `select * from customers` أو `orders` أو `order_items` من anon key
     مباشر بيرجّع صفوف فاضية أو error (لأن RLS مفعّلة ومفيش أي policy ليها).
   - إن تسجيل دخول أدمن حقيقي عن طريق `/api/auth/login` بيرجّع session
     صحيحة، وإن حساب Supabase Auth من غير صف في `user_roles` بيترفض بـ 403.
   - إن عمل طلب حقيقي من صفحة `/checkout` بسعر متلاعب فيه من الـ DevTools
     (Network tab → عدّل الـ request body) لسه بيتسجل بالسعر الصح من
     قاعدة البيانات.
4. لو حبيت تشغّل اختبارات آلية ضد النسخة التجريبية دي فعليًا (مش mocked)،
   الأنسب حاجة زي `@supabase/supabase-js` الحقيقي + مفتاح anon تجريبي +
   بيانات وهمية بالكامل، وده محتاج بيئة عندها اتصال إنترنت فعلي — مش متاح في
   البيئة اللي اتعمل فيها التعديل ده (مفيش اتصال شبكة أصلًا، `npm install`
   نفسها فشلت بـ 403).

## ليه في `__security_tests__/stubs/` بدل `node_modules/`؟

`node_modules/` متجاهَل من git (`.gitignore`) ومش بيتشحن مع المشروع أصلًا — أي
حد بيعمل `npm install` هيجيب النسخ الحقيقية من `next` و `@supabase/supabase-js`
و `server-only`. عشان كده الملفات الوهمية (fakes) اللي الاختبارات دي محتاجاها
اتحطت في مكان منفصل (`stubs/`) وبيوجّهها ليهم `esm-loader.mjs` مباشرة، بدل ما
تتحط جوه `node_modules/` فعليًا (ده كان هيبوظ أي `npm install` حقيقي بعد كده).

## ليه فيه custom ESM loader (`esm-loader.mjs`) أصلًا؟

المشروع (زي أي مشروع Next.js) بيكتب الـ imports من غير امتداد ملف
(`from "../../lib/foo"` مش `foo.js`)، ومفيش `"type": "module"` في
`package.json` — ده عادي جدًا ومقصود، لأن Next.js عندها compiler خاص بيها
(SWC/webpack) بيتولى الموضوع ده وقت `next dev`/`next build`. لكن Node.js
العادي (من غير Next) محتاج امتداد صريح لأي `import` نسبي، وبيحتاج يعرف الملف
ده ES module من الأول. الـ loader ده بس بيحل المشكلة دي وقت الاختبار (بيدور
على `.js` لو الامتداد ناقص، وبيقول لـ Node "الملف ده module") — **مش بيغيّر
أو يعدّل أي محتوى في أي ملف حقيقي من المشروع**.
