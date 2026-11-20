import axios from 'axios';

const AUTH_STORAGE_KEY = 'teachspace_session_token';
let csrfTokenCache = null;
let authTokenCache = null;

try {
  authTokenCache = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
} catch {
  authTokenCache = null;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
});

export function setCsrfToken(token) {
  csrfTokenCache = token;
}

export function setAuthToken(token) {
  authTokenCache = token;
  try {
    if (token) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors
  }
}

export function getAuthToken() {
  if (authTokenCache) return authTokenCache;
  try {
    authTokenCache = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    authTokenCache = null;
  }
  return authTokenCache;
}

export async function ensureCsrfToken() {
  if (csrfTokenCache) return csrfTokenCache;
  const { data } = await api.get('/auth/csrf');
  csrfTokenCache = data.csrfToken;
  return csrfTokenCache;
}

api.interceptors.request.use(async (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = (config.method || 'get').toLowerCase();
  const isMutation = ['post', 'put', 'patch', 'delete'].includes(method);
  const url = config.url || '';
  const isPublicAuth =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password');

  if (isMutation && !isPublicAuth) {
    const csrf = await ensureCsrfToken();
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) {
      csrfTokenCache = response.data.csrfToken;
    }
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 403 && !original?._retriedCsrf) {
      original._retriedCsrf = true;
      csrfTokenCache = null;
      const fresh = await ensureCsrfToken();
      original.headers['X-CSRF-Token'] = fresh;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export async function downloadFile(url, fallbackFilename) {
  const response = await api.get(url, { responseType: 'blob' });
  const disposition = String(response.headers['content-disposition'] || '');
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  const filename = utfMatch?.[1] ? decodeURIComponent(utfMatch[1]) : asciiMatch?.[1] || fallbackFilename;

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function getErrorMessage(err, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
