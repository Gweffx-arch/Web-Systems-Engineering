const BASE_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

function clearAuthStorage() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !options.skipAuth) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('access_token', data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);

          headers.set('Authorization', `Bearer ${data.accessToken}`);
          response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
          });
        } else {
          clearAuthStorage();
          window.location.hash = '#/login';
        }
      } catch {
        clearAuthStorage();
        window.location.hash = '#/login';
      }
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}