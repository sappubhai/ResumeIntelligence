import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = '/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong');
  }

  return response.json();
}

export const getQueryFn = <T>(endpoint: string) => {
  return async (): Promise<T> => {
    return apiRequest(endpoint);
  };
};