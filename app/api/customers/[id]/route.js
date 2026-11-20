import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, rowsToCamel, objectToSnake } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

export async function GET(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { data: customer, error } = await supabaseAdmin.from("customers").select("*").eq("id", params.id).single();
  if (error) return safeError(error);
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false });
  return Response.json({ ...rowToCamel(customer), orders: rowsToCamel(orders) });
}

export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, orders, ...rest } = body;
  const { data, error } = await supabaseAdmin.from("customers").update(objectToSnake(rest)).eq("id", params.id).select().single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data));
}
