import { DEMO_USERS } from '../data/users.js';

/**
 * Simulates an authentication check against demo accounts.
 * In the real app, this would be an API call to the backend.
 *
 * @param {string} email
 * @param {string} password - Any non-empty password is accepted in demo mode.
 * @returns {{ user: object } | { error: string }}
 */
export function loginUser(email, password) {
  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  if (password.length < 4) {
    return { error: 'Password must be at least 4 characters.' };
  }

  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    return { error: 'No account found with that email address.' };
  }

  // Demo: any password works for registered demo emails
  return { user };
}
