import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rowsToCamel, rowToCamel, objectToSnake } from "../../../lib/caseMap";
import { isAuthorizedAdminRequest, unauthorizedResponse } from "../../../lib/requireAdmin";
import { safeError } from "../../../lib/apiError";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("services").select("*").order("sort_order", { ascending: true });
  if (error) return safeError(error);
  
  // إعادة تحويل description إلى desc لكي يفهمه الفرونت إند
  const formattedData = data.map(item => {
    const { description, ...rest } = item;
    return { ...rest, desc: description || "" };
  });
  
  return Response.json(rowsToCamel(formattedData));
}

export async function POST(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  
  // فصل desc عن باقي البيانات
  const { id, desc, ...rest } = body;

  if (!rest.title?.trim()) return Response.json({ error: "عنوان الخدمة مطلوب" }, { status: 400 });

  // تحضير البيانات لقاعدة البيانات وتغيير desc إلى description
  const dbPayload = objectToSnake(rest);
  if (desc !== undefined) {
    dbPayload.description = desc;
  }

  const { data, error } = await supabaseAdmin.from("services").insert(dbPayload).select().single();
  if (error) return safeError(error);
  
  const responseData = rowToCamel(data);
  if (responseData.description !== undefined) {
      responseData.desc = responseData.description;
      delete responseData.description;
  }
  return Response.json(responseData, { status: 201 });
}

export async function PUT(request) {
  if (!(await isAuthorizedAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json();
  if (!Array.isArray(body)) return Response.json({ error: "المطلوب array من الخدمات" }, { status: 400 });

  const results = [];
  for (const service of body) {
    const { id, desc, ...rest } = service;
    
    const dbPayload = objectToSnake(rest);
    if (desc !== undefined) {
      dbPayload.description = desc;
    }

    const { data, error } = await supabaseAdmin.from("services").update(dbPayload).eq("id", id).select().single();
    if (error) return safeError(error);
    
    const responseData = rowToCamel(data);
    if (responseData.description !== undefined) {
        responseData.desc = responseData.description;
        delete responseData.description;
    }
    results.push(responseData);
  }
  return Response.json(results);
}