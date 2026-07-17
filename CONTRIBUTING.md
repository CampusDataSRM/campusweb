# Contributing to CampusWeb

Thank you for your interest in contributing to CampusWeb! This guide will help you get started with the development workflow and contribution standards.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/campusweb.git
   cd campusweb
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/CampusDataSRM/campusweb.git
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b <username>/<type>/<short-description>
   ```

### Branch Naming Convention

We follow the pattern: `<username>/<type>/<short-description>`

| Type | Use Case |
|------|----------|
| `feat` | New features |
| `fix` | Bug fixes |
| `chore` | Maintenance tasks, refactors, configs |
| `docs` | Documentation updates |

**Examples:**
- `john/feat/dark-mode-toggle`
- `jane/fix/attendance-loading`
- `alex/docs/api-endpoints`

## Development Setup

### Prerequisites

- **Node.js** ≥ 20.x ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git**

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required values in `.env.local`. For development, the API server URLs are required. Analytics keys are optional.

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:2560](http://localhost:2560).

4. Run the linter:
   ```bash
   npm run lint
   ```

## Making Changes

### Project Structure

```
campusweb/
├── app/                  # Next.js App Router pages
│   ├── client/           # Auth pages (login, signup)
│   ├── club/             # Club portal pages
│   ├── student/          # Student portal pages
│   ├── layout.js         # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── global/           # Shared components (navbar, loader, etc.)
│   ├── student/          # Student-specific components
│   ├── club/             # Club-specific components
│   └── ui/               # Shadcn UI primitives
├── constants/            # App constants (API base URLs)
├── functions/            # Utility functions and API helpers
│   ├── api/              # API call functions
│   └── providers/        # Context providers (PostHog, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Library utilities
└── public/               # Static assets (images, icons, manifests)
```

### Code Style

- **Components**: Use functional components with hooks
- **Styling**: Tailwind CSS classes — follow existing patterns with custom theme colors (`theme_primary`, `theme_secondary`, etc.)
- **State management**: React hooks (`useState`, `useEffect`) with cookie-based auth
- **API calls**: Use native `fetch` with the `baseURL` from `constants/baseURL.js`
- **Linting**: Run `npm run lint` before committing

### Do's and Don'ts

✅ **Do:**
- Follow existing code patterns and naming conventions
- Write meaningful component and variable names
- Use environment variables for external service keys and URLs
- Test your changes locally before submitting a PR

❌ **Don't:**
- Commit `.env.local`, `.env.production`, or any file with secrets
- Leave `console.log` statements in production code
- Add large commented-out code blocks
- Hardcode API URLs, analytics IDs, or external service keys

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message should follow this format:

```
<type>: <short description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `chore` | Maintenance, refactoring, config changes |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code restructuring without feature/fix |
| `test` | Adding or updating tests |
| `ci` | CI/CD pipeline changes |

**Examples:**
- `feat: add CGPA calculator page`
- `fix: resolve attendance data not loading`
- `docs: update API endpoint documentation`
- `chore: update dependencies`

## Pull Request Process

1. **Sync your fork** with upstream before creating a PR:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin <your-branch>
   ```

3. **Open a Pull Request** on GitHub from your fork to `CampusDataSRM/campusweb:main`

4. **Fill out the PR template** completely

5. **Wait for review** — a maintainer will review your PR. Be responsive to feedback.

### PR Checklist

Before submitting, ensure:

- [ ] Code follows the project's code style
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] No secrets, API keys, or credentials are committed
- [ ] Changes are tested locally
- [ ] PR description clearly explains the changes

## Reporting Bugs

Use the [Bug Report](https://github.com/CampusDataSRM/campusweb/issues/new?template=bug_report.md) issue template. Include:

- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Browser and device information

## Requesting Features

Use the [Feature Request](https://github.com/CampusDataSRM/campusweb/issues/new?template=feature_request.md) issue template. Include:

- Problem you're trying to solve
- Proposed solution
- Alternatives you've considered

---

## Questions?

If you have questions about contributing, feel free to [open a discussion](https://github.com/CampusDataSRM/campusweb/discussions) or reach out to the maintainers.

Thank you for helping make CampusWeb better! 🎓
