import dbLoader from './db.loader.js';
import expressLoader from './express.loader.js';

export default {
  init: async ({ expressApp = null, expressRoutes = null }) => {
    await dbLoader();

    await expressLoader(expressApp, expressRoutes);
  },
};
