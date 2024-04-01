

class DeclarationControlFlow {
    constructor() {
        this.controlFlowKeywords = ["from", "to", "endfrom"];
    }

    isControlFlowKeyword(token) {
        return this.controlFlowKeywords.includes(token);
    }
}

module.exports = DeclarationControlFlow;
