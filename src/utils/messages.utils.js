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
    FETCHED_Fn: (resource) => `${resource} Fetched Successfully`,
    CREATED_Fn: (resource) => `${resource} Created Successfully`,
    UPDATED_Fn: (resource) => `${resource} Updated Successfully`,
    DELETED_Fn: (resource) => `${resource} Deleted Successfully`,
  },

  ERROR: {
    DUPLICATE_Fn: (field) => `${field} is already in use`,
    MAILING_Fn: (resource) => `Error sending ${resource} to email`,
    NOT_FOUND_Fn: (resource) => `${resource} Not Found`,
    REFRESH_TOKEN_REUSE:
      "Your session has been terminated for security reasons",
  },

  USER: {},
};
