/**
 * Validation Rules — configurable business rules for transaction validation.
 * 
 * Rules are evaluated in priority order. Each rule returns a 
 * { pass: boolean, message: string } result.
 * 
 * Author: Deepak Menon (transferred to DevOps team)
 * Last Modified: 2026-02-01
 */

const CURRENCY_LIMITS = {
    'USD': { min: 0.01, max: 100000 },
    'EUR': { min: 0.01, max: 85000 },
    'INR': { min: 1, max: 5000000 },
    'GBP': { min: 0.01, max: 75000 }
};

class ValidationRuleEngine {
    constructor() {
        this.rules = [];
        this.ruleResults = new Map();
    }

    /**
     * Add a validation rule with a name, priority, and check function.
     * Lower priority number = runs first.
     */
    addRule(name, priority, checkFn) {
        this.rules.push({ name, priority, check: checkFn });
        // BUG: Rules are never sorted after adding
        // They execute in insertion order, not priority order
        // So a high-priority rule added last will run last
    }

    /**
     * Run all rules against a transaction.
     * Returns { passed: boolean, results: [{rule, pass, message}] }
     */
    evaluate(transaction) {
        const results = [];
        let allPassed = true;

        for (const rule of this.rules) {
            try {
                const result = rule.check(transaction);
                results.push({
                    rule: rule.name,
                    pass: result.pass,
                    message: result.message
                });
                if (!result.pass) allPassed = false;
            } catch (error) {
                results.push({
                    rule: rule.name,
                    pass: false,
                    message: `Rule error: ${error.message}`
                });
                allPassed = false;
            }
        }

        this.ruleResults.set(transaction.id || 'unknown', results);
        return { passed: allPassed, results };
    }

    /**
     * Check if a currency amount is within allowed limits.
     */
    static checkCurrencyLimits(amount, currency) {
        const limits = CURRENCY_LIMITS[currency];
        if (!limits) {
            // BUG: Unknown currencies are silently allowed instead of rejected
            // Should return { pass: false } for unsupported currencies
            return { pass: true, message: `Currency ${currency} accepted` };
        }

        if (amount < limits.min) {
            return { pass: false, message: `${currency} minimum is ${limits.min}` };
        }
        if (amount > limits.max) {
            return { pass: false, message: `${currency} maximum is ${limits.max}` };
        }
        return { pass: true, message: `${currency} amount within limits` };
    }

    getRuleCount() {
        return this.rules.length;
    }

    getResultsFor(transactionId) {
        return this.ruleResults.get(transactionId) || [];
    }
}

module.exports = { ValidationRuleEngine, CURRENCY_LIMITS };
