class FileUploadError extends Error {
    constructor(status, message) {
        super();

        this.message = message;
        
        this.statusCode = status;

        this.name = this.constructor.name;

        Error?.captureStackTrace(this, this.constructor);
    }
}

// try{
//     throw new FileUploadError('Destination storage not found.');
// }catch(e) {
//     console.log(e instanceof CustomError)
//     console.log(e.name)
//     console.log('code===-==-==',e.code)
//     console.log(e.message)
//     console.log(e.date)
//     console.log('stack===------', e.stack)
// }

module.exports = {
    FileUploadError
}