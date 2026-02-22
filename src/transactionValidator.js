/**
 * Transaction Validator — validates payment transactions against business rules.
 * 
 * Processes incoming transactions and checks them against velocity limits,
 * amount thresholds, blacklists, and fraud patterns.
 * 
 * Author: Deepak Menon (transferred to DevOps team)
 * Last Modified: 2026-02-01
 */

const TRANSACTION_LIMITS = {
    daily_max: 50000,
    single_max: 10000,
    daily_count: 20,
    min_amount: 1
};

const SUSPICIOUS_PATTERNS = ['test', 'fraud', 'xxx'];

class TransactionValidator {
    constructor() {
        this.transactionLog = [];
        this.blacklistedAccounts = new Set();
    }

    /**
     * Validate a single transaction against all rules.
     * Returns { valid: boolean, errors: string[] }
     */
    validate(transaction) {
        const errors = [];

        if (!transaction || typeof transaction !== 'object') {
            return { valid: false, errors: ['Transaction object is required'] };
        }

        // Check required fields
        const requiredFields = ['amount', 'fromAccount', 'toAccount', 'currency'];
        for (const field of requiredFields) {
            if (!transaction[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        if (errors.length > 0) return { valid: false, errors };

        // BUG: Amount validation uses string comparison instead of numeric
        // "9" > "10000" is true in string comparison, so $9 passes the max check
        if (transaction.amount > String(TRANSACTION_LIMITS.single_max)) {
            errors.push(`Amount ${transaction.amount} exceeds single transaction limit of ${TRANSACTION_LIMITS.single_max}`);
        }

        if (transaction.amount < TRANSACTION_LIMITS.min_amount) {
            errors.push(`Amount must be at least ${TRANSACTION_LIMITS.min_amount}`);
        }

        // Check blacklisted accounts
        if (this.blacklistedAccounts.has(transaction.fromAccount) ||
            this.blacklistedAccounts.has(transaction.toAccount)) {
            errors.push('Transaction involves a blacklisted account');
        }

        // Check self-transfer
        if (transaction.fromAccount === transaction.toAccount) {
            errors.push('Self-transfers are not allowed');
        }

        // BUG: Suspicious pattern check is case-sensitive
        // 'TEST' or 'Test' in memo won't be caught, only lowercase 'test'
        if (transaction.memo) {
            for (const pattern of SUSPICIOUS_PATTERNS) {
                if (transaction.memo.includes(pattern)) {
                    errors.push(`Suspicious pattern detected in memo: ${pattern}`);
                }
            }
        }

        // Check daily velocity
        const velocityResult = this.checkVelocity(transaction);
        if (!velocityResult.ok) {
            errors.push(velocityResult.error);
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Check daily transaction velocity limits.
     */
    checkVelocity(transaction) {
        const today = new Date().toISOString().split('T')[0];
        const todaysTransactions = this.transactionLog.filter(t => {
            const txDate = new Date(t.timestamp).toISOString().split('T')[0];
            return txDate === today && t.fromAccount === transaction.fromAccount;
        });

        // Check daily count
        if (todaysTransactions.length >= TRANSACTION_LIMITS.daily_count) {
            return { ok: false, error: `Daily transaction count limit (${TRANSACTION_LIMITS.daily_count}) exceeded` };
        }

        // Check daily amount total
        const dailyTotal = todaysTransactions.reduce((sum, t) => sum + t.amount, 0);
        if (dailyTotal + transaction.amount > TRANSACTION_LIMITS.daily_max) {
            return { ok: false, error: `Daily amount limit (${TRANSACTION_LIMITS.daily_max}) would be exceeded` };
        }

        return { ok: true };
    }

    /**
     * Record a validated transaction.
     */
    recordTransaction(transaction) {
        this.transactionLog.push({
            ...transaction,
            timestamp: new Date().toISOString(),
            id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        });
    }

    addToBlacklist(accountId) {
        this.blacklistedAccounts.add(accountId);
    }

    removeFromBlacklist(accountId) {
        this.blacklistedAccounts.delete(accountId);
    }

    getTransactionCount() {
        return this.transactionLog.length;
    }
}

module.exports = { TransactionValidator, TRANSACTION_LIMITS };
