class ServerError extends Error {
    constructor(code, msg) {
        super(msg);

        this.errorCode = code;

    }
}

module.exports = ServerError;