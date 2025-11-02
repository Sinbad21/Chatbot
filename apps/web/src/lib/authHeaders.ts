export function buildAuthHeaders(includeContentType: boolean = true): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
