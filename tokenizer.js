class Tokenizer {
    constructor() {}

    tokenize(text) {
        var regex = /\s*(=>|["-+*\][\/\%:\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
        return text.split(regex).filter(function(s) {
            return !s.match(/^\s*$/);
        });
    }

    input(text) {
        this.tokens = this.tokenize(text);
        if (!this.tokens.length) {
            return "";
        }
        return this.program();
    }
}

module.exports = Tokenizer;
