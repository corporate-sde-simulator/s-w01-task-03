const TransactionValidator = require("../src/transactionValidator.js");
const ValidationRules = require("../src/validationRules.js");

describe("Transaction validation middleware for payments", () => {
    test("should process valid input", () => {
        const obj = new TransactionValidator();
        expect(obj.process({ key: "val" })).not.toBeNull();
    });
    test("should handle null", () => {
        const obj = new TransactionValidator();
        expect(obj.process(null)).toBeNull();
    });
    test("should track stats", () => {
        const obj = new TransactionValidator();
        obj.process({ x: 1 });
        expect(obj.getStats().processed).toBe(1);
    });
    test("support should work", () => {
        const obj = new ValidationRules();
        expect(obj.process({ data: "test" })).not.toBeNull();
    });
});
