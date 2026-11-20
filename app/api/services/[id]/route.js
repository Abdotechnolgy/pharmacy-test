import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../../lib/requireAdmin";
import { safeError } from "../../../../lib/apiError";

export async function PUT(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;
  const { data, error } = await supabaseAdmin.from("services").update(objectToSnake(rest)).eq("id", params.id).select().single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data));
}

export async function DELETE(request, { params }) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const { error } = await supabaseAdmin.from("services").delete().eq("id", params.id);
  if (error) return safeError(error);
  return Response.json({ success: true });
}
