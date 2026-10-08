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
  const testModule = { exports: {} };
  const code = ts.transpileModule(
    readFileSync("src/lib/pwa/sw-client.ts", "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
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
  await testModule.exports.clearCachedPages();
  assert.deepEqual(
    deleted.sort(),
    names.filter((n) => n.startsWith("cw-pages-")).sort(),
  );
});

test("login entry pages bypass the worker cache", () => {
  const listeners = {};
  runInNewContext(workerSource, {
    self: {
      location: { origin: "https://campus.example" },
      addEventListener: (name, cb) => { listeners[name] = cb; },
    },
    URL,
  });
  for (const path of ["/", "/?fresh=1", "/club/login"]) {
    listeners.fetch({
      request: {
        method: "GET", url: `https://campus.example${path}`,
        mode: "navigate", headers: new Headers(),
      },
      respondWith() { assert.fail("login must reach the server directly"); },
    });
  }
});

test("worker upgrade refreshes stale login windows and leaves dashboard alone", async () => {
  const listeners = {};
  const navigated = [];
  const deleted = [];
  runInNewContext(workerSource, {
    self: {
      location: { origin: "https://campus.example" },
      addEventListener: (name, cb) => { listeners[name] = cb; },
      registration: {},
      clients: {
        claim: async () => {},
        matchAll: async () => ["/", "/club/login", "/student"].map((path) => ({
          url: `https://campus.example${path}`,
          navigate: async (url) => { navigated.push(url); },
        })),
      },
    },
    URL,
    caches: {
      keys: async () => ["cw-pages-v3", "cw-pages-v4"],
      delete: async (name) => { deleted.push(name); },
    },
  });
  let completion;
  listeners.activate({ waitUntil(p) { completion = p; } });
  await completion;
  assert.deepEqual(deleted, ["cw-pages-v3"]);
  assert.deepEqual(navigated, ["https://campus.example/", "https://campus.example/club/login"]);
});
