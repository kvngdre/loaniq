import { initializeApp } from './app.loader.js';
import { connectDatabase } from './db.loader.js';

export default {
  init: async ({ expressApp = null, expressRoutes = null }) => {
    await connectDatabase();
    await initializeApp(expressApp, expressRoutes);
  },
};
