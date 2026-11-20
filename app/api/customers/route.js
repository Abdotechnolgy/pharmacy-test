import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

// العملاء بينضافوا تلقائيًا وقت أول طلب (شوف app/api/orders/route.js) — مفيش
// POST مباشر هنا، بس عرض وتعديل من لوحة التحكم.
export async function GET(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { data, error } = await supabaseAdmin.from("customers").select("*").order("created_at", { ascending: false });
  if (error) return safeError(error);
  return Response.json(rowsToCamel(data));
}
