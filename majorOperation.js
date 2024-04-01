// majorOperation.js

class MajorOperation {
    constructor() {
        this.majorOperations = ["interpret", "consumeAndRunUntilBreak", "consumeUntilFunctionWrapper", "consumeUntil", "functionCall", "factor", "term", "expression", "relation", "conditional"];
    }

    isMajorOperation(methodName) {
        return this.majorOperations.includes(methodName);
    }
}

module.exports = MajorOperation;
