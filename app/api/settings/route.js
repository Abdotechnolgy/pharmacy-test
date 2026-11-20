import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

// صف واحد بس (id=1) — إعدادات الموقع العامة (واتساب، خرائط، سوشيال ميديا)
export async function GET() {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data));
}

export async function PUT(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;
  const { data, error } = await supabaseAdmin.from("site_settings").update(objectToSnake(rest)).eq("id", 1).select().single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data));
}
