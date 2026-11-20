// Node native ESM requires explicit file extensions on relative imports, and
// infers CommonJS-vs-ESM per file from the nearest package.json "type" field.
// This project (like most Next.js apps) omits extensions everywhere and has
// no "type": "module" in package.json, because Next's own compiler (not
// plain Node) normally loads these files. This loader lets the *real,
// unmodified* app/lib source files be imported directly under plain Node for
// testing, by:
//   1) resolving extensionless relative specifiers to their .js file, and
//   2) forcing format "module" for those files so Node parses `import`/
//      `export` correctly regardless of package.json "type".
// It does not change, transpile, or rewrite any file content.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// This project intentionally does NOT ship fake copies of "next", "server-only"
// or "@supabase/supabase-js" in node_modules (node_modules is gitignored and
// never shipped — a real `npm install` installs the real packages). Instead,
// for these three bare specifiers only, this test-only loader redirects
// straight to the local stub files below, so the harness never has to write
// anything into node_modules.
const STUB_DIR = new URL("./stubs/", import.meta.url);
const BARE_SPECIFIER_STUBS = {
  "server-only": new URL("server-only.mjs", STUB_DIR).href,
  "next/server": new URL("next-server.mjs", STUB_DIR).href,
  "next/headers": new URL("next-headers.mjs", STUB_DIR).href,
  "@supabase/supabase-js": new URL("supabase-js.mjs", STUB_DIR).href,
};

export async function resolve(specifier, context, nextResolve) {
  if (Object.prototype.hasOwnProperty.call(BARE_SPECIFIER_STUBS, specifier)) {
    return { url: BARE_SPECIFIER_STUBS[specifier], format: "module", shortCircuit: true };
  }

  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  if (isRelative && !path.extname(specifier)) {
    const parentPath = fileURLToPath(context.parentURL);
    const baseDir = path.dirname(parentPath);
    const candidate = path.resolve(baseDir, specifier);
    const jsPath = `${candidate}.js`;
    const indexPath = path.join(candidate, "index.js");
    let resolvedPath = null;
    if (existsSync(jsPath)) resolvedPath = jsPath;
    else if (existsSync(indexPath)) resolvedPath = indexPath;
    if (resolvedPath) {
      return { url: pathToFileURL(resolvedPath).href, format: "module", shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
