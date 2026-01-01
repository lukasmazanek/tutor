# Issue Tracking

Systematic tracking of bugs, content issues, and UX problems.

**Format:** `ISS-XXX-slug.md` | **Status:** Open, In Progress, Resolved, Wontfix

---

## Open Issues

| ID | Type | Severity | Title | Reported |
|----|------|----------|-------|----------|
| [ISS-001](ISS-001-session-analysis-2025-12-31.md) | Analysis | - | Session Analysis 2025-12-31 | 2026-01-01 |

---

## Issue Types

| Type | Description |
|------|-------------|
| **Bug** | Code defect causing incorrect behavior |
| **Content** | Problem with question content (missing image, wrong answer) |
| **UX** | User experience issue |
| **Analysis** | Session/learning analysis report |

## Severity Levels

| Level | Description |
|-------|-------------|
| **Critical** | App crashes, data loss, blocks usage |
| **High** | Major feature broken, workaround difficult |
| **Medium** | Feature degraded, workaround exists |
| **Low** | Minor issue, cosmetic |

---

## Template

```markdown
# ISS-XXX: Title

**Date:** YYYY-MM-DD
**Type:** Bug | Content | UX | Analysis
**Severity:** Critical | High | Medium | Low
**Status:** Open | In Progress | Resolved | Wontfix
**Reporter:** User/System

## Summary

[Brief description]

## Details

[Full details, steps to reproduce, data]

## Impact

[Who/what is affected]

## Proposed Fix

[If known]

## Related

[Links to ADRs, other issues]
```
