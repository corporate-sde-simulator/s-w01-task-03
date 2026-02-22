# PR Review - Transaction validation middleware for payments (by Vikram Singh)

## Reviewer: Neha Sharma
---

**Overall:** Good foundation but critical bugs need fixing before merge.

### `transactionValidator.js`

> **Bug #1:** Amount validation uses loose equality so string zero passes as valid positive amount
> This is the higher priority fix. Check the logic carefully and compare against the design doc.

### `validationRules.js`

> **Bug #2:** Currency code validation is case-sensitive and rejects lowercase codes like usd
> This is more subtle but will cause issues in production. Make sure to add a test case for this.

---

**Vikram Singh**
> Acknowledged. I have documented the issues for whoever picks this up.
