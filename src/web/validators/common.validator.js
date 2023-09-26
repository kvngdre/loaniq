import Joi from "joi";

import { objectIdSchema } from "./lib/common-schemas.js";

export const idValidator = Joi.object({
  body: Joi.object({}),
  query: Joi.object({}),
  params: Joi.object({
    id: objectIdSchema.required(),
  }),
});
