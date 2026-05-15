import { useAuthContext } from './auth-context';

/**
 * Hook to access authentication state and methods
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
