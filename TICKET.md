# SVC-1830: Fix payment transaction validation service

**Status:** In Progress · **Priority:** High
**Sprint:** Sprint 23 · **Story Points:** 5
**Reporter:** Arun Nair (API Team Lead) · **Assignee:** You (Intern)
**Due:** End of sprint (Friday)
**Labels:** ackend, payments, javascript, alidation
**Epic:** SVC-1800 (Payment Gateway v2)
**Task Type:** Bug Fix

---

## Description

Our transaction validation service is letting invalid transactions through to the payment gateway. Deepak wrote the validator and rule engine, but he was transferred to DevOps before finishing QA. The code has logic bugs in amount comparison, pattern matching, and rule execution order.

## Requirements

- Validate transaction amounts against configurable limits
- Check blacklisted accounts
- Detect suspicious patterns in transaction memos
- Execute validation rules in priority order
- Support multiple currencies with different limits

## Acceptance Criteria

- [ ] Bug #1 fixed: Amount validation uses string comparison not numeric (`9` beats `10000`)
- [ ] Bug #2 fixed: Suspicious pattern check is case-sensitive (misses `TEST`, `Fraud`)
- [ ] Bug #3 fixed: Validation rules never sorted by priority (run in insertion order)
- [ ] Bug #4 fixed: Unknown currencies silently pass validation instead of being rejected
- [ ] All unit tests pass

## Design Notes

See `docs/DESIGN.md` for the validation architecture.
See `.context/pr_comments.md` for Deepak's PR feedback.
