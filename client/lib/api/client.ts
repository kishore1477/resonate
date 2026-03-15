const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (auth) {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    // Try to refresh token if 401
    if (response.status === 401 && auth) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiFetch(endpoint, options);
      }
    }

    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return false;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// Auth endpoints
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data), auth: false }),

  register: (data: { name: string; email: string; password: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data), auth: false }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch('/auth/me'),
};

// Workspace endpoints
export const workspacesApi = {
  list: () => apiFetch('/workspaces'),
  get: (slug: string) => apiFetch(`/workspaces/${slug}`),
  create: (data: { name: string; description?: string }) =>
    apiFetch('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  update: (slug: string, data: any) =>
    apiFetch(`/workspaces/${slug}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (slug: string) => apiFetch(`/workspaces/${slug}`, { method: 'DELETE' }),
};

// Board endpoints
export const boardsApi = {
  list: (workspaceSlug: string) => apiFetch(`/workspaces/${workspaceSlug}/boards`),
  get: (workspaceSlug: string, boardSlug: string) =>
    apiFetch(`/workspaces/${workspaceSlug}/boards/${boardSlug}`),
  create: (workspaceSlug: string, data: { name: string; description?: string; isPublic?: boolean }) =>
    apiFetch(`/workspaces/${workspaceSlug}/boards`, { method: 'POST', body: JSON.stringify(data) }),
};

// Post endpoints
export const postsApi = {
  list: (boardId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/boards/${boardId}/posts${query}`);
  },
  get: (postId: string) => apiFetch(`/posts/${postId}`),
  create: (boardId: string, data: { title: string; content: string; categoryId?: string }) =>
    apiFetch(`/boards/${boardId}/posts`, { method: 'POST', body: JSON.stringify(data) }),
  vote: (postId: string) => apiFetch(`/posts/${postId}/votes`, { method: 'POST' }),
  unvote: (postId: string) => apiFetch(`/posts/${postId}/votes`, { method: 'DELETE' }),
};
