import dbLoader from './db.loader.js';
import expressLoader from './express.loader.js';

export default {
  init: async ({ app, routes }) => {
    await dbLoader();

    await expressLoader(app, routes);
  },
};
