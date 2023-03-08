import { config } from 'dotenv'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
export const env = process.env.NODE_ENV

const foundEnv = config()
if (foundEnv.error || env === 'production') {
  throw new Error('No .env file found.')
}

export default {
  api: {
    prefix: '/api',
    version: '/v1',
    encrypt_key: process.env.ENCRYPTION_KEY
  },
  charge: process.env.RATE,
  db: {
    uri: {
      dev_local: process.env.DEV_DB_URI_LOCAL,
      development: process.env.DEV_DB_URI_REMOTE,
      test: process.env.TEST_DB_URI,
      production: process.env.PROD_DB_URI
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
      form: process.env.JWT_FORM_KEY,
      refresh: process.env.JWT_REFRESH_KEY
    },
    exp_time: {
      access: parseInt(process.env.JWT_ACCESS_TIME),
      refresh: parseInt(process.env.JWT_REFRESH_TIME),
      form: parseInt(process.env.JWT_FORM_TIME)
    },
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  },
  mailer: {
    senderEmail: process.env.SENDER_EMAIL,
    mailPassword: process.env.MAIL_PASSWORD,
    clientSecret: process.env.CLIENT_SECRET,
    oauthPlayground: process.env.OAUTH_PLAYGROUND,
    clientId: process.env.CLIENT_ID,
    refreshToken: process.env.REFRESH_TOKEN
  },
  max_similarity: parseInt(process.env.MAX_SIMILARITY),
  paystack: {
    key: {
      private: process.env.PSK_SECRET_KEY,
      public: process.env.PSK_PUBLIC_KEY
    }
  },
  port: process.env.PORT,
  salt: process.env.SALT,
  secure_cookie: false,
  support: {
    email: 'support@apexxialtd.com'
  }
}
