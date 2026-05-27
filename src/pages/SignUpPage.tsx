import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/authValidation';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Client-side validation
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

    if (!emailResult.valid) {
      setEmailError(emailResult.error || 'Invalid email');
    }
    if (!passwordResult.valid) {
      setPasswordError(passwordResult.error || 'Invalid password');
    }

    if (!emailResult.valid || !passwordResult.valid) {
      return;
    }

    // Submit to Auth_Service
    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        // Handle duplicate email or other Auth_Service errors
        if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already been registered') ||
            error.message.toLowerCase().includes('user already registered')) {
          setGeneralError('This email is already registered');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch {
      setGeneralError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
          <p className="text-gray-300">
            We've sent a confirmation link to <span className="text-blue-400">{email}</span>.
            Please check your inbox to verify your account.
          </p>
          <Link
            to="/signin"
            className="mt-6 inline-block text-blue-400 hover:text-blue-300 underline"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Create your account
        </h1>

        {generalError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-400">{emailError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-400">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-400 hover:text-blue-300 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
