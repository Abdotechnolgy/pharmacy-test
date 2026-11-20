import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, rowsToCamel } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

const VALID_STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"];

export async function GET(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
  if (error) return safeError(error);
  const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", params.id);
  return Response.json({ ...rowToCamel(order), items: rowsToCamel(items) });
}

export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  if (!VALID_STATUSES.includes(body.status)) {
    return Response.json({ error: "حالة الطلب غير صحيحة" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("orders").update({ status: body.status }).eq("id", params.id).select().single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data));
}
