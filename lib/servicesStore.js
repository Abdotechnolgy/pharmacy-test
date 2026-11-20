import { adminFetch } from "./adminFetch";

// ✏️ الخدمات بقت بتتخزن في جدول services حقيقي في Supabase بدل localStorage.
export async function loadServices(seed) {
  try {
    const res = await fetch("/api/services", { cache: "no-store" });
    if (!res.ok) return seed;
    const data = await res.json();
    return data.length ? data : seed;
  } catch {
    return seed;
  }
}

export async function saveServices(services) {
  const existing = services.filter((s) => s.id != null);
  if (existing.length) {
    return adminFetch("/api/services", { method: "PUT", body: JSON.stringify(existing) });
  }
}

export async function createService(service) {
  return adminFetch("/api/services", { method: "POST", body: JSON.stringify(service) });
}

export async function deleteService(id) {
  return adminFetch(`/api/services/${id}`, { method: "DELETE" });
}

export async function resetServices(seed) {
  await saveServices(seed);
  return seed;
}

export function sortServices(services) {
  return [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getHomepageServices(services) {
  return sortServices(services.filter((s) => s.isActive !== false));
}
