import "server-only";
import { createClient } from "@supabase/supabase-js";

// ⚠️ الملف ده سيرفر بس — مستورد "server-only" بيمنع تسريب المفتاح للمتصفح
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// الكود الأصلي بتاعك بيعتمد على اسم المتغير ده، فلازم نتأكد إنه مكتوب صح في .env.local
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SECRET_KEY مش موجودين في .env.local"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});