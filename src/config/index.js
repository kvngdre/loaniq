export const config = {
  auth0: {
    secret: process.env.AUTH0_SECRET,
    base_url: process.env.AUTH0_BASE_URL,
    issuer_base_url: process.env.AUTH0_ISSUER_BASE_URL,
    client_id: process.env.AUTH0_CLIENT_ID,
  },

  api: {
    base_url: process.env.BASE_URL,
    encryption_key: process.env.ENCRYPTION_KEY,
    port: process.env.PORT,
    prefix: "/api",
    salt: process.env.SALT,
    secure_cookie: false,
    version: process.env.VERSION,
  },

  companyInfo: { name: "AIdea" },

  charge: process.env.RATE,

  flw: {
    public_key: process.env.FLW_PUBLIC_KEY,
    secret: process.env.FLW_PRIVATE_KEY,
    encrypt_key: process.env.FLW_ENCRYPTION_KEY,
    webhook_hash: process.env.FLW_WEBHOOK_HASH,
  },

  jwt: {
    secret: {
      access: process.env.JWT_ACCESS_SECRET,
      form: process.env.JWT_FORM_SECRET,
      refresh: process.env.JWT_REFRESH_SECRET,
    },
    ttl: {
      access: parseInt(process.env.JWT_ACCESS_TTL, 10),
      form: parseInt(process.env.JWT_FORM_TTL, 10),
      refresh: parseInt(process.env.JWT_REFRESH_TTL, 10),
    },
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
  },

  mail: {
    sender: process.env.SENDER_EMAIL,
    pass: process.env.MAIL_PASSWORD,
    client_secret: process.env.CLIENT_SECRET,
    oauth_playground: process.env.OAUTH_PLAYGROUND,
    client_id: process.env.CLIENT_ID,
    refresh_token: process.env.REFRESH_TOKEN,
  },

  max_similarity: parseInt(process.env.MAX_SIMILARITY, 10),

  paystack: {
    key: {
      private: process.env.PSK_SECRET_KEY,
      public: process.env.PSK_PUBLIC_KEY,
    },
  },

  support: {
    email: "support@apex.com",
  },
};
