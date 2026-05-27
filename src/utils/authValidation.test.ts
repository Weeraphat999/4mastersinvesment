import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from './authValidation';

describe('validateEmail', () => {
  it('returns valid for a standard email', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true });
  });

  it('returns valid for email with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toEqual({ valid: true });
  });

  it('returns invalid for empty string', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('returns invalid for string without @', () => {
    const result = validateEmail('userexample.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('returns invalid for string without domain part after @', () => {
    const result = validateEmail('user@');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('returns invalid for string without dot in domain', () => {
    const result = validateEmail('user@example');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('returns invalid for string with spaces', () => {
    const result = validateEmail('user @example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toEqual({ valid: true });
  });
});

describe('validatePassword', () => {
  it('returns valid for password with exactly 6 characters', () => {
    expect(validatePassword('abcdef')).toEqual({ valid: true });
  });

  it('returns valid for password with more than 6 characters', () => {
    expect(validatePassword('longpassword123')).toEqual({ valid: true });
  });

  it('returns invalid for empty string', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 6 characters');
  });

  it('returns invalid for password with fewer than 6 characters', () => {
    const result = validatePassword('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 6 characters');
  });

  it('returns invalid for password with exactly 5 characters', () => {
    const result = validatePassword('abcde');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Password must be at least 6 characters');
  });
});
