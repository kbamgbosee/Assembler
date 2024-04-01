

const Memory = require('./memory');
const Core = require('./core');
const Keyword = require('./keyword');
const Operator = require('./operator');
const PrimitiveType = require('./primitiveType');
const MajorOperation = require('./majorOperation');
const DeclarationControlFlow = require('./declarationControlFlow');

class Interpreter {
    constructor(memoryObj) {
        this.memory = memoryObj || new Memory();
        this.keyword = new Keyword();
        this.operator = new Operator();
        this.primitiveType = new PrimitiveType();
        this.majorOperation = new MajorOperation();
        this.declarationControlFlow = new DeclarationControlFlow();
        this.core = new Core(this.memory);
    }

    input(inputString) {
        this.core.tokens = inputString.split(" ");
        this.core.interpret();
    }
}

module.exports = Interpreter;
