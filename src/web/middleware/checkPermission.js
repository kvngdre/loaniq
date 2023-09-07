import ErrorResponse from "../../utils/ErrorResponse.js";

/**
 *
 * @param {string} action
 * @param {string} target
 * @returns
 */
const checkPermission = (action, target) => (req, res, next) => {
  function hasPermission() {
    return req.currentUser.role.permissions.some(
      (p) => p.action === action && p.target === target,
    );
  }

  function canActOnAny() {
    return req.currentUser.role.permissions.some(
      (p) =>
        p.action === action.slice(0, action.length - 3).concat("Any") &&
        p.target === target,
    );
  }

  function isTenant() {
    /**
     * The type of the left hand side (str) would coerce the right hand side
     * (ObjectId)to be of the same type (str == str) before comparison.
     */
    // eslint-disable-next-line eqeqeq
    return req.params.tenantId == req.currentUser.tenantId;
  }

  if (!canActOnAny()) {
    if (!hasPermission()) {
      return res.status(403).json(
        new ErrorResponse({
          name: "Auth Error",
          message:
            "You do not have sufficient permissions to perform this action.",
        }),
      );
    }
    if (req.params.tenantId && !isTenant()) {
      return res.status(403).json(
        new ErrorResponse({
          name: "Auth Error",
          message:
            "You do not have sufficient permissions to perform this action.",
        }),
      );
    }
  }
  next();
};

export default checkPermission;
