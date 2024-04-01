// core.js

class Core {
    constructor(memory) {
        this.memory = memory;
        this.stack = [];
        this.queue = [];
    }

    peek() {
        return this.tokens[0] || null;
    }

    get() {
        return this.tokens.shift();
    }

    consumeAndRunUntilBreak() {
        this.get();
        let returnValue = [];
        while (!this.isWrapper() && this.tokens.length) returnValue.push(this.get());
        let newInterpreter = new Interpreter(this.memory);
        return newInterpreter.input(returnValue.join(" "));
    }

    consumeUntilFunctionWrapper(char, returnType) {
        let returnValue;
        switch(returnType) {
            case "string":
                returnValue = "";
                while (this.peek() !== char) returnValue += this.get();
                break;
            case "array":
                returnValue = [];
                let conditionalKeywords = ["if", "elsif", "else"],
                    isLoopKeywords = ["from"],
                    wrapperCounter = 0,
                    conditionalKeywordCounter = 0,
                    testCounter = 0;
                if (char === ":") {
                    while (this.peek() !== char || wrapperCounter !== conditionalKeywordCounter * 2 || this.isConditionalKeyword()) {

                        if (this.isWrapper()) wrapperCounter++;
                        if (this.isConditionalKeyword() || this.isLoopKeyword()) conditionalKeywordCounter++;
                        returnValue.push(this.get());
                        testCounter++;
                    }
                } else {
                    while (this.peek() !== char) {
                        returnValue.push(this.get());
                    }
                }
                break;
            default:
                break;
        }

        return returnValue;
    }

    // Add other methods of Core class here...

    isWrapper() {
        return this.peek() === ":";
    }

    isOpeningArr() {
        return this.peek() === "[";
    }

    isClosingArr() {
        return this.peek() === "]";
    }

    isStringWrapper() {
        return this.peek() === "\"";
    }

    isAssignmentOperator() {
        return this.peek() === "=";
    }

    isComparisonOperator() {
        return this.peek() === "==";
    }

    isTermOperator() {
        return "+-".includes(this.peek());
    }

    isFactorOperator() {
        return "*/%".includes(this.peek());
    }

    isAdditiveInverseOperator() {
        return this.peek() === "-";
    }

    isOpeningParen() {
        return this.peek() === "(";
    }

    isClosingParen() {
        return this.peek() === ")";
    }

    isReturnOperator() {
        return this.peek() === "=>";
    }

    isLetter() {
        let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return letters.includes(this.peek()[0]);
    }

    isDigit() {
        return "0123456789".includes(this.peek()[0]);
    }

    isBoolean() {
        return ["true", "false"].includes(this.peek());
    }

    getNumber() {
        if (!this.isDigit()) {
            return null;
        } else {
            return parseFloat(this.get());
        }
    }

    getIdentifier() {
        if (!this.isLetter()) {
            return null;
        } else {
            return this.get();
        }
    }

    functionCall(currentFunction) {
        if (!this.isOpeningParen()) throw new Error("A function call must have arguments wrapped in parentheses!");
        this.get();
        let currentArguments = this.consumeUntil(")", "array");
        if (currentArguments.length) currentArguments = currentArguments.join("").split(",");
        if (!this.isClosingParen()) throw new Error("A function call must have arguments wrapped in parentheses!");
        this.get();
        if (currentFunction.isNative) {
            currentFunction.params.push(this)
            for (let i in currentArguments) {
                let funcName = currentArguments[i].substring(0,currentArguments[i].indexOf('('));
                if (this.getVariable(currentArguments[i])) {
                    currentFunction.params.push(this.getVariable(currentArguments[i]));
                }
                else if (this.getVariable(funcName)) {
                    let newInterpreter = new Interpreter(this.memory);
                    currentFunction.params.push(newInterpreter.input(currentArguments[i]));
                }
                else {
                    currentFunction.params.push(currentArguments[i]);
                }
            }
            let returnVal = currentFunction.body(currentFunction.params);
            this.resetParams(currentFunction.name);

            return returnVal;
        }
        let otherInterpreter = new Interpreter(this.memory);
        let bodyToParse = currentFunction.body.slice(0);
        for (let j = 0; j < currentArguments.length; j++) {
            let currentArgument;
            if (this.getVariable(currentArguments[j]) && this.getVariable(currentArguments[j]).type === "fn") {
                currentArgument = currentArguments[j];
            } else {
                currentArgument = otherInterpreter.input(currentArguments[j]) || currentArguments[j];
            }
            let parameterToReplace = currentFunction.params[j].name;
            switch(currentFunction.params[j].type) {
                case "num":
                    if (typeof parseFloat(currentArgument) !== "number" || isNaN(parseFloat(currentArgument))) throw new Error("Functions should only be called with parameters of the correct type!");
                    break;
                case "str":
                    if (currentArgument[0] !== '"') throw new Error("Functions should only be called with parameters of the correct type!");
                    break;
                case "bool":
                    if (currentArgument !== "true" && currentArgument !== "false") throw new Error("Functions should only be called with parameters of the correct type!");
                    break;
                case "fn":
                    if (!this.getVariable(currentArgument) || this.getVariable(currentArgument).type !== "fn") throw new Error("Functions should only be called with parameters of the correct type!");
                    break;
                case "arr":
                    break;
                default:
                    throw new Error("Functions should only be called with parameters of the correct type!");
                    break;
            }
            bodyToParse = bodyToParse.map(element => {
                if (element === parameterToReplace) {
                    return currentArgument;
                } else {
                    return element;
                }
            });
        }
        return otherInterpreter.input(bodyToParse.join(" "));
    }

    factor() {
        let factorResult = this.getNumber();
        if (factorResult !== null) {
            return factorResult;
        } else if (this.isStringWrapper()) {
            this.get();
            factorResult = this.consumeUntil('"', "string");
            this.get();
            return factorResult;
        }
        else if (this.isAdditiveInverseOperator()) {
            this.get();
            factorResult = this.factor();
            return -factorResult;
        } else if (this.isOpeningParen()) {
            this.get();
            factorResult = this.expression();
            if (!this.isClosingParen()) throw new Error("Parentheses should always be properly closed!");
            this.get();
            return factorResult;
        } else if (this.isBoolean()) {
            factorResult = this.get();
            return factorResult;
        } else if (this.isOpeningArr()) {
            factorResult = this.peek();
            factorResult = this.consumeUntil(']', "string");
            factorResult += this.peek();
            this.get();
            return factorResult;
        }
        factorResult = this.getIdentifier();
        if (factorResult) {
            let variable = this.getVariable(factorResult);
            if (variable) {
                switch(variable.type) {
                    case "num":
                        return parseFloat(variable.value);
                    case "str":
                        return variable.value;
                    case "bool":
                        return variable.value;
                    case "fn":
                        return this.functionCall(variable.value);
                    case "arr":
                        return variable.value;
                    default:
                        throw new Error("Unexpected token: " + variable.type);
                }
            }
            else {
                throw new Error(`Undefined variable: ${factorResult}`);
            }
        } else {
            throw new Error("Unexpected token: " + this.peek());
        }
    }

    term() {
        let termResult = this.factor();
        while (this.isFactorOperator()) {
            let operator = this.get();
            let nextFactor = this.factor();
            if (operator === "*") termResult *= nextFactor;
            else if (operator === "/") termResult /= nextFactor;
            else termResult %= nextFactor;
        }
        return termResult;
    }

    expression() {
        let expressionResult = this.term();
        while (this.isTermOperator()) {
            let operator = this.get();
            let nextTerm = this.term();
            if (operator === "+") expressionResult += nextTerm;
            else expressionResult -= nextTerm;
        }
        return expressionResult;
    }

    relation() {
        let relationResult = this.expression();
        if (this.isComparisonOperator()) {
            let operator = this.get();
            let nextExpression = this.expression();
            switch (operator) {
                case "==":
                    relationResult = relationResult === nextExpression;
                    break;
                default:
                    throw new Error("Unexpected token: " + operator);
            }
        }
        return relationResult;
    }

    conditional() {
        let conditionalResult;
        if (this.peek() === "if") {
            this.get();
            if (!this.isOpeningParen()) throw new Error("Conditionals must have conditions wrapped in parentheses!");
            this.get();
            conditionalResult = this.relation();
            if (!this.isClosingParen()) throw new Error("Conditionals must have conditions wrapped in parentheses!");
            this.get();
            let ifStatements = this.consumeUntil("endif", "array");
            let elsifStatements = [];
            while (this.peek() === "elsif") {
                this.get();
                if (!this.isOpeningParen()) throw new Error("Conditionals must have conditions wrapped in parentheses!");
                this.get();
                conditionalResult = this.relation();
                if (!this.isClosingParen()) throw new Error("Conditionals must have conditions wrapped in parentheses!");
                this.get();
                let elsifBlock = this.consumeUntil("endif", "array");
                elsifStatements.push({conditional: conditionalResult, block: elsifBlock});
            }
            let elseBlock = [];
            if (this.peek() === "else") {
                this.get();
                elseBlock = this.consumeUntil("endif", "array");
            }
            if (!this.peek() === "endif") throw new Error("Conditionals must be properly closed!");
            this.get();
            if (conditionalResult) {
                for (let i in ifStatements) {
                    let newInterpreter = new Interpreter(this.memory);
                    conditionalResult = newInterpreter.input(ifStatements[i]);
                }
            }
            else {
                for (let i in elsifStatements) {
                    let newInterpreter = new Interpreter(this.memory);
                    if (elsifStatements[i].conditional) conditionalResult = newInterpreter.input(elsifStatements[i].block);
                }
                if (!conditionalResult) {
                    for (let i in elseBlock) {
                        let newInterpreter = new Interpreter(this.memory);
                        conditionalResult = newInterpreter.input(elseBlock[i]);
                    }
                }
            }
        }
        else {
            let loopHeader = this.consumeUntil("from", "string");
            if (loopHeader.length) loopHeader = loopHeader.join("").split(" ");
            let loopBody = this.consumeUntil("endfrom", "array");
            if (!this.peek() === "endfrom") throw new Error("Loops must be properly closed!");
            this.get();
            let newInterpreter = new Interpreter(this.memory);
            if (this.peek() === "from") {
                let loopVariable = this.get();
                if (isNaN(parseFloat(loopVariable))) throw new Error("Loop variables must be numbers!");
                loopVariable = parseFloat(loopVariable);
                if (!this.peek() === "to") throw new Error("Loop variables must have a proper range!");
                this.get();
                let loopMax = this.relation();
                if (isNaN(parseFloat(loopMax))) throw new Error("Loop variables must have a proper range!");
                loopMax = parseFloat(loopMax);
                if (!this.peek() === "do") throw new Error("Loops must have a 'do' keyword!");
                this.get();
                for (let i = loopVariable; i <= loopMax; i++) {
                    this.memory[this.stack[this.stack.length - 1]].value = i;
                    conditionalResult = newInterpreter.input(loopBody);
                }
            } else {
                throw new Error("Loops must have a 'from' keyword!");
            }
        }
    }

    interpret() {
        while (this.tokens.length) {
            let result = this.consumeAndRunUntilBreak();
            if (this.peek() === ":") this.get();
        }
    }

    isConditionalKeyword() {
        return ["if", "elsif", "else", "endif"].includes(this.peek());
    }

    isLoopKeyword() {
        return ["from", "to", "endfrom"].includes(this.peek());
    }
}

module.exports = Core;
