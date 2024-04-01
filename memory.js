class Memory {
    constructor() {
        this.memory = {};
    }

    getVariable(name) {
        return this.memory[name];
    }

    addVariable(type, name, params, body) {
        this.memory[name] = {
            isNative: false,
            name: name,
            type: type,
            params: params,
            body: body
        };
    }

    resetParams(name) {
        let func = this.getVariable(name);
        func.params = [];
    }
}

module.exports = Memory;

