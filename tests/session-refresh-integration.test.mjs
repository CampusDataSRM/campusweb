import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function clientHarness(currentToken = "active-session") {
  let fulfilled, rejected;
  const actions = [];
  const client = {
    interceptors: {
      response: {
        use(ok, error) {
          fulfilled = ok;
          rejected = error;
        },
      },
    },
  };
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(
    readFileSync("src/lib/api/axios-client.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  runInNewContext(code, {
    module: loadedModule,
    exports: loadedModule.exports,
    process: { env: {} },
    window: {
      location: {
        replace(url) {
          actions.push(["redirect", url]);
        },
      },
    },
    require(name) {
      if (name === "axios") return { default: { create: () => client } };
      if (name === "@/lib/auth/session")
        return {
          readSession: async () => ({ sessionToken: currentToken }),
          clearStoredSession: async () => {
            actions.push(["clear-session"]);
          },
        };
      if (name === "@/lib/pwa/sw-client")
        return {
          clearCachedPages: async () => {
            actions.push(["clear-pages"]);
          },
        };
      throw new Error(`Unexpected module: ${name}`);
    },
  });
  return { fulfilled, rejected, actions };
}
const revoked = (token = "active-session", extra = {}) => ({
  status: 401,
  data: { code: "session_revoked" },
  config: { headers: { "X-Session-Token": token }, ...extra },
});
const signOutActions = [
  ["clear-session"],
  ["clear-pages"],
  ["redirect", "/#session-revoked"],
];

test("refresh responses accepted by validateStatus still remotely sign out", async () => {
  const h = clientHarness();
  await assert.rejects(h.fulfilled(revoked()), {
    name: "ApiError",
    status: 401,
  });
  assert.deepEqual(h.actions, signOutActions);
});

test("normal rejected requests use the same revocation handler only once", async () => {
  const h = clientHarness();
  const response = revoked();
  const error = { response, config: response.config, message: "Unauthorized" };
  await Promise.all([
    assert.rejects(h.rejected(error), { name: "ApiError", status: 401 }),
    assert.rejects(h.rejected(error), { name: "ApiError", status: 401 }),
  ]);
  assert.deepEqual(h.actions, signOutActions);
});

test("a stale revoked response cannot clear a replacement QR session", async () => {
  const h = clientHarness("replacement-session");
  await assert.rejects(h.fulfilled(revoked("previous-session")), {
    status: 401,
  });
  assert.deepEqual(h.actions, []);
});

test("intentional logout and ordinary credential failures do not show remote sign-out", async () => {
  const h = clientHarness();
  await assert.rejects(
    h.fulfilled(
      revoked("active-session", { skipSessionRevokedRedirect: true }),
    ),
    { status: 401 },
  );
  const ordinary = { ...revoked(), data: { code: "invalid_credentials" } };
  assert.equal(await h.fulfilled(ordinary), ordinary);
  assert.deepEqual(h.actions, []);
});
