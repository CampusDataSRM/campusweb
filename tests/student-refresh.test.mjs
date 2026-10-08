import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

// Exercise the actual TypeScript modules without a browser or real credentials.
function load(file, dependencies = {}) {
  const source = ts.transpileModule(
    readFileSync(new URL("../" + file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const loadedModule = { exports: {} };
  runInThisContext(`(function(require,module,exports){${source}\n})`, {
    filename: file,
  })(
    (name) => dependencies[name] ?? createRequire(import.meta.url)(name),
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}
const policy = load("src/lib/student/refresh-policy.ts");
const academia = { kind: "academia", netId: "sample", token: "test-only" };

test("route choice respects linked Portal accounts, normal Academia, and dashboard", () => {
  assert.equal(
    policy.usesPortalRefresh(
      academia,
      { attendanceSource: "student_portal" },
      "marks",
    ),
    true,
  );
  assert.equal(
    policy.usesPortalRefresh(
      academia,
      { attendanceSource: "student_portal", studentPortalLoginRequired: true },
      "attendance",
    ),
    false,
  );
  assert.equal(policy.usesPortalRefresh(academia, {}, "marks"), false);
  assert.equal(
    policy.usesPortalRefresh(
      { ...academia, kind: "student-portal" },
      {},
      "attendance",
    ),
    true,
  );
  assert.equal(
    policy.usesPortalRefresh(
      academia,
      { attendanceSource: "student_portal" },
      "dashboard",
    ),
    false,
  );
});
test("server notices distinguish stale results, recent checks, and 429 without headers", () => {
  assert.equal(
    policy.refreshNotice(200, { "x-refresh-status": "STALE_ON_ERROR" }).stale,
    true,
  );
  assert.equal(
    policy.refreshNotice(200, { "x-refresh-status": "RECENT_CHECK" }).limited,
    true,
  );
  assert.equal(
    policy.refreshNotice(200, {
      "x-force-refresh-limited": "true",
      "retry-after": "30",
    }).retryAfter,
    30,
  );
  assert.equal(policy.refreshNotice(429, {}).limited, true);
  assert.equal(policy.refreshNotice(200, {}).limited, false);
});
const rows = [
  {
    subjectcode: " CS101 REGULAR",
    subjectdesc: "Sample",
    present: "15",
    absent: "5",
    total: "20",
  },
];
const profile = {
  name: "Student",
  testPerformances: [{ tests: { "FT-I": { got: 3, total: 5 } } }],
  courses: [
    {
      courseCode: "CS101",
      courseTitle: "Sample",
      hoursPresent: "1",
      credit: "3",
    },
  ],
};
test("attendance refresh preserves marks and metadata and derives the 75% margin", () => {
  const result = policy.mergePortalAttendance(profile, rows);
  assert.equal(result.courses[0].hoursPresent, "15");
  assert.equal(result.courses[0].attendancePercent, "75");
  assert.equal(result.courses[0].required, 0);
  assert.equal(result.courses[0].credit, "3");
  assert.deepEqual(result.testPerformances, profile.testPerformances);
  assert.equal(profile.courses[0].hoursPresent, "1");
});
test("invalid attendance does not replace a good saved course", () => {
  assert.deepEqual(
    policy.mergePortalAttendance(profile, [{ ...rows[0], total: "30" }])
      .courses,
    profile.courses,
  );
});
test("portal combined J-code attendance is counted only once", () => {
  const result = policy.mergePortalAttendance(
    {
      ...profile,
      courses: [
        { courseCode: "CS101J", courseTitle: "Sample", courseType: "Theory" },
        {
          courseCode: "CS101J",
          courseTitle: "Sample",
          courseType: "Practical",
        },
      ],
    },
    [{ ...rows[0], subjectcode: "CS101J" }],
  );
  assert.equal(
    result.courses.reduce((sum, c) => sum + Number(c.hoursPresent), 0),
    15,
  );
  assert.equal(result.courses[1].hoursConducted, "0");
});
test("shared cooldown survives a new gate and isolates accounts", async () => {
  let now = 1000;
  const saved = new Map();
  let calls = 0;
  const make = () =>
    new policy.RefreshGate(
      async (k) => saved.get(k) ?? null,
      async (k, v) => saved.set(k, v),
      () => now,
    );
  const gate = make(),
    work = async () => ({ value: ++calls });
  await gate.run("a", work);
  assert.equal((await make().run("a", work)).blocked, "cooldown");
  await gate.run("b", work);
  assert.equal(calls, 2);
  now += 15000;
  await gate.run("a", work);
  assert.equal(calls, 3);
});
test("in-flight guard is acquired before storage resolves; failed calls can retry", async () => {
  let release;
  const held = new Promise((r) => (release = r));
  const gate = new policy.RefreshGate(
    async () => {
      await held;
      return null;
    },
    async () => {},
  );
  const first = gate.run("a", async () => {
    throw new Error("offline");
  });
  assert.equal(
    (await gate.run("a", async () => ({ value: 1 }))).blocked,
    "busy",
  );
  release();
  await assert.rejects(first, /offline/);
  assert.equal((await gate.run("a", async () => ({ value: 2 }))).value, 2);
});
test("server Retry-After extends the shared cooldown", async () => {
  let now = 100;
  const gate = new policy.RefreshGate(
    async () => null,
    async () => {},
    () => now,
  );
  await gate.run("a", async () => ({ value: [], cooldown: 60 }));
  now += 15000;
  assert.equal((await gate.run("a", async () => ({ value: 1 }))).seconds, 45);
});
let response, request;
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
const network = load("src/network-calls/forceRefreshUser.ts", {
  "@/lib/api/axios-client": {
    ApiError,
    apiClient: {
      request: async (config) => {
        request = config;
        return response;
      },
    },
  },
  "@/lib/student/refresh-policy": policy,
});
test("force profile uses app GET route and preserves auth configuration", async () => {
  response = { status: 200, headers: {}, data: { name: "Student" } };
  await network.forceRefreshUser({
    headers: { "X-Net-ID": "sample", "X-CSRF-Token": "test-only" },
  });
  assert.equal(request.method, "GET");
  assert.equal(request.url, "/auth/force-refresh/user");
  assert.equal(request.timeout, 20000);
  assert.equal(request.headers["X-Net-ID"], "sample");
});
test("Portal request sends force_refresh and credentials with 30-second timeout", async () => {
  response = {
    status: 200,
    headers: {},
    data: { status: "success", testPerformances: [] },
  };
  await network.requestForceRefresh(
    "/student-portal/marks",
    { withCredentials: true },
    { net_id: "sample", force_refresh: true },
  );
  assert.equal(request.method, "POST");
  assert.equal(request.withCredentials, true);
  assert.equal(request.timeout, 30000);
  assert.equal(request.data.force_refresh, true);
});
test("429 preserves existing data and tells the caller to wait", async () => {
  response = {
    status: 429,
    headers: { "retry-after": "45" },
    data: { error: "rate limited" },
  };
  const result = await network.requestForceRefresh(
    "/auth/force-refresh/user",
    {},
  );
  assert.equal(result.data, undefined);
  assert.equal(result.notice.retryAfter, 45);
});
test("expired session, malformed response and error payload are never accepted as data", async () => {
  for (const value of [
    { status: 401, data: {} },
    { status: 500, data: {} },
    { status: 200, data: "not json" },
    { status: 200, data: { error: "upstream" } },
  ]) {
    response = { headers: {}, ...value };
    await assert.rejects(
      network.requestForceRefresh("/auth/force-refresh/user", {}),
    );
  }
});

function refreshHarness({
  session = academia,
  profile: seed = profile,
  request: fetch = async () => {
    throw new Error("unexpected request");
  },
} = {}) {
  let options,
    current = session;
  const values = new Map(),
    writes = [],
    invalidations = [],
    calls = [];
  const key = (...parts) => parts;
  const keys = {
    student: {
      profile: (s) => key("student", s, "profile"),
      timetable: (s, b) => key("student", s, "timetable", b),
      planner: (s) => key("student", s, "planner"),
    },
    events: { list: (s) => key("events", s) },
  };
  values.set(JSON.stringify(keys.student.profile(session.netId)), seed);
  const client = {
    getQueryData: (k) => values.get(JSON.stringify(k)),
    setQueryData: (k, v) => values.set(JSON.stringify(k), v),
    cancelQueries: async () => {},
    invalidateQueries: async (k) => invalidations.push(k),
  };
  const mod = load("src/hooks/use-student-refresh.ts", {
    "@tanstack/react-query": {
      useQueryClient: () => client,
      useIsMutating: () => 0,
      useMutation: (o) => {
        options = o;
        return { mutate: () => {} };
      },
    },
    "@/context/session-context": {
      useSession: () => ({ session, hydrated: true }),
    },
    "@/hooks/use-student-data": {
      useProfile: () => ({ data: seed }),
      useStudentDataApi: () => ({
        scope: session.netId,
        profile: async () => seed,
        timetable: async () => ({ timetable: { Day1: [] } }),
      }),
    },
    "@/lib/api/request-config": {
      studentRequestConfig: () => ({}),
      studentPortalRequestConfig: () => ({ withCredentials: true }),
    },
    "@/lib/auth/session": { readSession: async () => current },
    "@/lib/cache/offline-cache": {
      writeCache: async (...args) => writes.push(args),
    },
    "@/lib/storage": {
      storageGet: async () => null,
      storageSet: async () => {},
    },
    "@/lib/student/profile": { isUsableProfile: (p) => !!p?.name },
    "@/lib/student/refresh-policy": policy,
    "@/lib/student/timetable": { batchFromCombo: (v) => Number(v) || null },
    "@/lib/toast": { notify: { success() {}, info() {}, error() {} } },
    "@/network-calls/forceRefreshUser": {
      requestForceRefresh: async (...args) => {
        calls.push(args);
        return fetch(...args);
      },
    },
    "@/network-calls/query-keys": { queryKeys: keys },
  });
  return {
    run: (target) => {
      mod.useStudentRefresh(target);
      return options.mutationFn();
    },
    switchAccount: (s) => {
      current = s;
    },
    values,
    writes,
    invalidations,
    calls,
  };
}
const normalNotice = { limited: false, stale: false, retryAfter: 15 };
test("marks refresh commits split tests to memory and disk without changing attendance", async () => {
  const tests = [
    {
      courseCode: "CS101",
      tests: { "FT-I": { got: 3, total: 5 }, "FT-II": { got: 11, total: 15 } },
    },
  ];
  const h = refreshHarness({
    profile: { ...profile, attendanceSource: "student_portal" },
    request: async () => ({
      data: { status: "success", testPerformances: tests },
      notice: normalNotice,
    }),
  });
  await h.run("marks");
  assert.equal(h.calls[0][0], "/student-portal/marks");
  assert.equal(h.calls[0][2].force_refresh, true);
  const saved = h.writes[0][2];
  assert.deepEqual(saved.testPerformances, tests);
  assert.deepEqual(saved.courses, profile.courses);
});
test("empty portal marks cannot erase saved split results", async () => {
  const h = refreshHarness({
    profile: { ...profile, attendanceSource: "student_portal" },
    request: async () => ({
      data: { status: "success", testPerformances: [] },
      notice: normalNotice,
    }),
  });
  await h.run("marks");
  assert.equal(h.writes.length, 0);
});
test("account change during network request prevents query and disk writes", async () => {
  const h = refreshHarness({
    request: async () => {
      h.switchAccount({ ...academia, netId: "other" });
      return { data: profile, notice: normalNotice };
    },
  });
  await assert.rejects(h.run("marks"), /account changed/);
  assert.equal(h.writes.length, 0);
});
test("dashboard refresh uses the new profile batch and invalidates ancillary data", async () => {
  const h = refreshHarness({
    request: async (path) => ({
      data: path.endsWith("/user")
        ? { ...profile, comboBatch: "2" }
        : { timetable: { Day1: [] } },
      notice: normalNotice,
    }),
  });
  await h.run("dashboard");
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ["/auth/force-refresh/user", "/auth/force-refresh/timetable/2"],
  );
  assert.equal(h.writes.length, 2);
  assert.equal(h.invalidations.length, 2);
});
test("demo refresh never invokes live authenticated force routes", async () => {
  const h = refreshHarness({
    session: { ...academia, kind: "demo", netId: "demo" },
  });
  await h.run("dashboard");
  assert.equal(h.calls.length, 0);
  assert.equal(h.writes.length, 2);
});
test("failed refresh leaves the existing cached profile intact", async () => {
  const h = refreshHarness({
    request: async () => {
      throw new Error("offline");
    },
  });
  await assert.rejects(h.run("attendance"), /offline/);
  assert.equal(h.writes.length, 0);
  assert.deepEqual(
    h.values.get(JSON.stringify(["student", "sample", "profile"])),
    profile,
  );
});

test("same-account QR re-login during refresh prevents stale query and disk writes", async () => {
  const session = {
    ...academia,
    sessionToken: "old-session",
    sessionId: "old-device",
  };
  const h = refreshHarness({
    session,
    request: async () => {
      h.switchAccount({
        ...session,
        sessionToken: "new-session",
        sessionId: "new-device",
      });
      return { data: profile, notice: normalNotice };
    },
  });
  await assert.rejects(h.run("marks"), /account changed/);
  assert.equal(h.writes.length, 0);
  assert.deepEqual(
    h.values.get(JSON.stringify(["student", "sample", "profile"])),
    profile,
  );
});
