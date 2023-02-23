import { config } from 'dotenv'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const env = process.env.NODE_ENV

const foundEnv = config()

if (foundEnv.error || env === 'production') {
  console.error('No .env file found.')
  process.exit(1)
}

export default {
  api: {
    prefix: '/api',
    version: '/v1'
  },
  charge: process.env.RATE,
  db: {
    uri: {
      dev_local: process.env.DEV_DB_URI_LOCAL,
      dev_atlas: process.env.DEV_DB_URI_REMOTE,
      test: process.env.TEST_DB_URI,
      prod: process.env.PROD_DB_URI
    },
    password: process.env.DB_PASSWORD
  },
  flw: {
    public_key: process.env.FLW_PUBLIC_KEY,
    secret: process.env.FLW_PRIVATE_KEY,
    encrypt_key: process.env.FLW_ENCRYPTION_KEY,
    webhook_hash: process.env.FLW_WEBHOOK_HASH
  },
  jwt: {
    secret: {
      access: process.env.JWT_ACCESS_KEY,
      refresh: process.env.JWT_REFRESH_KEY
    },
    exp_time: {
      access: process.env.JWT_ACCESS_TIME,
      refresh: process.env.JWT_REFRESH_TIME,
      form: process.env.JWT_FORM_TIME
    },
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  },
  mailer: {
    sender_mail: process.env.SENDER_EMAIL_ADDRESS,
    client_secret: process.env.CLIENT_SECRET,
    oauth_playground: process.env.OAUTH_PLAYGROUND,
    client_id: process.env.CLIENT_ID,
    refresh_token: process.env.REFRESH_TOKEN,
    password: process.env.USER_EMAIL_PASSWORD
  },
  max_similarity: process.env.MAX_SIMILARITY,
  paystack: {
    secret: process.env.PAYSTACK_PRIVATE_KEY
  },
  port: process.env.PORT,
  salt: process.env.SALT,
  secure_cookie: false,
  support: {
    email: 'support@apexxialtd.com'
  }
}
