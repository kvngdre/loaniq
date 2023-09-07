import { Types } from "mongoose";

import ErrorResponse from "../../utils/ErrorResponse.js";
import { HttpCode } from "../../utils/common.js";

export default function validateIdMiddleware(req, res, next) {
  if (
    /[a-z]+Id$|^id$/g.test(req.params.id) &&
    !Types.ObjectId.isValid(req.params.id)
  ) {
    return res
      .status(HttpCode.BAD_REQUEST)
      .json(new ErrorResponse({ message: "Invalid ID" }));
  }

  return next();
}

// export default function (req, res, next) {
//   for (const key in Object.keys(req.params)) {
//     if (
//       /[a-z]+Id$|^id$/g.test(key) &&
//       !Types.ObjectId.isValid(req.params.id)
//     ) {
//       return res.status(HttpCode.BAD_REQUEST).json(
//         new ErrorResponse({
//           name: "Validation Error",
//           message: `Invalid ${key
//             .replace(/([a-z])([A-Z])/, "$1 $2")
//             .toLowerCase()}`,
//         }),
//       );
//     }
//   }

//   next();
// }
