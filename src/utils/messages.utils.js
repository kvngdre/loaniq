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
    },
    TOKENS: {
      GEN_SUCCESS: "Generated new tokens successfully",
      REQ_SUCCESS: "OTP sent to email",
    },
  },

  COMMON: {
    FETCHED: (resource) => `Fetched ${resource} Successfully`,
    CREATED: (resource) => `${resource} Created Successfully`,
    UPDATED: (resource) => `${resource} Updated Successfully`,
    DELETED: (resource) => `${resource} Deleted Successfully`,
  },
};
