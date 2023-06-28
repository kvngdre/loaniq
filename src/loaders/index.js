import expressLoader from "./express.loader.js";

export default {
  init: async (app) => {
    // await dbLoader();

    await expressLoader(app);
  },
};
