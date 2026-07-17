# CampusWeb Project Documentation

## 1. Project Overview
**CampusWeb** is a Next.js (Version 14) application serving as a comprehensive campus solution. It offers portals for both students and clubs. Key technologies include React, Tailwind CSS, Shadcn UI, Chart.js, and various analytics providers (PostHog, Google Analytics, Microsoft Clarity).

## 2. Infrastructure & Configuration
- **Framework:** Next.js 14
- **Styling:** Tailwind CSS with Shadcn UI components
- **Package Manager:** npm
- **Deployment Build:** Static output (`output: "export"`) with trailing slashes, configured in [next.config.mjs](../next.config.mjs)
- **Analytics:** 
  - PostHog (`CampusWebPostHogProvider`)
  - Google Analytics (`gtag`)
  - Microsoft Clarity

### 2.1 Next.js Configuration ([next.config.mjs](../next.config.mjs))
- Static HTML export is enabled.
- Images are unoptimized (`unoptimized: true`) due to static export constraints.
- Environment variables include `NEXT_PUBLIC_SERVE` through `NEXT_PUBLIC_SERVE_9`.

## 3. Theme Specifications (UI/UX)
The project relies on Tailwind CSS for global styling and specific theming found in [tailwind.config.js](../tailwind.config.js) and [app/globals.css](../app/globals.css).

### 3.1 Colors
- **Primary:** `#0094FF` (`theme_primary`)
- **Secondary:** `#9747FF` (`theme_secondary`)
- **Text Normal:** `#ffffff` (`theme_text_normal`) with a 60% opacity variant.
- **Text Primary:** `#91C3E7` (`theme_text_primary`)
- **Alert Colors:** Green (`#00FF38`), Red (`#FF0000`)
- **Backgrounds:** Complex background with multiple blurred radial gradients rendering an animated, premium dark theme.

### 3.2 Typography & Fonts
- **Font:** Inter (Primary App Font) and Nunito (used in [globals.css](../app/globals.css) and toast notifications).

### 3.3 Micro-Animations & Custom Styles
- **Loader:** Custom keyframe animation `loader` translating Y-axis and changing opacity.
- **Floating Nav Height:** `6rem` custom padding.
- **Translucent UI Elements:** Date pickers and specific containers use `backdrop-filter: blur()`, giving a glassmorphism effect (e.g., `translucent-date-range`).
- **Dark Mode:** Shadcn predefined color tokens are heavily used (oklch format) emphasizing dark mode as default or core visual aesthetic.

## 4. Pages and Routing Structure
The application employs Next.js App Router (`app/`). The major modules are broadly categorized into **Public/Auth**, **Student Portal**, and **Club Portal**.

### 4.1 Public & Auth Routes
- [/page.js](../app/page.js): Landing page.
- `/about`: About the campus web application.
- `/privacy-policy`: Privacy policy page.
- `/client/login/student`: Student Login Portal.
- `/client/login/club`: Club Login Portal.
- `/client/login/club/forgot-password`: Club Password Reset flow.
- `/client/signup/club`: Club Signup Portal.

### 4.2 Student Portal Routes (`/student/*`)
- `/student`: Student Dashboard.
- `/student/attendance`: Check attendance records.
- `/student/calendar`: Academic/Event Calendar.
- `/student/cgpacalc`: CGPA Calculator utility.
- `/student/clubs`: List of all clubs.
- `/student/clubs/view`: Specific club details.
- `/student/events`: Browse campus events.
- `/student/marks`: Student grading/marks overview.
- `/student/planner`: Student daily/monthly planner.
- `/student/timetable`: Schedule and timetable view.
- `/student/whatsinmess`: Mess menu checking utility.

### 4.3 Club Portal Routes (`/club/*`)
- `/club/profile`: Club profile management.
- `/club/admin/dashboard`: Club analytics and dashboard.
- `/club/admin/form`: Form for creating or managing club events/data.

## 5. API Integrations
The application connects to an external backend defined by the `NEXT_PUBLIC_SERVE` environment variable (mapped to `baseURL` inside [constants/baseURL.js](../constants/baseURL.js)). Fetch is utilized natively for API calls, primarily sending HTTP requests with authorization headers.

### 5.1 Authentication APIs
- `GET /api/auth/user`: Fetch current logged-in student details.
- `POST /api/auth/club-login`: Authenticate club users.
- `POST /api/auth/club-register`: Register a new club.
- `POST /api/auth/logoutuser/`: Destroy user session.
- `POST /api/auth/forgotpassword`: Initiate club password reset.
- `POST /api/auth/resetpassword/{token}`: Complete club password reset.

### 5.2 Student-Specific APIs
- `GET /api/auth/batch`: Retrieve student batch information.
- `GET /api/auth/planner`: Retrieve the student's task and event planner data.
- `GET /api/auth/timetable/{studentBatch}`: Fetch standard timetable based on the batch.

### 5.3 Event and Club Data APIs
- `GET /api/users/allevent`: Fetch all available campus events.
- `GET /api/users/allclub`: Fetch comprehensive list of active clubs on campus.
- `POST /api/users/eventaction/`: Post user interactions regarding an event (RSVP, register, etc.).
- `POST /api/users/clubaction/`: Post user interactions towards a club (Follow, Unfollow, Join).

### 5.4 Club Management APIs
- `GET /api/users/getprofile`: Fetch detailed club profile for an admin.
- `POST /api/users/updateprofile`: Modify club administrative data and images.
- `GET /api/users/club-events`: Specific endpoint showing events owned/managed by the calling club.
- `POST /api/users/create-event`: Endpoint for adding new events to the platform.
- `DELETE /api/users/deleteevent`: Remove an event from the platform.

## 6. Global Component Architecture
Reusable logic and UI are abstracted into the `components/` directory:
- **`SwipeUpDrawer`:** Mobile-friendly component for navigating tabs or seeing user profiles (includes logout triggers).
- **Global:**
  - `loader`: Reusable custom animated loader.
  - `floatingNavbar`: Accessible floating navigation over blurred/glass backgrounds.
  - `event-card` & `club-card`: Cards handling data fetching for images and routing.
  - `carousel`: Image or event slideshow with custom navigation dots.
  - `andriodDeviceCheck`: System check possibly redirecting users to the native app instead.
- **Student Specific:** `timetable/print`, `timetable/dashboard` which act as widgets loaded inside the student portal.
- **Club Specific:** `update/profile`, `update/password` nested components for dashboard management.

## Summary for Redevelopment
To build this project from scratch:
1. Initialize a Next.js App Router application with Tailwind CSS and Shadcn UI.
2. Mirror the layout found in [app/layout.js](../app/layout.js), integrating a floating nav, specific `<meta>` tags for Open Graph cards, and tracking scripts.
3. Apply the [app/globals.css](../app/globals.css) with the oklch-based dark theme variables and custom CSS classes like `.page-center`, `.slideshow`, and `.translucent-date-range`.
4. Setup [constants/baseURL.js](../constants/baseURL.js) fetching endpoint hostnames from `.env.local`.
5. Reconstruct the directory paths inside `app/` strictly mirroring section 4.
6. Consume the API schema documented in section 5 across the nested directories.
