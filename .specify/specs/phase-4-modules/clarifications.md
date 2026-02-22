# Phase 4: Clarifications Document

## Overview

This document captures clarifications and decisions made during the specification phase for omb-accounting Phase 4.

---

## 1. Invoice Management Clarifications

### Q1: Should the system support partial payments?

**Decision:** Yes, support partial payments with payment allocation tracking.

### Q2: Should invoices support multiple tax rates (e.g., GST + VAT)?

**Decision:** Yes, line item can have different tax rates. System should support tax inclusive and exclusive modes.

### Q3: How should invoice reminders be triggered?

**Decision:** Automated reminders at 3 days before due, due date, and 7/14/30 days overdue. Configurable.

### Q4: Should we support invoice templates with different layouts?

**Decision:** MVP: Single template with company branding customization (logo, colors). Advanced templates in future phase.

---

## 2. Dashboard & Analytics Clarifications

### Q1: What chart library should we use?

**Decision:** Recharts (already in dependencies via shadcn/ui ecosystem).

### Q2: Should dashboard be customizable by user?

**Decision:** MVP: Fixed layout with required components. User customization in future phase.

### Q3: What time periods should charts show by default?

**Decision:** Last 30 days for daily charts, last 12 months for monthly charts.

### Q4: Should financial health indicators be real-time or calculated nightly?

**Decision:** Real-time for current data, nightly batch for historical comparisons.

---

## 3. Bank Reconciliation Clarifications

### Q1: What CSV formats should we support?

**Decision:** Generic column mapping interface. Common formats: Date, Description, Amount, Reference. Auto-detection for major HK banks.

### Q2: How should unmatched differences be handled?

**Decision:** Options: Create journal entry, defer to next reconciliation, write off (if < configured threshold).

### Q3: Should bank feeds be imported automatically?

**Decision:** MVP: Manual CSV import only. API integration with Hong Kong banks in future phase.

### Q4: How long should unmatched items be kept?

**Decision:** Unlimited, but show age (days unmatched). Allow archiving.

---

## 4. Multi-currency Clarifications

### Q1: Should all transactions be in base currency with exchange rate recorded?

**Decision:** Yes. Each transaction has: original amount, original currency, exchange rate, base currency amount.

### Q2: How often should exchange rates be updated?

**Decision:** Manual update option with last updated timestamp. Future: API auto-update nightly.

### Q3: Should the system support multi-currency bank accounts?

**Decision:** Yes, account can be assigned a currency. Balances shown in both original and base currency.

### Q4: How should unrealized gains/losses be handled?

**Decision:** Record as exchange rate variance. Manual revaluation option. Auto-revaluation at period end.

---

## 5. User & Roles Clarifications

### Q1: How should initial user be created?

**Decision:** System initialization creates Admin user with setup flow (first login = setup).

### Q2: Should we support SSO/SAML?

**Decision:** MVP: Local authentication only. SSO in future phase.

### Q3: What password requirements?

**Decision:** Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.

### Q4: Should sessions expire?

**Decision:** Yes, 30-minute timeout for inactivity. Configurable by admin.

### Q5: What roles are required by default?

**Decision:**

- Admin: Full access
- Manager: Read/write access (no user management)
- Accountant: Read/write transactions (no settings)
- Viewer: Read-only access

---

## 6. Email/Notification Clarifications

### Q1: What SMTP services are supported?

**Decision:** Any SMTP server. Common presets: Gmail, Outlook, SendGrid, Mailgun.

### Q2: Should emails be sent from system or user's email?

**Decision:** Configurable "From" address. Default: system email with user reply-to.

### Q3: Should notifications be real-time?

**Decision:** MVP: Poll every 30 seconds. WebSocket in future phase for real-time.

### Q4: What notification types are required?

**Decision:**

- Invoice sent/viewed/paid
- Payment received
- Overdue reminders
- Bank reconciliation alerts
- System announcements

---

## 7. Performance Clarifications

### Q1: What is the target bundle size?

**Decision:** Initial load < 500KB gzipped. Total bundle < 1MB.

### Q2: Should we use service workers?

**Decision:** Yes, for offline caching and faster subsequent loads.

### Q3: Should we implement optimistic UI updates?

**Decision:** Yes, for form submissions to improve perceived performance.

### Q4: What caching strategy for API responses?

**Decision:** Static data: cache 5 minutes. User data: no cache (always fresh).

---

## 8. Security Clarifications

### Q1: Should we implement two-factor authentication?

**Decision:** MVP: Optional TOTP via authenticator app. SMS in future phase.

### Q2: How should sensitive data be protected?

**Decision:** Never log: passwords, credit cards, bank details. Mask in UI.

### Q3: Should we implement IP allowlisting?

**Decision:** MVP: No. Future phase with enterprise features.

### Q4: What is the password reset flow?

**Decision:** Email with secure token (1 hour expiry). No security questions.

---

## 9. Integration Clarifications

### Q1: How does invoice integrate with bank reconciliation?

**Decision:** Payment recorded in invoice → Creates journal entry → Appears in bank reconciliation.

### Q2: How does multi-currency affect reports?

**Decision:** Each report has currency selector. Consolidated view shows all currencies converted to base.

### Q3: How do permissions affect dashboard?

**Decision:** Dashboard shows only data user has permission to view.

---

## 10. Technical Clarifications

### Q1: Should we use Redux or Context for state management?

**Decision:** Continue with React Context (current pattern). Redux only if performance issues arise.

### Q2: Should we implement a database migration system?

**Decision:** Yes, for schema changes. Use Prisma migrations.

### Q3: How should we handle error boundaries?

**Decision:** Global error boundary with graceful degradation. Per-feature error states.

### Q4: Should we implement feature flags?

**Decision:** Yes, for gradual rollout and A/B testing.

---

## 11. Documented Decisions Summary

| Category                | Decision                                 |
| ----------------------- | ---------------------------------------- |
| Partial Payments        | Supported                                |
| Tax Rates               | Multi-rate supported per line item       |
| Chart Library           | Recharts                                 |
| Dashboard Customization | Fixed layout (future: user customizable) |
| CSV Formats             | Generic mapping with presets             |
| Currency Recording      | Original + base currency                 |
| Exchange Rate Update    | Manual (future: nightly API)             |
| Default Roles           | Admin, Manager, Accountant, Viewer       |
| Password Requirements   | 8+ chars, complexity required            |
| Session Timeout         | 30 minutes (configurable)                |
| SMTP                    | Any SMTP server                          |
| Notification Real-time  | Polling (future: WebSocket)              |
| Target Bundle           | < 500KB initial, < 1MB total             |
| Caching                 | 5 min for static, none for user data     |
| 2FA                     | Optional TOTP (MVP)                      |
| State Management        | Continue with Context                    |

---

## 12. Open Questions (Unresolved)

These questions need stakeholder input before implementation:

1. **Invoice Payment Methods**: Should we track payment method (cash, bank transfer, cheque)?
2. **Bank API Integration**: Which Hong Kong banks should we prioritize for direct API?
3. **Email Quotas**: Should there be monthly email limits per account?
4. **Audit Retention**: How long should audit logs be retained (regulatory requirement)?
5. **Multi-tenant**: Should system support multiple companies (future SaaS)?

---

## 13. Approval

| Role           | Name  | Date       | Signature   |
| -------------- | ----- | ---------- | ----------- |
| Product Owner  | Sunny | 2026-02-22 | ⏳ Pending  |
| Lead Developer | 圓圓  | 2026-02-22 | ✅ Approved |

---

_Document Version: 1.0_
_Last Updated: 2026-02-22_
