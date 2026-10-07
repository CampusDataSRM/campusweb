import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const workerSource = readFileSync("public/sw.js", "utf8");

test("dashboard redirects are never cached as dashboard HTML", async () => {
  const writes = [];
  const pending = [];
  const listeners = {};
  const response = {
    ok: true,
    type: "basic",
    redirected: true,
    clone() {
      return this;
    },
  };
  const store = {
    put: async (...args) => writes.push(args),
    keys: async () => [],
  };
  runInNewContext(workerSource, {
    self: {
      location: { origin: "https://campus.example" },
      addEventListener: (name, cb) => {
        listeners[name] = cb;
      },
    },
    URL,
    fetch: async () => response,
    caches: { open: async () => store },
    // Avoid waiting for the offline fallback; this test receives a network response.
    setTimeout: () => {},
  });
  let result;
  listeners.fetch({
    request: {
      method: "GET",
      url: "https://campus.example/student",
      mode: "navigate",
      headers: new Headers(),
    },
    preloadResponse: Promise.resolve(undefined),
    respondWith: (p) => {
      result = p;
    },
    waitUntil: (p) => pending.push(p),
  });
  assert.equal(await result, response);
  await Promise.all(pending);
  assert.equal(
    writes.length,
    0,
    "redirected events/login HTML must not be stored under /student",
  );
});

test("session changes clear every page-cache version but preserve static assets", async () => {
  const names = [
    "cw-pages-v1",
    "cw-pages-v2",
    "cw-pages-v3",
    "cw-static-v2",
    "other-app",
  ];
  const deleted = [];
  const module = { exports: {} };
  const code = ts.transpileModule(
    readFileSync("src/lib/pwa/sw-client.ts", "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  runInNewContext(code, {
    module,
    exports: module.exports,
    navigator: {},
    sessionStorage: { removeItem() {} },
    caches: {
      keys: async () => names,
      delete: async (name) => {
        deleted.push(name);
        return true;
      },
    },
  });
  await module.exports.clearCachedPages();
  assert.deepEqual(
    deleted.sort(),
    names.filter((n) => n.startsWith("cw-pages-")).sort(),
  );
});
