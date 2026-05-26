import type { ApiError, ApiErrorType } from './types';

/**
 * User-facing error messages mapped by error type.
 */
const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  NOT_FOUND: 'Ticker symbol not recognized. Please check and try again.',
  NETWORK: 'Network connection issue. Showing cached or estimated data.',
  RATE_LIMIT: 'Daily API limit reached (25/day). Showing cached data.',
  TIMEOUT: 'Request timed out. Showing cached or estimated data.',
  UNKNOWN: 'Something went wrong. Showing estimated data.',
};

/**
 * Checks if an error is a network-related error (fetch/TypeError with network keywords).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return message.includes('fetch') || message.includes('network');
  }
  return false;
}

/**
 * Checks if an error is a timeout error (AbortError from AbortController).
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  return false;
}

/**
 * Checks if an HTTP status code indicates a not-found response.
 */
export function isNotFoundError(status: number): boolean {
  return status === 404;
}

/**
 * Classifies an unknown error into a structured ApiError object.
 * Does NOT throw — always returns a structured error object.
 * Logs technical details to console.error.
 */
export function classifyError(error: unknown, context?: string): ApiError {
  const contextPrefix = context ? `[${context}] ` : '';
  let type: ApiErrorType;
  let technical: string;

  if (isTimeoutError(error)) {
    type = 'TIMEOUT';
    technical = `${contextPrefix}Request aborted due to timeout`;
  } else if (isNetworkError(error)) {
    type = 'NETWORK';
    technical = `${contextPrefix}Network error: ${error instanceof Error ? error.message : String(error)}`;
  } else if (error instanceof Error && error.message.toLowerCase().includes('rate limit')) {
    type = 'RATE_LIMIT';
    technical = `${contextPrefix}Rate limit exceeded: ${error.message}`;
  } else if (error instanceof Error) {
    type = 'UNKNOWN';
    technical = `${contextPrefix}${error.name}: ${error.message}`;
  } else if (typeof error === 'string') {
    if (error.toLowerCase().includes('rate limit')) {
      type = 'RATE_LIMIT';
      technical = `${contextPrefix}Rate limit: ${error}`;
    } else {
      type = 'UNKNOWN';
      technical = `${contextPrefix}${error}`;
    }
  } else {
    type = 'UNKNOWN';
    technical = `${contextPrefix}Unknown error: ${JSON.stringify(error)}`;
  }

  const message = ERROR_MESSAGES[type];

  console.error(technical);

  return { type, message, technical };
}
