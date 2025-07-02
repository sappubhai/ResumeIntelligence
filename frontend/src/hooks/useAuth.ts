import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      try {
        return await apiRequest('/user');
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<User> => {
      return apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['user'], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData): Promise<User> => {
      return apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['user'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      return apiRequest('/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}