/**
 * Build authentication headers for API requests.
 * Note: With httpOnly cookies, the Authorization header is no longer needed
 * for browser requests. This function is kept for backward compatibility
 * with external API clients or mobile apps that might still use Bearer tokens.
 */
export function buildAuthHeaders(includeContentType: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Authenticated fetch wrapper that automatically includes credentials
 * for httpOnly cookie-based authentication.
 *
 * @param url - The URL to fetch
 * @param options - Standard fetch options (method, body, etc.)
 * @returns Promise<Response>
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;

  return fetch(fullUrl, {
    ...options,
    credentials: 'include', // Always include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Logout function that clears the httpOnly cookies via API call
 * and clears local storage user data.
 */
export async function logout(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  try {
    await fetch(`${apiUrl}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  // Clear local storage
  localStorage.removeItem('user');

  // Clear non-httpOnly cookies
  document.cookie = 'last_activity=; path=/; max-age=0';
  document.cookie = 'auth_session=; path=/; max-age=0';

  // Redirect to login
  window.location.href = '/auth/login';
}
