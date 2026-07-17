# Security Policy

## Reporting a Vulnerability

The CampusWeb team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send a detailed report to **[campusdatasrm@gmail.com](mailto:campusdatasrm@gmail.com)** with the subject line: `[SECURITY] CampusWeb Vulnerability Report`

2. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/CampusDataSRM/campusweb/security/advisories/new) feature.

### What to Include

Please include the following information in your report:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Impact assessment** — what could an attacker achieve?
- **Affected components** — which files, routes, or APIs are involved?
- **Suggested fix** (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 1 week |
| Resolution target | Within 30 days (for critical issues) |

### Scope

The following are in scope for security reports:

- **CampusWeb frontend** (this repository)
- **Authentication flows** (student login, club login)
- **Data exposure** (API responses, client-side storage)
- **Cross-site scripting (XSS)** vulnerabilities
- **Dependency vulnerabilities** with a clear exploit path

The following are out of scope:

- **Backend API server** (report separately to the API team)
- Social engineering attacks
- Denial of service (DoS) attacks
- Issues in third-party dependencies without a demonstrated exploit

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`main` branch) | ✅ Yes |
| Older releases | ❌ No |

## Disclosure Policy

- We will work with you to understand and resolve the issue before any public disclosure.
- We will credit you in the fix (unless you prefer to remain anonymous).
- We ask that you give us a reasonable time to address the issue before disclosing it publicly.

Thank you for helping keep CampusWeb and its users safe! 🛡️
