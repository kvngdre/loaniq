import { Router } from "express";

import { RoleController } from "../controllers/index.js";
import { auth } from "../middleware/auth.middleware.js";

export const roleRouter = Router();

roleRouter.post("/", auth, RoleController.create);

roleRouter.get("/", auth, RoleController.index);

roleRouter.get("/:id", auth, RoleController.show);

roleRouter.patch("/:id", auth, RoleController.edit);

roleRouter.delete("/:id", auth, RoleController.destroy);
