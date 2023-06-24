const databaseConnectionSetup = {
  env: process.env.NODE_ENV,
  uri: {
    dev_local: process.env.DEV_DB_URI_LOCAL,
    development: process.env.DEV_DB_URI_REMOTE,
    test: process.env.TEST_DB_URI,
    production: process.env.PROD_DB_URI,
  },
  password: process.env.DB_PASSWORD,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
export default databaseConnectionSetup;
