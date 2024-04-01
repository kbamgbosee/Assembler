class Operator {
    constructor() {
        this.operators = ["+", "-", "*", "/", "%", "=", "==", "=>"];
    }

    isOperator(token) {
        return this.operators.includes(token);
    }
}

module.exports = Operator;
