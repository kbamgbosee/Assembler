class Keyword {
    constructor() {
        this.keywords = ["if", "elsif", "else", "endif", "from", "to", "endfrom"];
    }

    isKeyword(token) {
        return this.keywords.includes(token);
    }
}

module.exports = Keyword;
