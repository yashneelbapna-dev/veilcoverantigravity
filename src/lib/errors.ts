// Safe error message handler to prevent information leakage
// Maps internal error codes to user-friendly messages

const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'invalid_credentials': 'Invalid email or password',
  'user_not_found': 'Invalid email or password',
  'invalid_grant': 'Invalid email or password',
  'email_not_confirmed': 'Please verify your email address',
  'weak_password': 'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character',
  'user_already_exists': 'An account with this email already exists',
  'email_address_invalid': 'Please enter a valid email address',
  'signup_disabled': 'Sign up is currently disabled',
  'email_provider_disabled': 'Email sign in is currently disabled',
  
  // Timeout errors
  'auth/timeout': 'Request timed out. Please try again',
  'timeout': 'Request timed out. Please try again',
  
  // Checkout/Order errors
  'checkout_failed': 'Unable to process order. Please try again',
  'order_failed': 'Unable to place order. Please try again',
  
  // Profile errors
  'profile_update_failed': 'Unable to update profile. Please try again',
  
  // Generic
  'default': 'An error occurred. Please try again'
};

export type ErrorContext = 
  | 'auth' 
  | 'signup' 
  | 'checkout_failed' 
  | 'profile_update_failed' 
  | 'order_failed'
  | 'default';

/**
 * Returns a safe, user-friendly error message that doesn't expose internal details.
 * Logs the original error in development mode for debugging.
 * 
 * @param error - The original error object
 * @param context - The context in which the error occurred
 * @returns A safe error message for display to users
 */
export const getSafeErrorMessage = (error: any, context: ErrorContext = 'default'): string => {
  // Extract error code from various error formats
  const errorCode = error?.code || error?.error_code || error?.name;
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Log original error in development for debugging
  if (import.meta.env.DEV) {
    console.error(`[${context}] Original error:`, error);
  }
  
  // Check for specific error patterns
  if (errorMessage.includes('timeout')) {
    return SAFE_ERROR_MESSAGES['timeout'];
  }
  
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid email or password') ||
      errorMessage.includes('invalid credentials')) {
    return SAFE_ERROR_MESSAGES['invalid_credentials'];
  }
  
  if (errorMessage.includes('user already registered') ||
      errorMessage.includes('already exists')) {
    return SAFE_ERROR_MESSAGES['user_already_exists'];
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return SAFE_ERROR_MESSAGES['email_not_confirmed'];
  }
  
  if (errorMessage.includes('weak password') || 
      errorMessage.includes('password should be')) {
    return SAFE_ERROR_MESSAGES['weak_password'];
  }
  
  // Check for known error codes
  if (errorCode && SAFE_ERROR_MESSAGES[errorCode]) {
    return SAFE_ERROR_MESSAGES[errorCode];
  }
  
  // Return context-specific default or generic default
  return SAFE_ERROR_MESSAGES[context] || SAFE_ERROR_MESSAGES.default;
};
