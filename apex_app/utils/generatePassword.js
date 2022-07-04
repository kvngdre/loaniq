function randomPasswordGenerator() {
    let password = '';
    const numerals = "0123456789";
    const symbols = "!@#$%&+=./?~-_!@#$%&+=./?~-_:";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    for(let i = 0; i < 4; i++) {

        for(let i = 0; i < 1; i++) {
            password += numerals.charAt(Math.floor(Math.random() * numerals.length));
        }

        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        
        for(let i = 0; i < 1; i++) {
            password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }

        for(let i = 0; i < 1; i++) {
            password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        }
    }

    return password;
}

module.exports = randomPasswordGenerator;