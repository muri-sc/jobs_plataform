const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

/**
 * Cliente HTTP central. Em 401 limpa a sessão e redireciona para /login.
 */
export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const isAuthRoute =
      path.startsWith('/auth/login') || path.startsWith('/auth/register');

    // 401 em rota autenticada: limpa sessão e manda para login
    if (response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    throw new ApiError(data?.error || 'Erro na requisição', {
      status: response.status,
      details: data?.details,
    });
  }

  return data;
}
