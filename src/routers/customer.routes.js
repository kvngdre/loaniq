import { Router } from "express";
import grantAccess from "../middleware/grantAccess.js";
import validateObjectId from "../middleware/validate-id.middleware.js";
import CustomerController from "../web/controllers/customer.controller.js";

const router = Router({ mergeParams: true });

router.post("/", [grantAccess("all")], CustomerController.createCustomer);

router.get("/", [grantAccess("all")], CustomerController.getCustomers);

router.get(
  "/:customerId",
  [validateObjectId, grantAccess("all")],
  CustomerController.getCustomer,
);

router.patch(
  "/:customerId",
  [validateObjectId, grantAccess("all")],
  CustomerController.updateCustomer,
);

router.delete(
  "/:customerId",
  [validateObjectId, grantAccess("all")],
  CustomerController.deleteCustomer,
);

export default router;
