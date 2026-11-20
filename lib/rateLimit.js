import "server-only";

// NOTE (EN): in-memory, single-process rate limiter. NOT a distributed
// production rate limiter — it does not share state across multiple
// serverless instances/regions. See the Arabic notes below and the
// remediation report for details and a production recommendation.
//
// حماية بسيطة من الطلبات المتكررة (rate limiting) على الـ endpoints العامة
// (إنشاء طلب، تسجيل دخول الأدمن) — فيها in-memory Map بس، من غير أي dependency
// خارجية.
//
// ⚠️ حدود مهمة لازم تتعرف:
// - العدّاد ده محفوظ في ذاكرة الـ process نفسه. في بيئة serverless (Vercel،
//   مثلاً) كل instance منفصل بيكون له ذاكرة خاصة بيه، يعني لو السيرفر شغّال
//   على أكتر من instance في نفس الوقت، أو لو الـ instance اتعمله cold start،
//   العداد بيتصفّر/بيتوزّع، والحماية الفعلية بتبقى أضعف من الرقم المكتوب.
// - ده أمان "أفضل من لا شيء" (يوقف bots بسيطة وسكربتات تلقائية)، مش حماية
//   كاملة ضد DDoS منظم. للإنتاج الحقيقي يُفضّل طبقة إضافية زي Upstash Redis
//   (rate limit موزّع) أو Cloudflare / WAF قدام التطبيق.
// - العدّاد بيكبر لحد ما نعمله cleanup — بنعمل cleanup تلقائي دوري عشان
//   الذاكرة متكبرش من غير حدود على سيرفر طويل العمر.

const buckets = new Map();
const MAX_TRACKED_KEYS = 5000; // سقف أمان لحجم الـ Map نفسه

function cleanup(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > entry.windowMs) buckets.delete(key);
  }
}

/**
 * @param {string} key - معرّف فريد (مثلاً "orders:<ip>")
 * @param {{limit: number, windowMs: number}} opts
 * @returns {{allowed: boolean, retryAfterSeconds: number}}
 */
export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED_KEYS) cleanup(now);

  let entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    entry = { windowStart: now, windowMs, count: 0 };
    buckets.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.windowStart + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

// بيحاول ياخد IP الزائر الحقيقي من هيدرز الـ proxy (Vercel/most hosts بيضيفوا
// x-forwarded-for). لو مفيش، بيرجع "unknown" — لسه بيحمي من bot واحد بيضرب
// بسرعة من غير أي هيدرز، بس أضعف لو فيه زوار كتير وراء نفس الـ proxy.
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function rateLimitResponse(retryAfterSeconds) {
  return Response.json(
    { error: "طلبات كتير في وقت قصير — حاول تاني بعد شوية" },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
