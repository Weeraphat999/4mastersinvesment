/**
 * Auth validation utilities for sign-up/sign-in form fields.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an email address.
 * Rejects strings not matching the pattern: <non-whitespace>@<non-whitespace>.<non-whitespace>
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

/**
 * Validates a password.
 * Rejects strings with fewer than 6 characters.
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}
