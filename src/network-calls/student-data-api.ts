/**
 * Where a session's data comes from.
 *
 * Screens ask one interface for the profile, timetable, planner, events and
 * clubs; which endpoints answer depends on the session, decided once here:
 * - live (academia / student-portal): the authenticated /auth/* endpoints,
 *   planner from the cache for Student Portal sessions;
 * - demo: the self-contained /demo/* programme;
 * - guest: only the public events and clubs.
 * No screen branches on the session kind for data (Open/Closed: a new session
 * kind is a new class, not edits across the app).
 */

import type { RequestConfig } from "@/lib/api/axios-client";
import { studentRequestConfig } from "@/lib/api/request-config";
import type { StudentSession } from "@/lib/auth/session";
import {
  fetchDemoClubs,
  fetchDemoEvents,
  fetchDemoProfile,
  fetchDemoTimetable,
} from "@/network-calls/demo";
import { fetchAllClubs } from "@/network-calls/getAllClubs";
import { fetchAllEvents } from "@/network-calls/getAllEvents";
import { fetchPlanner } from "@/network-calls/getPlanner";
import { fetchStudentProfile } from "@/network-calls/getStudentProfile";
import { fetchTimetable } from "@/network-calls/getTimetable";
import type {
  Club,
  ClubEvent,
  Planner,
  StudentProfile,
  TimetableResponse,
} from "@/network-calls/types";

export interface StudentDataApi {
  /** Cache scope for this session's queries. */
  readonly scope: string;
  /** Whether profile/timetable/planner exist for this session. */
  readonly hasStudentData: boolean;
  profile(): Promise<StudentProfile>;
  timetable(batch: number): Promise<TimetableResponse>;
  planner(): Promise<Planner>;
  events(): Promise<ClubEvent[]>;
  clubs(): Promise<Club[]>;
}

/** Thrown when a guest asks for student-only data. */
export class SignInRequiredError extends Error {
  constructor() {
    super("Sign in to see this.");
    this.name = "SignInRequiredError";
  }
}

class PublicDataApi implements StudentDataApi {
  readonly scope: string = "guest";
  readonly hasStudentData: boolean = false;

  constructor(protected readonly config: RequestConfig = {}) {}

  profile(): Promise<StudentProfile> {
    return Promise.reject(new SignInRequiredError());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timetable(_batch: number): Promise<TimetableResponse> {
    return Promise.reject(new SignInRequiredError());
  }

  planner(): Promise<Planner> {
    return Promise.reject(new SignInRequiredError());
  }

  async events(): Promise<ClubEvent[]> {
    return (await fetchAllEvents(this.config)).data?.events ?? [];
  }

  async clubs(): Promise<Club[]> {
    return (await fetchAllClubs(this.config)).data?.clubs ?? [];
  }
}

class LiveStudentDataApi extends PublicDataApi {
  override readonly scope: string;
  override readonly hasStudentData = true;
  private readonly cachedPlanner: boolean;

  constructor(session: StudentSession) {
    super(studentRequestConfig(session));
    this.scope = session.netId;
    this.cachedPlanner = session.kind === "student-portal";
  }

  override profile(): Promise<StudentProfile> {
    return fetchStudentProfile(this.config);
  }

  override timetable(batch: number): Promise<TimetableResponse> {
    return fetchTimetable(batch, this.config);
  }

  override planner(): Promise<Planner> {
    return fetchPlanner({ cached: this.cachedPlanner }, this.config);
  }
}

class DemoDataApi extends PublicDataApi {
  override readonly scope = "demo";
  override readonly hasStudentData = true;

  constructor(session: StudentSession) {
    super(studentRequestConfig(session));
  }

  override profile(): Promise<StudentProfile> {
    return fetchDemoProfile(this.config);
  }

  override timetable(): Promise<TimetableResponse> {
    return fetchDemoTimetable(this.config);
  }

  /** The demo programme has no academic planner. */
  override planner(): Promise<Planner> {
    return Promise.resolve({});
  }

  override async events(): Promise<ClubEvent[]> {
    return (await fetchDemoEvents(this.config)).data?.events ?? [];
  }

  override async clubs(): Promise<Club[]> {
    return (await fetchDemoClubs(this.config)).data?.clubs ?? [];
  }
}

export function createStudentDataApi(
  session: StudentSession | null,
): StudentDataApi {
  if (!session || session.kind === "guest") return new PublicDataApi();
  if (session.kind === "demo") return new DemoDataApi(session);
  return new LiveStudentDataApi(session);
}
