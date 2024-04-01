class PrimitiveType {
    constructor() {
        this.primitiveTypes = ["num", "str", "bool", "fn", "arr"];
    }

    isPrimitiveType(token) {
        return this.primitiveTypes.includes(token);
    }
}

module.exports = PrimitiveType;
