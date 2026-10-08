import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function load(name, dependencies, window) {
  const path = resolve(name.replace(/^@\//, "src/") + ".ts");
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, {
    module: loadedModule,
    exports: loadedModule.exports,
    window,
    process,
    require: (dependency) => {
      if (dependency in dependencies) return dependencies[dependency];
      return load(dependency, dependencies, window);
    },
  });
  return loadedModule.exports;
}

function signOutHarness(session, revoke = async () => {}) {
  const events = [];
  const requests = [];
  const dependencies = {
    react: { useCallback: (callback) => callback },
    "@tanstack/react-query": {
      useQueryClient: () => ({ removeQueries: () => events.push("queries") }),
    },
    "@/context/session-context": {
      useSession: () => ({
        session,
        endSession: async () => events.push("end"),
      }),
    },
    "@/lib/auth/sign-in": {},
    "@/lib/cache/offline-cache": {
      clearCacheScope: async () => events.push("cache"),
    },
    "@/lib/toast": {},
    "@/network-calls/demo": {
      postDemoLogout: async () => events.push("demo"),
    },
    "@/network-calls/query-keys": {
      queryKeys: { student: { all: (scope) => [scope] } },
    },
    "@/lib/pwa/sw-client": {
      clearCachedPages: async () => events.push("pages"),
    },
    "@/lib/api/axios-client": {
      apiClient: {
        delete: async (url, config) => {
          events.push("revoke");
          requests.push({ url, config });
          await revoke();
        },
        get: async (url, config) => {
          events.push("legacy");
          requests.push({ url, config });
          return { data: "signed out" };
        },
      },
    },
  };
  const window = { location: { replace: (url) => events.push(url) } };
  const { useSignOut: createSignOut } = load(
    "@/hooks/use-auth-actions",
    dependencies,
    window,
  );
  return { signOut: createSignOut(), events, requests };
}

for (const kind of ["academia", "student-portal"]) {
  test(`${kind} logout awaits authenticated revocation before local cleanup`, async () => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    const session = {
      kind,
      token: "synthetic-legacy",
      netId: "test",
      sessionToken: "synthetic-unified",
      sessionId: "synthetic/id",
    };
    const { signOut, events, requests } = signOutHarness(
      session,
      () => pending,
    );
    const done = signOut();
    assert.deepEqual(events, ["revoke"]);
    assert.equal(requests[0].url, "/sessions/synthetic%2Fid");
    assert.equal(
      requests[0].config.headers["X-Session-Token"],
      session.sessionToken,
    );
    assert.equal(requests[0].config.headers["X-CSRF-Token"], session.token);
    assert.equal(requests[0].config.headers["X-Net-ID"], session.netId);
    if (kind === "student-portal")
      assert.equal(requests[0].config.withCredentials, true);
    release();
    await done;
    assert.deepEqual(events, [
      "revoke",
      "legacy",
      "queries",
      "cache",
      "pages",
      "end",
      "/",
    ]);
    assert.equal(requests[1].config.skipSessionRevokedRedirect, true);
  });

  test(`${kind} logout still clears local state when revocation fails`, async () => {
    const { signOut, events } = signOutHarness(
      {
        kind,
        token: "legacy",
        netId: "test",
        sessionId: "id",
        sessionToken: "unified",
      },
      async () => {
        throw new Error("network unavailable");
      },
    );
    await signOut();
    assert.deepEqual(events.slice(-2), ["end", "/"]);
    assert.ok(events.includes("legacy"));
  });
}

test("legacy sessions without sessionId still sign out", async () => {
  const { signOut, events } = signOutHarness({
    kind: "academia",
    token: "legacy",
    netId: "test",
  });
  await signOut();
  assert.equal(events.includes("revoke"), false);
  assert.ok(events.includes("legacy"));
  assert.deepEqual(events.slice(-2), ["end", "/"]);
});

for (const kind of ["demo", "guest"]) {
  test(`${kind} logout never revokes a student server session`, async () => {
    const { signOut, events } = signOutHarness({
      kind,
      token: "fixture",
      netId: "test",
      sessionId: "id",
    });
    await signOut();
    assert.equal(events.includes("revoke"), false);
    assert.equal(events.includes("legacy"), false);
    assert.equal(events.includes("demo"), kind === "demo");
    assert.deepEqual(events.slice(-2), ["end", "/"]);
  });
}

for (const intentionalLogout of [false, true]) {
  test(`revoked 401 ${intentionalLogout ? "during intentional logout avoids a remote notice" : "on normal calls still signs out immediately"}`, async () => {
    const events = [];
    let rejectResponse;
    load(
      "@/lib/api/axios-client",
      {
        axios: {
          default: {
            create: () => ({
              interceptors: {
                response: {
                  use: (_, rejected) => {
                    rejectResponse = rejected;
                  },
                },
              },
            }),
          },
        },
        "@/lib/auth/session": {
          clearStoredSession: async () => events.push("clear"),
        },
        "@/lib/pwa/sw-client": {
          clearCachedPages: async () => events.push("pages"),
        },
      },
      { location: { replace: (url) => events.push(url) } },
    );
    await assert.rejects(
      rejectResponse({
        response: { status: 401, data: { code: "session_revoked" } },
        config: intentionalLogout ? { skipSessionRevokedRedirect: true } : {},
      }),
      (error) => error.status === 401,
    );
    assert.deepEqual(
      events,
      intentionalLogout ? [] : ["clear", "pages", "/#session-revoked"],
    );
  });
}
