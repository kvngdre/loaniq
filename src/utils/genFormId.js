function genRandomString (len = 5) {
  let randStr = ''
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 1; i <= len; i++) {
    const char = Math.floor(Math.random() * str.length)

    randStr += str.charAt(char)
  }

  return randStr
}

export default genRandomString
