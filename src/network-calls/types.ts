/**
 * Shared API response types.
 *
 * Add endpoint-specific types here (or in sibling files) as the API surface
 * grows. Keep these in sync with the actual API signatures.
 */

/** POST /auth/login — request body. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** POST /auth/login — SRM Academia account lookup step (`postResponse.lookup`). */
export interface LoginLookup {
  admin?: string;
  digest?: string;
  doc_link?: string;
  href?: string;
  identifier?: string;
  loginid?: string;
  org_name?: string;
  show_setpassword?: boolean;
  modes?: {
    allowed_modes?: string[];
    email?: {
      count?: number;
      data?: Array<{
        e_email?: string;
        email?: string;
        isPrimary?: boolean;
      }>;
    };
  };
}

/** POST /auth/login — password-authentication step (`passResponse`). */
export interface LoginPassResponse {
  code?: string;
  message?: string;
  resource_name?: string;
  status_code?: number;
  passwordauth?: {
    code?: string;
    href?: string;
    redirect_uri?: string;
  };
}

/**
 * POST /auth/login — full response.
 *
 * The backend proxies an SRM Academia sign-in: `postResponse` is the account
 * lookup step, `passResponse` the password-auth step, and `Cookies` carries
 * the harvested Academia session cookies as a raw string.
 */
export interface LoginResponse {
  postResponse?: {
    code?: string;
    message?: string;
    resource_name?: string;
    status_code?: number;
    lookup?: LoginLookup;
  };
  passResponse?: LoginPassResponse;
  /** Raw SRM Academia session cookies — required by authenticated endpoints. */
  Cookies?: string;
  /** "success" on a completed sign-in; other values indicate failure. */
  Status?: string;
  Message?: string;
}

/** GET /auth/planner — one calendar day inside a month block. */
export interface PlannerDay {
  /** Day-of-month, e.g. "21". */
  Date: string;
  /** Weekday abbreviation, e.g. "Wed". */
  Day: string;
  /** Event label; empty string when none. */
  Event: string;
  /** Timetable day order, e.g. "1"; "-" when the day has no order. */
  Dayorder: string;
}

/** GET /auth/planner — per-month block of the academic-year planner. */
export interface PlannerMonth {
  Data: PlannerDay[];
  /** Days-of-month counted as holidays/weekends, e.g. [15, 16]. */
  Holiday: number[];
  HolidayCount: number;
}

/**
 * GET /auth/planner — academic-year planner keyed by month label,
 * e.g. "Jul '26" → PlannerMonth.
 *
 * Authenticated: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header.
 */
export type Planner = Record<string, PlannerMonth>;

/** POST /student-portal/login — request body. */
export interface StudentPortalLoginRequest {
  net_id: string;
  password: string;
  registration_number: string;
}

/** POST /student-portal/login — response. */
export interface StudentPortalLoginResponse {
  /** Active semester id, e.g. "7". */
  semester_id: string;
  /** "success" on sign-in; other values indicate failure. */
  status: string;
}

/** POST /student-portal/attendance — request body. */
export interface AttendanceRequest {
  net_id: string;
}

/** POST /student-portal/attendance — per-subject attendance row. */
export interface AttendanceSubject {
  subjectcode: string;
  subjectdesc: string;
  /** String-encoded numbers throughout, e.g. "25", "85.71". */
  present: string;
  absent: string;
  total: string;
  presentpercentage: string;
}

/** POST /student-portal/attendance — response. */
export interface AttendanceResponse {
  attendance: AttendanceSubject[];
  /** Echoed back uppercased by the backend, e.g. "AC2741". */
  net_id: string;
  /** "success" on a completed fetch; other values indicate failure. */
  status: string;
}

/** POST /auth/force-refresh/user — one registered course with live attendance. */
export interface UserCourse {
  courseCode: string;
  courseTitle: string;
  /** String-encoded throughout, e.g. "3", "25.00". */
  credit: string;
  serialNo: string;
  regnType: string;
  /** e.g. "Professional Elective", "Open Elective". */
  category: string;
  /** e.g. "Theory", "Practical". */
  courseType: string;
  facultyName: string;
  /** Timetable slot, e.g. "A"; practicals use ranges like "P46-P47-P48-". */
  slot: string;
  gcrCode: string;
  /** e.g. "AY2026-27-ODD". */
  academicYear: string;
  hoursConducted: string;
  hoursAbsent: string;
  hoursPresent: string;
  /** Slack above the attendance requirement; 0 when at/below it. */
  margin: number;
  /** Minimum required percentage; 0 when not yet applicable. */
  required: number;
  attendancePercent: string;
  practicalDetails: string;
  roomNo: string;
}

/** POST /auth/force-refresh/user — one named test's marks inside a course. */
export interface UserTestMark {
  got: number;
  percentage: number;
  total: number;
}

/** POST /auth/force-refresh/user — per-course test performance. */
export interface UserTestPerformance {
  courseCode: string;
  courseType: string;
  courseName: string;
  /** Keyed by test name, e.g. "Internal Marks"; empty when none published. */
  tests: Record<string, UserTestMark>;
  totalMarkGot: number;
  totalMarks: number;
}

/** POST /auth/force-refresh/user — a faculty/counselor advisor entry. */
export interface UserAdvisor {
  /** e.g. "Counselor", "Faculty Advisor", "Academic Advisor". */
  role: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * POST /auth/force-refresh/user — full live user profile scraped fresh from
 * Academia (vs. the cached /auth/user), including courses, marks, advisors.
 *
 * Authenticated: requires the Academia session cookies (login response's
 * `Cookies` string) as `X-CSRF-Token` and the net id as `X-Net-ID`.
 */
export interface ForceRefreshUserResponse {
  registrationNumber: string;
  name: string;
  mobile: string;
  program: string;
  department: string;
  specialization: string;
  /** e.g. "7". */
  semester: string;
  /** Timetable batch, e.g. "1". */
  comboBatch: string;
  feedbackStatus: string;
  enrollmentStatus: string;
  doe: string;
  photoId: string;
  classRoom: string;
  courses: UserCourse[];
  testPerformances: UserTestPerformance[];
  advisors: UserAdvisor[];
  /** Whether the student-portal session needs (re)establishing. */
  studentPortalLoginRequired: boolean;
  /** e.g. "student_portal" — where attendance data comes from. */
  attendanceSource: string;
}

/**
 * GET /auth/feedback — feedback-form availability probe.
 *
 * Observed failure shape: { message, status: "fail" } when the form is not
 * currently available. The success shape (actual form payload) is not yet
 * observed — extend this interface when a success response is captured.
 */
export interface FeedbackResponse {
  message: string;
  /** "fail" when unavailable; presumably "success" otherwise. */
  status: string;
}

/** POST /auth/feedback — feedback submission body. */
export interface FeedbackRequest {
  /** e.g. "Excellent". */
  rating: string;
  comment: string;
}

/** POST /auth/club-login — request body. */
export interface ClubLoginRequest {
  email: string;
  password: string;
}

/** POST /auth/club-login — response. */
export interface ClubLoginResponse {
  /** "success" on sign-in; other values indicate failure. */
  status: string;
  /** JWT for authenticated club endpoints. */
  token: string;
}

/**
 * GET /users/allevent — a club event. Public endpoint, no auth required.
 *
 * Note `ods_provided`, `refreshments_provided`, and `website_link` are absent
 * on some records — always optional to consume.
 */
export interface ClubEvent {
  id: string;
  club_id: string;
  club_name: string;
  banner_url: string;
  title: string;
  /** Registration/info link. */
  website_link?: string;
  /** e.g. "2025-11-05 to 2025-11-05". */
  dates: string;
  /** e.g. "09:00 to 16:00". */
  timing: string;
  ods_provided?: boolean;
  refreshments_provided?: boolean;
  /** Up to three free-text labels; entries may be empty strings. */
  labels: string[];
  logo: string;
  popularity: number;
  /** Registration numbers of users who liked the event. */
  likedby: string[];
  created_at: string;
  updated_at: string;
}

/** GET /users/allevent — response. */
export interface AllEventsResponse {
  data: {
    events: ClubEvent[];
  };
  /** "success" on a completed fetch; other values indicate failure. */
  status: string;
}

/** GET /auth/timetable/{batch} — one class slot. */
export interface TimetableSlot {
  subject_name: string;
  /** e.g. "Theory" | "Practical"; "N/A" for free slots. */
  subject_type: string;
  /** Room, e.g. "LH1305"; "" (unassigned), "To be Alloted", or "N/A". */
  room_code: string;
}

/** GET /auth/timetable/{batch} — one day of slots keyed by time range, e.g. "08:00 - 08:50". */
export type TimetableDay = Record<string, TimetableSlot>;

/** GET /auth/timetable/{batch} — the week's days keyed "Day1".."Day5". */
export type Timetable = Record<string, TimetableDay>;

/**
 * GET /auth/timetable/{batch} — weekly timetable for a batch (1 or 2).
 *
 * Authenticated: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header.
 */
export interface TimetableResponse {
  /** e.g. "1"; "No Day Order" outside term time. */
  day_order: string;
  timetable: Timetable;
}
