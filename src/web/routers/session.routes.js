import { Router } from "express";

import { SessionController } from "../controllers/index.js";

export const sessionRouter = Router();

sessionRouter.post("/", SessionController.create);

sessionRouter.get("/", SessionController.index);

sessionRouter.get("/:id", SessionController.show);

sessionRouter.patch("/:id", SessionController.edit);

sessionRouter.delete("/:id", SessionController.destroy);
