# OC Kindergarten Product Plan

## 1. Project Summary

OC Kindergarten is a new internal operations workspace for kindergarten workflows.

The first repository slice is intentionally small: it establishes the same Next.js standalone and Docker compose deployment shape as `rococo-outreach`, without committing to a final product model yet.

## 2. Initial Module Candidates

- Enrollment: children, guardians, class assignment, onboarding state.
- Attendance: daily check-in, absence, late arrival, pickup status.
- Communication: family notices, teacher notes, follow-up reminders.
- Operations: meals, activities, incidents, permissions, audit history.

## 3. Architecture Baseline

- Next.js app router.
- TypeScript.
- Standalone Docker build.
- Compose-managed service.
- Future data persistence should be added behind explicit API contracts.
