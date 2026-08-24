# AnnualReport — Institutional Annual Report Portal

### Comprehensive Project Report  
**Prepared for Smart India Hackathon (SIH) Presentation**

| | |
|---|---|
| **Product Name** | AnnualReport |
| **Institution Context** | Drs. Kiran & Pallavi Patel Global University (KPGU), Vadodara |
| **Academic Year Covered** | 2025–26 |
| **Live Demo** | https://annualreport-beta.vercel.app |
| **Source Code** | https://github.com/vivek-the-coder/annualreport |
| **Document Type** | Full Technical & Functional Project Report |
| **Version** | 1.0 |
| **Date** | August 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
2. [Problem Statement](#2-problem-statement)  
3. [Objectives](#3-objectives)  
4. [Proposed Solution](#4-proposed-solution)  
5. [Innovation & Novelty](#5-innovation--novelty)  
6. [Stakeholders & User Roles](#6-stakeholders--user-roles)  
7. [System Architecture](#7-system-architecture)  
8. [Technology Stack](#8-technology-stack)  
9. [Core Modules & Features](#9-core-modules--features)  
10. [End-to-End Workflows](#10-end-to-end-workflows)  
11. [Database Design](#11-database-design)  
12. [API & Backend Design](#12-api--backend-design)  
13. [Security & Access Control](#13-security--access-control)  
14. [User Experience, Accessibility & Responsiveness](#14-user-experience-accessibility--responsiveness)  
15. [Deployment & Infrastructure](#15-deployment--infrastructure)  
16. [Demonstration Guide](#16-demonstration-guide)  
17. [Impact Assessment](#17-impact-assessment)  
18. [Limitations & Future Scope](#18-limitations--future-scope)  
19. [Conclusion](#19-conclusion)  
20. [Appendix](#20-appendix)

---

## 1. Executive Summary

Every year, colleges and universities in India must compile an **Institutional Annual Report** — a formal publication covering academics, research, placements, events, student achievements, and departmental outcomes. In most institutes this process still depends on:

- Scattered Word documents and Excel sheets  
- Repeated email follow-ups with Heads of Department  
- Manual copy-paste into a final report  
- Late submissions, inconsistent formats, and weak audit trails  

**AnnualReport** is a centralized, role-based web portal that replaces this fragmented process with a single digital workflow:

> **Collect → Review → Approve → Publish**

Departments submit structured data through guided forms. Coordinators review section by section. Administrators approve and lock content. The system then assembles a professional, brand-aligned annual report with live preview, analytics, historical archive, and classroom / academic record support.

The platform is implemented as a modern full-stack web application (Next.js + PostgreSQL), deployed on Vercel with a managed cloud database (Neon), and demonstrated with institution branding for **KPGU Vadodara**.

**Live portal:** [https://annualreport-beta.vercel.app](https://annualreport-beta.vercel.app)

---

## 2. Problem Statement

### 2.1 Context (SIH / Education Domain)

Indian higher-education institutions are required to produce annual reports for:

- Governing bodies and university leadership  
- Accreditation frameworks (e.g. **NAAC**, **NBA**)  
- Regulatory documentation and public accountability  
- Alumni, industry partners, and prospective students  

Despite the strategic importance of these reports, the **process of creating them** remains largely manual.

### 2.2 Pain Points Observed

| Pain Point | Consequence |
|---|---|
| No standardized data entry | Inconsistent numbers across departments |
| Email / WhatsApp based collection | Lost files, version confusion |
| No structured approval trail | Unclear who approved what, and when |
| Late departmental submissions | Delayed publication every year |
| Manual chart creation | Analytics lag behind raw data |
| Reports vanish into filing cabinets | Weak year-over-year institutional memory |
| Limited role separation | Faculty, coordinators, and admins share the same messy process |

### 2.3 Opportunity

Digitizing the annual-report lifecycle creates a reusable national-scale solution for colleges, universities, and multi-campus groups — aligned with Digital India goals for **e-governance in education**.

---

## 3. Objectives

### 3.1 Primary Objectives

1. Build a **centralized portal** for institutional annual report data collection.  
2. Enforce **role-based access** for Administrator, Coordinator, Department, and Student.  
3. Provide a **guided submission wizard** so departments enter complete, validated information.  
4. Enable **section-level review and approval** with comments and change requests.  
5. Generate a **publication-ready report preview** with themes, chapters, and export options.  
6. Deliver **analytics and historical archive** for institutional decision support.  
7. Deploy a **working cloud demo** suitable for SIH jury evaluation.

### 3.2 Secondary Objectives

- Support classroom material sharing and parent SMS logging (academic engagement layer).  
- Offer AI-assisted writing support for summaries and executive text (assistive, not autonomous).  
- Ensure mobile-first responsiveness for faculty working on phones/tablets.  
- Maintain an auditable activity log for governance and compliance.

---

## 4. Proposed Solution

**AnnualReport** is a web-based Institutional Annual Report Portal with four pillars:

### 4.1 Data Collection Layer
Structured forms and an 8-step wizard capture department / subject-level data (students, attendance, syllabus, teaching material, assessments, uploads).

### 4.2 Governance Layer
Coordinator and Administrator workflows provide review, comments, change requests, resubmission, and final approval — with notifications and activity logging.

### 4.3 Publication Layer
Report Builder arranges chapters, applies KPGU / academic themes, and provides live page preview plus PDF / Word / web publication actions.

### 4.4 Insight Layer
Analytics dashboards, department performance views, and a multi-year archive turn submissions into institutional intelligence.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Department  │───▶│ Coordinator  │───▶│ Administrator│───▶│   Published  │
│  Submission  │    │   Review     │    │   Approval   │    │    Report    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │                   │
        └───────────────────┴───────────────────┴───────────────────┘
                              PostgreSQL + Audit Trail
```

---

## 5. Innovation & Novelty

| Aspect | Conventional Practice | AnnualReport Innovation |
|---|---|---|
| Data intake | Ad-hoc files | Guided, validated digital forms |
| Approval | Informal email | Section-level workflow with status machine |
| Report assembly | Manual Word merge | Chapter-based Report Builder with live preview |
| Analytics | Afterthought spreadsheets | Charts auto-derived from submitted data |
| Memory | Physical / PDF folders | Searchable multi-year archive |
| Access | Shared drives | RBAC + OTP / password sessions |
| Reach | Desktop-only Word | Mobile-first responsive web app |
| Branding | Inconsistent templates | Institution-themed report themes (KPGU Official, Crest, Classic, Modern, Minimal, Academic) |

**SIH relevance:** The solution is domain-specific (education governance), digitally scalable, and directly addresses a recurring national pain point for thousands of HEIs.

---

## 6. Stakeholders & User Roles

| Role | Who | Primary Capabilities |
|---|---|---|
| **Administrator** | Institute leadership / IQAC / Registrar office | Full institute view, approvals, report builder, publishing, settings |
| **Report Coordinator** | Designated annual-report coordinator | Review queue, request changes, track departmental completion |
| **Department Head / Faculty** | HOD / faculty contributors | Submit sections, classroom posts, academic records, resubmit after changes |
| **Student** | Enrolled students | View classroom materials, subjects, announcements (restricted from admin modules) |

### Role-based navigation (enforced in application shell)

- Students cannot access Approvals, Report Builder, or Departments; they are redirected to Classroom.  
- Admin / Coordinator see institute-wide dashboards and department status.  
- Department users see their own submission progress and section cards.

---

## 7. System Architecture

### 7.1 High-Level Architecture

```
                    ┌─────────────────────────────┐
                    │     Client (Browser)        │
                    │  Next.js App Router + UI    │
                    └──────────────┬──────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────┐
                    │   Vercel Edge / Serverless  │
                    │   Next.js API Routes        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  PostgreSQL (Neon Cloud)    │
                    │  Drizzle ORM schema/seed    │
                    └─────────────────────────────┘
```

### 7.2 Application Layers

| Layer | Responsibility |
|---|---|
| **Presentation** | React 19 pages/components, Tailwind CSS 4, Recharts |
| **Application state** | Client `AppProvider` store for session user, data refresh, toasts |
| **API** | Next.js Route Handlers under `/api/*` |
| **Domain logic** | Auth (scrypt, OTP), sessions, seeding, RBAC filters |
| **Persistence** | PostgreSQL via `pg` Pool + Drizzle ORM |

### 7.3 Key Design Choices

- **Server-side sessions** with opaque tokens (not JWT identity in cookies) for revoke capability.  
- **Idempotent seeding** so demo environments bootstrap departments/users safely.  
- **Serverless-friendly DB pool reuse** for Vercel warm invocations.  
- **SSL auto-detection** for Neon / cloud Postgres URLs.

---

## 8. Technology Stack

| Category | Technology | Version / Notes |
|---|---|---|
| Framework | **Next.js** (App Router) | 16.2.6 |
| UI Library | **React / React DOM** | 19.2.6 |
| Language | **TypeScript** | 5.9.3 |
| Styling | **Tailwind CSS** + PostCSS | 4.1.17 |
| ORM | **Drizzle ORM** | 0.45.2 |
| Database | **PostgreSQL** (`pg` driver) | 8.20.0 |
| Charts | **Recharts** | ^3.10.1 |
| Icons | **Lucide React** | ^1.33.0 |
| Tooling | ESLint, drizzle-kit | Aligned with Next 16 |
| Fonts | Inter + Manrope | `next/font/google` |
| Hosting | **Vercel** | Production: `annualreport-beta.vercel.app` |
| Managed DB | **Neon Postgres** | Cloud Postgres with SSL |
| Source Control | **GitHub** | `vivek-the-coder/annualreport` |

---

## 9. Core Modules & Features

### 9.1 Public / Marketing Surface

| Route | Feature |
|---|---|
| `/` | Landing page — problem narrative, how-it-works, features, analytics teaser, archive teaser, CTAs |
| `/login` | Email/password, mobile OTP, one-click demo role entry |
| `/reports/2025-26` | Public published report demo for the academic year |

### 9.2 Authenticated Application Modules

| Module | Route | Summary |
|---|---|---|
| Dashboard | `/dashboard` | Role-aware KPIs, milestones, department status, recent activity |
| Departments | `/departments` | Department cards with completion, placements, publications |
| Academic Records | `/academics` | Subject-wise teaching / assessment metrics with export |
| Classroom | `/classroom` | Faculty posts (notes, PPT, assignment, announcement, marksheet); student view |
| Submissions | `/submissions` | Filterable list of departmental section packages |
| Submission Wizard | `/submissions/wizard` | 8-step guided data entry |
| Approval Center | `/approvals` | Review queue, comments, approve / request changes / resubmit |
| Report Builder | `/report-builder` | Chapter reorder, themes, typography, live A4 preview, export actions |
| Analytics | `/analytics` | Placement trends, department bars, submission status distribution |
| Archive | `/archive` | Multi-year reports, search, year comparison |
| AI Assistant | `/assistant` | Assistive drafting (summary, grammar, executive tone) |
| Notifications | `/notifications` | Role-targeted alerts with read state |
| Settings | `/settings` | Profile, branding, users, templates, security preferences |

### 9.3 Report Sections Tracked

The platform models annual-report content as standardized **sections** (e.g. academics, research, placements, events, achievements — as defined in application constants), each with its own submission status lifecycle.

### 9.4 Report Builder Capabilities

- 13 chapter model with drag-to-reorder  
- Themes: KPGU Official, KPGU Crest, Classic, Modern, Minimal, Academic  
- Page size (A4 / Letter), margins, header/footer toggles, typography scale  
- Live preview with zoom and fullscreen  
- Actions: Download PDF, Export Word, Publish Web Version  

---

## 10. End-to-End Workflows

### 10.1 Annual Report Production Cycle

1. **Administrator / Coordinator** opens the cycle for academic year 2025–26.  
2. **Department** fills the Submission Wizard and submits section packages.  
3. Status moves: `draft` → `submitted` → `under_review`.  
4. **Coordinator** reviews content, adds comments, either **approves** or **requests changes**.  
5. If changes requested, department updates and **resubmits**.  
6. Approved sections lock into the report draft.  
7. **Administrator** uses Report Builder to order chapters, apply branding, preview pages.  
8. Report is published as web version (and export actions for PDF/Word).  
9. Published artifact becomes part of the **Archive** for future comparison.

### 10.2 Classroom & Parent Communication Loop

1. Faculty posts teaching material against a subject.  
2. Students access materials from Classroom.  
3. Attendance / parent SMS actions are logged (`parent_sms_logs`) for audit (SMS gateway optional via `SMS_API_KEY`).

### 10.3 Authentication Flows

**A. Email + Password**  
User enters institutional email and password → server verifies scrypt hash → creates session cookies → redirects to dashboard.

**B. Mobile OTP**  
User enters 10-digit Indian mobile → OTP generated (hashed at rest) → verify 6-digit code → session created.  
If SMS API is not configured, a demo code is returned for evaluation.

**C. Demo Role Switch**  
One-click login as Administrator / Coordinator / Department / Student for jury demonstration.

---

## 11. Database Design

### 11.1 Entity Overview

| Table | Purpose |
|---|---|
| `users` | Accounts, roles, password hashes, lockout state |
| `sessions` | Opaque server sessions (token, expiry, revoke) |
| `otp_challenges` | Time-bound OTP challenges (hashed codes) |
| `departments` | Department master + completion / placement metrics |
| `subjects` | Subject-wise academic / teaching metrics |
| `students` | Student profiles (roll, contact, parent phone) |
| `enrollments` | Student–subject attendance and marks |
| `class_materials` | Classroom posts and attachments metadata |
| `parent_sms_logs` | Parent SMS send audit |
| `submissions` | Section submission packages and status |
| `comments` | Review discussion threads |
| `notifications` | In-app alerts |
| `activities` | System audit trail |

### 11.2 Status Model (Submissions / Departments)

Typical states include:

`pending` → `draft` → `submitted` → `under_review` → `changes_requested` → `approved`

This explicit state machine is the backbone of institutional governance in the product.

### 11.3 Seeded Domain Data

For demonstration, the system seeds **10 departments**, including:

Computer Engineering, Mechanical Engineering, Civil Engineering, Electrical Engineering, Electronics & Communication, Information Technology, MBA, Science, Humanities, Architecture.

---

## 12. API & Backend Design

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Email/password or demo-role login |
| `POST` | `/api/auth/logout` | Revoke session |
| `GET` | `/api/auth/me` | Current authenticated user |
| `POST` | `/api/auth/otp/request` | Request mobile OTP |
| `POST` | `/api/auth/otp/verify` | Verify OTP and create session |
| `GET` | `/api/data` | Aggregated portal data for UI |
| `POST` | `/api/submit` | Department submits section drafts |
| `GET` / `PATCH` | `/api/submissions/[id]` | Fetch detail; approve / request changes / comment / resubmit |
| `POST` | `/api/classroom/post` | Faculty classroom post |
| `POST` | `/api/sms/send` | Parent SMS logging (demo / gateway-ready) |
| `PATCH` | `/api/notifications` | Mark notifications read |
| `POST` | `/api/ai` | Assistive AI text endpoints |
| `GET` | `/api/health` | Database health probe |

All mutating workflows write to **activities** / **notifications** where appropriate, supporting auditability for SIH evaluation and institutional governance.

---

## 13. Security & Access Control

| Control | Implementation |
|---|---|
| Password storage | **scrypt** salted hashes (`scrypt:<salt>:<hash>`) |
| Brute-force protection | Lockout after **5** failed attempts for **15 minutes** |
| OTP security | Codes stored hashed (SHA-256); TTL **5 minutes**; attempt limits; resend throttle |
| Sessions | Opaque random tokens in HTTP-only oriented cookies; server-side revoke |
| Session lifetime | Approximately **7 days** |
| RBAC | Route-level and UI-level role filters |
| Transport | HTTPS on Vercel production |
| Database | Managed Postgres with SSL for cloud URLs |
| Audit | Activities + SMS logs + comment history |

**Note for SIH jury:** Demo mode intentionally exposes evaluation helpers (demo OTP code when SMS is unset; shared demo password) so the solution can be tested without SMS vendor setup. Production hardening would disable demo shortcuts and require SMS / email providers.

---

## 14. User Experience, Accessibility & Responsiveness

### 14.1 Design Language

- Brand-forward KPGU palette (deep navy, crimson, gold, green accents)  
- Display typography (Manrope) + readable UI type (Inter)  
- Card-based dashboards with clear status badges and progress bars  

### 14.2 Responsive Strategy (Mobile → Tablet → Desktop)

- **Mobile-first** layouts with stacked CTAs and card lists instead of wide tables  
- **Tablet:** intermediate grids, horizontal filter chips, drawer navigation  
- **Desktop:** persistent sidebar, full tables, multi-column Report Builder  

### 14.3 Accessibility Highlights

- Skip-to-content links  
- ARIA labels / expanded states for menus, tabs, search combobox  
- Keyboard Escape to close drawers/menus  
- Visible focus rings  
- Reduced-motion respect via CSS  

### 14.4 Operational UX

- Global search across departments / submissions / pages  
- Toast notifications for success / error / info  
- Safe-area padding for notched mobile devices  
- Bottom navigation for primary mobile destinations  

---

## 15. Deployment & Infrastructure

### 15.1 Production Topology

| Component | Service |
|---|---|
| Frontend + API | **Vercel** (Next.js serverless) |
| Database | **Neon PostgreSQL** (cloud) |
| Source repository | **GitHub** — https://github.com/vivek-the-coder/annualreport |
| Production URL | https://annualreport-beta.vercel.app |

### 15.2 Environment Configuration

Critical environment variable:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

Optional:

```env
SMS_API_KEY=...                 # enable real OTP SMS delivery
AUTH_ALLOW_SELF_PROVISION=false # harden login provisioning
```

### 15.3 Independence from Local Docker

- **Production website continues to run if Docker Desktop is closed** on a developer machine.  
- Docker / local Postgres is used only for **local development**.  
- Cloud Neon database powers the live SIH demo.

### 15.4 CI / Release Flow

1. Push to `main` on GitHub  
2. Vercel builds and deploys production  
3. Alias serves `annualreport-beta.vercel.app`

---

## 16. Demonstration Guide

### 16.1 Recommended Jury Walkthrough (8–10 minutes)

1. Open landing page → explain problem and Collect–Review–Approve–Publish flow.  
2. Sign in as **Administrator** → Dashboard KPIs and milestones.  
3. Switch to **Department** demo → Submission Wizard (show 1–2 steps) → submit.  
4. Switch to **Coordinator** → Approval Center → comment + approve / request changes.  
5. Return as Admin → Report Builder (theme + chapter reorder + preview).  
6. Open Analytics and Archive (year comparison).  
7. Optionally show Classroom + student view.  
8. Close with Impact + Future Scope.

### 16.2 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@kpgu.edu.in` | `Demo@1234` |
| Coordinator | `coordinator@kpgu.edu.in` | `Demo@1234` |
| Department (CE) | `dept.ce@kpgu.edu.in` | `Demo@1234` |
| Student | `student.ce@kpgu.edu.in` | `Demo@1234` |

Mobile OTP demo numbers correspond to the phones seeded for these accounts. When SMS is not configured, the OTP request response includes a **demo code** for evaluation.

---

## 17. Impact Assessment

### 17.1 Quantitative (Expected / Demonstrable)

- Reduction in manual compilation effort from **weeks → days**  
- Higher submission completeness via guided wizard validation  
- Transparent approval SLAs through status tracking  
- Instant analytics from submitted numbers (no separate spreadsheet pipeline)  
- Permanent digital archive for accreditation evidence packs  

### 17.2 Qualitative

- Stronger accountability between departments and central offices  
- Better readiness for NAAC/NBA documentation cycles  
- Improved faculty experience (mobile-friendly, clear tasks)  
- Institutional memory that compounds year over year  

### 17.3 Scalability

The same architecture can serve:

- Single college  
- Multi-department university  
- Multi-campus university groups (tenant isolation as future work)

---

## 18. Limitations & Future Scope

### 18.1 Current Limitations

- PDF/Word export is demonstrated at UX level; production-grade PDF rendering (e.g. Puppeteer/Chromium pipeline) is identified as next hardening step.  
- AI Assistant is assistive / mockable without mandatory paid LLM keys for demo reliability.  
- SMS delivery requires configuring an SMS provider key for production OTP.  
- Multi-tenant SaaS billing / institute onboarding portal is not yet productized.

### 18.2 Future Roadmap

| Phase | Enhancements |
|---|---|
| **Phase 2** | Real Puppeteer/Docx export pipeline; digital signatures on approvals |
| **Phase 3** | NAAC SSR / AQAR field mapping templates |
| **Phase 4** | Multi-institute tenancy + custom domains |
| **Phase 5** | Integration with LMS / ERP / University MIS |
| **Phase 6** | Advanced AI: anomaly detection on metrics, auto chapter drafting with human-in-loop |
| **Phase 7** | Offline-capable PWA for low-connectivity campuses |

---

## 19. Conclusion

**AnnualReport** transforms a chronically manual, error-prone institutional process into a governed digital workflow. By combining role-based access, structured submissions, section-level approvals, branded report generation, analytics, and archival memory, the platform offers a practical, deployable solution for Indian higher-education institutions.

The project is:

- **Problem-driven** (real annual-report pain in HEIs)  
- **Technically modern** (Next.js 16, React 19, PostgreSQL, cloud deployment)  
- **Demonstrable today** via a live URL  
- **Aligned with SIH / Digital India** goals for education e-governance  

> **One portal. One workflow. One professional annual report.**

---

## 20. Appendix

### A. Repository Structure (Simplified)

```
raghu/
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   │   ├── (app)/           # Authenticated application modules
│   │   ├── api/             # Backend route handlers
│   │   ├── login/           # Authentication UI
│   │   ├── reports/         # Public report pages
│   │   ├── layout.tsx       # Root layout, fonts, viewport
│   │   └── page.tsx         # Landing page
│   ├── components/          # UI, charts, brand, OTP input
│   ├── db/                  # Drizzle schema, seed, auth-seed, pool
│   └── lib/                 # Auth, session, shared data, app store
├── drizzle.config.ts        # Drizzle kit configuration
├── package.json             # Dependencies & scripts
└── PROJECT_REPORT.md        # This document
```

### B. Local Development (for evaluators with source access)

```bash
npm install
# Set DATABASE_URL in .env.local
npx drizzle-kit push
npm run dev
```

Open `http://localhost:3000`.

### C. Brand & Institute Constants

- **Institute:** Drs. Kiran & Pallavi Patel Global University  
- **Short name:** KPGU Vadodara  
- **Tagline:** Think Global… Choose Global…  
- **Report year:** 2025–26  
- **Product:** AnnualReport — Institutional Annual Report Portal  

### D. Important Links

| Resource | URL |
|---|---|
| Live Demo | https://annualreport-beta.vercel.app |
| GitHub Repository | https://github.com/vivek-the-coder/annualreport |
| React Hydration Guidance (reference) | https://react.dev/link/hydration-mismatch |

### E. Glossary

| Term | Meaning |
|---|---|
| HOD | Head of Department |
| IQAC | Internal Quality Assurance Cell |
| NAAC / NBA | Accreditation bodies in Indian higher education |
| OTP | One-Time Password |
| RBAC | Role-Based Access Control |
| SIH | Smart India Hackathon |

---

**End of Report**

*Prepared for Smart India Hackathon presentation and technical evaluation.*  
*Product: AnnualReport · Institution context: KPGU Vadodara · Academic Year: 2025–26*
