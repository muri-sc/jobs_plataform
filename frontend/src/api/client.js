const API_URL = resolveApiUrl();

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** JWT da sessão atual. A API exige Authorization Bearer; não persistimos no navegador. */
let authToken = null;
let onUnauthorized = () => {};

export function setAuthToken(token) {
  authToken = token || null;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : () => {};
}

function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL || 'https://jobs-plataform.onrender.com').replace(
    /\/$/,
    ''
  );
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

/**
 * Cliente HTTP central. Em 401 limpa a sessão e redireciona para /login.
 */
export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
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

    if (response.status === 401 && !isAuthRoute) {
      authToken = null;
      onUnauthorized();
    }

    throw new ApiError(data?.error || 'Erro na requisição', {
      status: response.status,
      details: data?.details,
    });
  }

  return data;
}
