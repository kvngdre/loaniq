const unwantedTexts = ['"value" does not match any of the allowed types. '];

function concatErrorMsg(errorMessage) {
    let newErrorMsg = '';

    if (Array.isArray(errorMessage)) {
        errorMessage.forEach(
            (obj) => (newErrorMsg = newErrorMsg.concat(obj.message, '\n'))
        );
    } else {
        // Remove unwanted text
        unwantedTexts.forEach(
            (text) => (errorMessage = errorMessage.replace(text, ''))
        );
        // Separate error messages.
        errorMessage = errorMessage.split('. ');

        errorMessage.forEach(
            (text) => (newErrorMsg = newErrorMsg.concat(text, '\n'))
        );
    }

    return newErrorMsg;
}

module.exports = concatErrorMsg;
