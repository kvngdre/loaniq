class ServerError extends Error {
    constructor(code, msg) {
        super(msg);
        
        this.errorCode = code;
        this.name = this.constructor.name;
        Error?.captureStackTrace(this, this.constructor);
    }
}

module.exports = ServerError;