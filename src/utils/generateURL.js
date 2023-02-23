import { get } from '../config/config'
import { createHash, createCipheriv, createDecipheriv } from 'crypto'

const algorithm = 'aes128'
const initVector = get('crypto.initVector')
const secret = get('crypto.secret_key')
const key = createHash('sha256').update(String(secret)).digest('base64').substring(0, 16)
console.log('key', key)

function encryptqueryFilter (lenderId) {
  // Cipher func

  const cipher = createCipheriv(algorithm, key, initVector)

  const message = `id=${lenderId}`

  // Encrypt the message
  let encryptedData = cipher.update(message, 'utf-8', 'hex') // input encoding, output encoding

  encryptedData += cipher.final('hex')

  return encryptedData
}

function decryptqueryFilter (encryptedData) {
  // Decipher Func
  const decipher = createDecipheriv(algorithm, key, initVector)

  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8')

  decryptedData += decipher.final('utf-8')

  return decryptedData
}

export default {
  encryptqueryFilter,
  decryptqueryFilter
}
