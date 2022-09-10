const unwantedTexts = ['"value" does not match any of the allowed types. '];

function concatErrorMsg(errorMessage) {
    // Remove unwanted text
    unwantedTexts.forEach(
        (text) => (errorMessage = errorMessage.replace(text, ''))
    );
    // Separate error messages.
    errorMessage = errorMessage.split('. ');

    let newErrorMsg = '';
    errorMessage.forEach(
        (text) => (newErrorMsg = newErrorMsg.concat(text, '\n'))
    );

    return newErrorMsg;
}

module.exports = concatErrorMsg;
