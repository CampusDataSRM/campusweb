import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Load the actual TypeScript seams with the repository's @/ alias, without
// adding a runtime dependency or starting Next just to test pure contracts.
const nodeRequire = createRequire(import.meta.url);
const cache = new Map();
function sourceModule(name) {
  const path = resolve(name.replace(/^@\//, "src/") + ".ts");
  if (cache.has(path)) return cache.get(path);
  const module = { exports: {} };
  cache.set(path, module.exports);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      require: (name) =>
        name.startsWith("@/") ? sourceModule(name) : nodeRequire(name),
    },
    { filename: path },
  );
  return module.exports;
}
const { parseSession } = sourceModule("@/lib/auth/session");
const { studentRequestConfig, studentPortalRequestConfig } = sourceModule(
  "@/lib/api/request-config",
);

test("cw-session preserves the unified token without requiring it on older sessions", () => {
  const legacy = {
    kind: "academia",
    token: "synthetic-cookies",
    netId: "test",
  };
  assert.equal(parseSession(JSON.stringify(legacy)).sessionToken, undefined);
  const parsed = parseSession(
    JSON.stringify({ ...legacy, sessionToken: "synthetic-unified" }),
  );
  assert.equal(parsed.sessionToken, "synthetic-unified");
  assert.equal(parsed.token, legacy.token);
  assert.equal(
    parseSession(JSON.stringify({ ...legacy, sessionToken: { invalid: true } }))
      .sessionToken,
    undefined,
  );
});
for (const kind of ["academia", "student-portal"])
  test(`${kind} request builders preserve both auth systems`, () => {
    const session = {
      kind,
      token: kind === "academia" ? "synthetic-cookies" : "sp_session=http_only",
      netId: "test",
      sessionToken: "synthetic-unified",
    };
    for (const build of [studentRequestConfig, studentPortalRequestConfig]) {
      const config = build(session);
      assert.equal(config.headers["X-Session-Token"], session.sessionToken);
      assert.equal(config.headers["X-CSRF-Token"], session.token);
      assert.equal(config.headers["X-Net-ID"], session.netId);
      if (kind === "student-portal" || build === studentPortalRequestConfig)
        assert.equal(config.withCredentials, true);
    }
  });
test("legacy, guest and demo requests remain compatible", () => {
  assert.equal(
    studentRequestConfig({ kind: "academia", netId: "test", token: "legacy" })
      .headers["X-Session-Token"],
    undefined,
  );
  assert.equal(
    Object.keys(studentRequestConfig({ kind: "guest", netId: "", token: "" }))
      .length,
    0,
  );
  assert.equal(
    studentRequestConfig({ kind: "demo", netId: "test", token: "demo-token" })
      .headers["X-Demo-Token"],
    "demo-token",
  );
});
