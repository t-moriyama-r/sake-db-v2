'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  confirmSignIn,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  updatePassword,
  resetPassword,
  confirmResetPassword,
  type AuthUser,
} from 'aws-amplify/auth';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  profile?: string;
  imageBase64?: string;
  roles?: string[];
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const authUser: AuthUser = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      setUser({
        id: authUser.userId,
        name: attrs.name ?? '',
        email: attrs.email ?? '',
        profile: attrs.profile,
        imageBase64: attrs['custom:imageBase64'],
        roles: attrs['custom:roles']?.split(',').filter(Boolean),
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn({ username: email, password });
    await loadUser();
    return result;
  }, [loadUser]);

  const loginWithX = useCallback(async (username: string, xUserId: string) => {
    const result = await signIn({
      username,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP',
        clientMetadata: { xUserId },
      },
    });
    if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
      await confirmSignIn({ challengeResponse: xUserId });
    }
    await loadUser();
  }, [loadUser]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    return signUp({
      username: email,
      password,
      options: { userAttributes: { name, email } },
    });
  }, []);

  const isAdmin = user?.roles?.includes('admin') ?? false;
  const isLogin = user !== null;

  return {
    user,
    isLogin,
    isAdmin,
    isLoading,
    login,
    loginWithX,
    logout,
    register,
    updateUserAttributes,
    updatePassword,
    resetPassword,
    confirmResetPassword,
    confirmSignUp,
    reload: loadUser,
  };
}
