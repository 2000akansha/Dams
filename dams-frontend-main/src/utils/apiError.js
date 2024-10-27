// Common error handling function
export const handleApiError = (error) => {
  if (error.response) {
    // If there's a response from the server
    if (
      error.response.data.success === false ||
      error.response.data.status === false
    ) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: "An unknown error occurred.",
      };
    }
  } else {
    // If there's no response (network error, etc.)
    return {
      success: false,
      message: "Internal server error. Please try again later.",
    };
  }
};
