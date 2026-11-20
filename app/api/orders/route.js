import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel, rowToCamel } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../../../lib/rateLimit";

// ============================================================================
// حدود وقيم مسموحة — بتحكم في حجم الطلب المقبول من زائر مجهول، عشان تمنع
// إساءة استخدام الـ endpoint العام ده (Priority 3: حماية الـ APIs العامة).
// ============================================================================
const MAX_BODY_BYTES = 20_000; // 20KB كفاية جدًا لأي طلب حقيقي (سلة + بيانات عميل)
const MAX_ITEMS = 40; // أقصى عدد أسطر مختلفة في السلة
const MAX_QTY_PER_ITEM = 30; // أقصى كمية للمنتج الواحد في السطر
const MAX_NAME_LEN = 120;
const MAX_ADDRESS_LEN = 400;
const MAX_NOTES_LEN = 800;
const ALLOWED_PAYMENT_METHODS = ["cod", "instapay"];
const PHONE_RE = /^01[0-25]\d{8}$/;
const OFFER_ITEM_ID_RE = /^offer-(\d+)$/;

// GET /api/orders — قائمة الطلبات (أدمن بس، فيها بيانات عملاء حساسة)
export async function GET(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { data, error } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return safeError(error);
  return Response.json(rowsToCamel(data));
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

// بيتأكد إن العرض فعلاً "شغال" دلوقتي — نفس منطق computeOfferState في
// lib/offersStore.js (الفرونت إند)، لكن بيتنفذ هنا في السيرفر على بيانات
// موثوقة من قاعدة البيانات، مش على أي حاجة جاية من المتصفح.
function isOfferCurrentlyActive(offer, today) {
  if (!offer || offer.status !== "active") return false;
  if (offer.start_date && offer.start_date > today) return false;
  if (offer.end_date && offer.end_date < today) return false;
  return true;
}

// بيتأكد إن شكل عنصر السلة نفسه سليم، وبيرجّع نوعه (منتج مباشر أو عرض) بدون
// ما يثق في أي سعر أو اسم جاي معاه — السعر والاسم هيتجابوا من قاعدة البيانات
// بعد كده بس (شوف resolveOrderItems).
function normalizeCartItem(raw) {
  if (!raw || typeof raw !== "object") return { error: "عنصر غير صحيح في السلة" };

  const qty = Number(raw.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
    return { error: "الكمية غير صحيحة لأحد المنتجات" };
  }

  const rawId = raw.id;
  const offerMatch = typeof rawId === "string" && rawId.match(OFFER_ITEM_ID_RE);
  if (offerMatch) {
    return { kind: "offer", offerId: Number(offerMatch[1]), qty };
  }

  const productId = Number(rawId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return { error: "منتج غير صحيح في السلة" };
  }
  return { kind: "product", productId, qty };
}

// بياخد قايمة عناصر السلة (بعد التحقق من شكلها) ويرجّع أسطر order_items
// جاهزة للحفظ، بسعر واسم المنتج الحقيقيين من قاعدة البيانات، بعد ما يتأكد إن
// كل منتج موجود وشغال (مش متوقف)، وإن أي عرض مُشار إليه فعلاً شغال دلوقتي.
// أي مشكلة بترجع { error } بدل ما تكمل — الطلب كله بيترفض لو أي سطر غلط
// (مفيش "قبول جزئي" لسلة فيها منتج وهمي أو ملغي).
async function resolveOrderItems(normalizedItems) {
  const directProductIds = [...new Set(normalizedItems.filter((i) => i.kind === "product").map((i) => i.productId))];
  const offerIds = [...new Set(normalizedItems.filter((i) => i.kind === "offer").map((i) => i.offerId))];

  // العروض المُشار إليها مباشرة (id بصيغة "offer-<id>")
  let referencedOffers = [];
  if (offerIds.length) {
    const { data, error } = await supabaseAdmin
      .from("offers")
      .select("id, product_id, old_price, new_price, status, start_date, end_date")
      .in("id", offerIds);
    if (error) return { error };
    referencedOffers = data || [];
  }
  const offerById = new Map(referencedOffers.map((o) => [o.id, o]));

  // كل المنتجات المحتاجين نتأكد منها: المطلوبة مباشرة + المنتجات ورا العروض
  const allProductIds = new Set(directProductIds);
  for (const o of referencedOffers) {
    if (o.product_id != null) allProductIds.add(o.product_id);
  }
  const allProductIdsArr = [...allProductIds];

  let products = [];
  if (allProductIdsArr.length) {
    const { data, error } = await supabaseAdmin.from("products").select("id, name, price, is_active").in("id", allProductIdsArr);
    if (error) return { error };
    products = data || [];
  }
  const productById = new Map(products.map((p) => [p.id, p]));

  // أي عرض شغال حاليًا على منتج من المنتجات المطلوبة مباشرة (عشان لو حد ضاف
  // منتج للسلة وهو معروض بسعر مخفّض، السعر المحفوظ يكون سعر العرض الحقيقي —
  // مطابق لسلوك الموقع الحالي اللي بيعرض سعر العرض على كارد المنتج نفسه)
  let liveOfferByProduct = new Map();
  if (directProductIds.length) {
    const { data, error } = await supabaseAdmin
      .from("offers")
      .select("id, product_id, old_price, new_price, status, start_date, end_date")
      .in("product_id", directProductIds)
      .eq("status", "active");
    if (error) return { error };
    const today = todayISODate();
    for (const o of data || []) {
      if (!isOfferCurrentlyActive(o, today)) continue;
      if (!liveOfferByProduct.has(o.product_id)) liveOfferByProduct.set(o.product_id, o);
    }
  }

  const today = todayISODate();
  const resolved = [];
  let subtotal = 0;

  for (const item of normalizedItems) {
    let product;
    let unitPrice;
    let oldPrice = null;

    if (item.kind === "product") {
      product = productById.get(item.productId);
      if (!product || product.is_active === false) {
        return { error: "في منتج داخل السلة بقى غير متاح — من فضلك حدّث السلة وحاول تاني" };
      }
      const liveOffer = liveOfferByProduct.get(product.id);
      if (liveOffer) {
        unitPrice = Number(liveOffer.new_price);
        oldPrice = Number(liveOffer.old_price);
      } else {
        unitPrice = Number(product.price);
      }
    } else {
      const offer = offerById.get(item.offerId);
      if (!isOfferCurrentlyActive(offer, today)) {
        return { error: "في عرض داخل السلة بقى غير متاح — من فضلك حدّث السلة وحاول تاني" };
      }
      product = productById.get(offer.product_id);
      if (!product || product.is_active === false) {
        return { error: "في منتج داخل السلة بقى غير متاح — من فضلك حدّث السلة وحاول تاني" };
      }
      unitPrice = Number(offer.new_price);
      oldPrice = offer.old_price != null ? Number(offer.old_price) : null;
    }

    if (!(unitPrice > 0)) {
      return { error: "حصل خطأ في حساب سعر أحد المنتجات" };
    }

    subtotal += unitPrice * item.qty;
    resolved.push({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice,
      old_price: oldPrice,
      quantity: item.qty,
    });
  }

  return { items: resolved, subtotal: Math.round(subtotal * 100) / 100 };
}

// POST /api/orders — بيتعمل من صفحة الـ Checkout نفسها (أي زائر بعد ما يملى
// الفورم، مش لازم يكون أدمن). Supabase هو مصدر الطلب الأساسي — حتى لو المستخدم
// قفل واتساب أو مفتحوش خالص، الطلب يفضل محفوظ.
//
// ⚠️ أمان: السعر والاسم والإجمالي وحالة توفّر المنتج كلها بتتحسب/تتتأكد من
// قاعدة البيانات هنا في السيرفر — أي قيمة سعر/إجمالي جاية من body الطلب (زي
// subtotal/total/price القديمة) بيتجاهلها الكود تمامًا ومبتتخزنش. الطلب
// بيتحفظ بحالة "pending" دايمًا، ومفيش أي خصم مخزون هنا (مفيش نظام مخزون في
// المشروع أصلًا) — المراجعة والتأكيد يدوي من لوحة التحكم زي ما هو متفق عليه.
export async function POST(request) {
  // 1) Rate limiting — بيحد من عدد الطلبات المسموحة من نفس الـ IP في فترة
  // قصيرة، عشان يوقف سكربتات بتحاول تغرق جدول orders بطلبات وهمية. راجع
  // lib/rateLimit.js لحدود وقيود الطريقة دي.
  const ip = getClientIp(request);
  const rl = checkRateLimit(`orders:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

  // 2) حد أقصى لحجم الـ body — قبل حتى ما نحاول نـ parse أي حاجة
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json({ error: "حجم الطلب كبير جدًا" }, { status: 413 });
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "مقدرناش نقرا بيانات الطلب" }, { status: 400 });
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: "حجم الطلب كبير جدًا" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "بيانات الطلب غير صحيحة" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "بيانات الطلب غير صحيحة" }, { status: 400 });
  }

  const { customerName, customerPhone, customerAddress, notes, paymentMethod, items } = body;

  if (typeof customerName !== "string" || typeof customerPhone !== "string" || typeof customerAddress !== "string") {
    return Response.json({ error: "الاسم والموبايل والعنوان مطلوبين" }, { status: 400 });
  }

  const name = customerName.trim().slice(0, MAX_NAME_LEN);
  const phone = customerPhone.trim();
  const address = customerAddress.trim().slice(0, MAX_ADDRESS_LEN);
  const safeNotes = typeof notes === "string" ? notes.trim().slice(0, MAX_NOTES_LEN) : "";

  if (name.length < 2 || !address) {
    return Response.json({ error: "الاسم والموبايل والعنوان مطلوبين" }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return Response.json({ error: "رقم موبايل غير صحيح" }, { status: 400 });
  }

  const method = typeof paymentMethod === "string" && ALLOWED_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : "cod";

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "السلة فاضية" }, { status: 400 });
  }
  if (items.length > MAX_ITEMS) {
    return Response.json({ error: "عدد المنتجات في الطلب كبير جدًا" }, { status: 400 });
  }

  const normalizedItems = [];
  for (const raw of items) {
    const result = normalizeCartItem(raw);
    if (result.error) return Response.json({ error: result.error }, { status: 400 });
    normalizedItems.push(result);
  }

  // 3) السعر والاسم والتوفر كلهم بيتحسبوا/يتأكدوا من قاعدة البيانات هنا —
  // مش من أي حاجة بعتها المتصفح.
  const resolution = await resolveOrderItems(normalizedItems);
  if (resolution.error) {
    if (typeof resolution.error === "string") {
      return Response.json({ error: resolution.error }, { status: 409 });
    }
    return safeError(resolution.error);
  }
  const { items: orderItemsData, subtotal } = resolution;
  const total = subtotal; // مفيش رسوم شحن/خصومات إضافية في المشروع حاليًا

  // 4) العميل: بنربط الطلب بسجل customer بالرقم، لكن من غير ما نسمح لزائر
  // مجهول يعدّل بيانات عميل موجود بالفعل بمجرد ما يكتب نفس رقم الموبايل —
  // ده كان بيسمح لأي حد يغيّر اسم/عنوان عميل حقيقي تاني (Priority 2). بيانات
  // التواصل بتاعة الطلب ده بالذات (الاسم/الموبايل/العنوان اللي كتبهم دلوقتي)
  // بتتخزن مباشرة على صف orders نفسه تحت — منفصلة تمامًا عن سجل customers.
  const { data: existingCustomer, error: findCustomerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (findCustomerError) return safeError(findCustomerError);

  let customerId = existingCustomer?.id || null;
  if (!customerId) {
    const { data: newCustomer, error: custError } = await supabaseAdmin
      .from("customers")
      .insert({ name, phone, address })
      .select("id")
      .single();
    if (custError) return safeError(custError);
    customerId = newCustomer.id;
  }
  // ملحوظة: لو العميل موجود بالفعل، إحنا عمدًا مش بنعدّل اسمه/عنوانه المحفوظ
  // هنا. لو الأدمن راجع الطلب ولاقى إن العميل غيّر اسمه/عنوانه فعلاً، يقدر
  // يحدّث سجله يدويًا من لوحة التحكم (PUT /api/customers/:id، أدمن بس).

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      notes: safeNotes,
      payment_method: method,
      subtotal,
      total,
      status: "pending", // الطلب دايمًا يبدأ pending — مراجعة يدوية من الصيدلية قبل أي تأكيد
    })
    .select()
    .single();
  if (orderError) return safeError(orderError);

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItemsData.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    // بدون transaction حقيقية هنا، لو فشل حفظ العناصر بعد ما اتحفظ الطلب،
    // بنشيل صف الطلب اليتيم ده (من غير عناصر) بدل ما نسيبه معلّق في لوحة
    // التحكم من غير أي منتجات جواه.
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return safeError(itemsError, "حصل خطأ أثناء حفظ عناصر الطلب، حاول تاني");
  }

  return Response.json({ ...rowToCamel(order), items: rowsToCamel(orderItemsData) }, { status: 201 });
}
