import 'dotenv/config.js';
import 'express-async-errors';

import express from "express";

import config from './config/index.js';
import loaders from './loaders/index.js';
import routes from './routers/index.js';

function startServer () {
  const app = express();
  const {port} = config;

  loaders.init({ expressApp: app, expressRoutes: routes })

  app.listen(port, (err) => {
    if (err) console.error(err)

    console.log(`Server running on port: ${port}`)
  })
}

startServer()
