export const messages = {
  AUTH: {
    LOGIN: {
      ACCOUNT_UNVERIFIED: "Your account has not been verified.",
      ACCOUNT_DEACTIVATED: "Account deactivated. Contact your administrator.",
      RESET_PWD: "Password reset has been triggered.",
      FAILED: "Login Failed",
      SUCCESS: "Login Successful",
    },

    LOGOUT: {
      SUCCESS: "Logout Successful",
      SUCCESS_ALL: "Logged out all sessions",
    },

    NO_PASSWORD_RESET:
      "You cannot reset your own password. Please contact your administrator to reset your password for you.",

    PASSWORD_RESET: "Your password has been reset successfully",

    REGISTRATION: {
      SUCCESS: "You have successfully signed up for the service.",
    },

    TOKENS: {
      GEN_SUCCESS: "Generated new tokens successfully",
      REQ_SUCCESS: "OTP sent to email",
    },

    VERIFY: {
      SUCCESS: "Verification Successful",
      FAILED: "Verification Failed",
      CONFLICT: "Account already verified, please sign in.",
    },
  },

  COMMON: {
    fn: {
      CREATED: (resource) => `${resource} Created Successfully`,
      DELETED: (resource) => `${resource} Deleted Successfully`,
      FETCHED: (resource) => `${resource} Fetched Successfully`,
      UPDATED: (resource) => `${resource} Updated Successfully`,
    },
  },

  ERROR: {
    DUPLICATE: "Duplicate Error Occurred",
    VALIDATION: "One or more validation errors occurred",
    REFRESH_TOKEN_REUSE:
      "Your session has been terminated for security reasons",
    fn: {
      MAILING: (resource) => `Error sending ${resource} to email`,
      NOT_FOUND: (resource) => `${resource} Not Found`,
    },
  },

  USER: {
    DEACTIVATED: "User Deactivated Successfully",
    REACTIVATED: "User Reactivated Successfully",
    PASSWORD_CHANGE: "Password Changed successfully",
    PASSWORD_RESET: "Password Reset Successfully",
  },
};
