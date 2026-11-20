// تحويل بسيط بين snake_case (قاعدة البيانات) و camelCase (الفرونت إند) —
// عشان الـ API يرجّع نفس الشكل اللي الكومبوننتات متعودة عليه من localStorage
// بالظبط، ومحتاجش نغيّر منطق الكومبوننتات نفسها.
function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function toSnake(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function rowToCamel(row) {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[toCamel(key)] = value;
  }
  return out;
}

export function rowsToCamel(rows) {
  return (rows || []).map(rowToCamel);
}

export function objectToSnake(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[toSnake(key)] = value;
  }
  return out;
}
