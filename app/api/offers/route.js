import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel, rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

function validateOffer(offer) {
  if (offer.productId == null) return "لازم تختار منتج للعرض";
  if (!(Number(offer.newPrice) > 0)) return "السعر الجديد لازم يكون رقم أكبر من صفر";
  if (offer.oldPrice != null && Number(offer.newPrice) >= Number(offer.oldPrice)) {
    return "السعر الجديد لازم يكون أقل من السعر القديم";
  }
  if (offer.startDate && offer.endDate && offer.endDate < offer.startDate) {
    return "تاريخ النهاية لازم يكون بعد تاريخ البداية";
  }
  return null;
}

export async function GET() {
  const { data, error } = await supabaseAdmin.from("offers").select("*").order("id", { ascending: true });
  if (error) return safeError(error);
  return Response.json(rowsToCamel(data));
}

export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  const { id, ...rest } = body;

  const validationError = validateOffer(rest);
  if (validationError) return Response.json({ error: validationError }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("offers").insert(objectToSnake(rest)).select().single();
  if (error) return safeError(error);
  return Response.json(rowToCamel(data), { status: 201 });
}

export async function PUT(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  if (!Array.isArray(body)) return Response.json({ error: "المطلوب array من العروض" }, { status: 400 });

  const results = [];
  for (const offer of body) {
    const { id, ...rest } = offer;
    const validationError = validateOffer(rest);
    if (validationError) return Response.json({ error: validationError }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("offers").update(objectToSnake(rest)).eq("id", id).select().single();
    if (error) return safeError(error);
    results.push(rowToCamel(data));
  }
  return Response.json(results);
}
