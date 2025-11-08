/**
 * Utility function to extract user-friendly error messages from API errors
 * Prevents technical error details from being displayed to users
 */
export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred. Please try again.') => {
  // Log technical details to console for debugging (not shown to user)
  if (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      name: error.name
    });
  }

  // Handle different error types
  if (!error) {
    return defaultMessage;
  }

  // Handle fetch Response errors (when res.ok is false)
  if (error instanceof Response) {
    return 'Request failed. Please try again.';
  }

  // Network errors (no response from server) - for axios
  if (error.request && !error.response) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Server responded with error (axios)
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return data?.message || 'You are not authorized to perform this action. Please log in.';
      case 403:
        return data?.message || 'You do not have permission to perform this action.';
      case 404:
        return data?.message || 'The requested resource was not found.';
      case 409:
        return data?.message || 'This action conflicts with existing data. Please refresh and try again.';
      case 422:
        return data?.message || 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later. If the problem persists, contact support.';
      default:
        // Use server message if available and user-friendly, otherwise use default
        if (data?.message && typeof data.message === 'string' && !data.message.includes('Error:')) {
          return data.message;
        }
        return defaultMessage;
    }
  }

  // Generic error message
  if (error.message && typeof error.message === 'string') {
    // Only show error message if it doesn't look like a technical error
    const technicalIndicators = ['Error:', 'TypeError', 'ReferenceError', 'SyntaxError', 'at ', 'stack', 'undefined', 'null', 'Failed to fetch', 'NetworkError'];
    const isTechnical = technicalIndicators.some(indicator => error.message.includes(indicator));
    
    if (!isTechnical && error.message.length < 200) {
      return error.message;
    }
  }

  return defaultMessage;
};

/**
 * Handle axios errors specifically
 */
export const handleAxiosError = (error, context = 'operation') => {
  const defaultMessages = {
    'load': 'Failed to load data. Please refresh the page and try again.',
    'save': 'Failed to save changes. Please try again.',
    'delete': 'Failed to delete. Please try again.',
    'update': 'Failed to update. Please try again.',
    'create': 'Failed to create. Please try again.',
    'fetch': 'Failed to fetch data. Please try again.',
    'operation': 'An error occurred. Please try again.'
  };

  const defaultMessage = defaultMessages[context] || defaultMessages.operation;
  return getErrorMessage(error, defaultMessage);
};

