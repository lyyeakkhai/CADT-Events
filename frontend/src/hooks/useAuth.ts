import { useSignIn, useSignUp, useClerk, useUser } from '@clerk/clerk-react';
import { useState } from 'react';

/**
 * Central auth hook — wraps Clerk primitives into the app's own API.
 * All components use this instead of Clerk hooks directly.
 */
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signOut } = useClerk();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ── Sign in with email + password ───────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    if (!signIn) return false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setSignInActive!({ session: result.createdSessionId });
        return true;
      }
      setError('Sign-in incomplete. Please try again.');
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed.';
      // Clerk errors have a `errors` array
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign up with email + password ───────────────────────────────────────
  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ) => {
    if (!signUp) return false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      if (result.status === 'complete') {
        await setSignUpActive!({ session: result.createdSessionId });
        return true;
      }
      // Email verification required
      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setError('CHECK_EMAIL'); // signal to UI to show OTP input
        return false;
      }
      setError('Sign-up incomplete. Please try again.');
      return false;
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? 'Sign-up failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify email OTP ────────────────────────────────────────────────────
  const verifyEmailCode = async (code: string) => {
    if (!signUp) return false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setSignUpActive!({ session: result.createdSessionId });
        return true;
      }
      setError('Invalid or expired code.');
      return false;
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? 'Verification failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── OAuth (Google / LinkedIn) ────────────────────────────────────────────
  const signInWithOAuth = async (provider: 'oauth_google' | 'oauth_linkedin') => {
    if (!signIn) return;
    setIsLoading(true);
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? 'OAuth failed.');
      setIsLoading(false);
    }
  };

  // ── Sign out ─────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut();
  };

  // ── Derive role from Clerk metadata ─────────────────────────────────────
  // publicMetadata.role should be ADMIN | SUPER_ADMIN (or email allowlist on apps).
  const role = String((user?.publicMetadata?.role as string) ?? 'student');
  const isAdmin =
    role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'SUPER_ADMIN';

  return {
    user,
    isLoaded,
    isSignedIn: !!isSignedIn,
    isAdmin,
    isLoading,
    error,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    verifyEmailCode,
    signInWithOAuth,
    logout,
  };
}
