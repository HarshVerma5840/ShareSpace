const fallbackApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8080/api`;
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = null; // Update this later to use Zustand store for token if needed. Currently backend uses raw sessions or simple auth.
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let msg = "An error occurred";
    try {
      const data = await response.json();
      msg = data.message || msg;
    } catch (e) {
      msg = response.statusText || msg;
    }
    throw new Error(msg);
  }

  // Handle empty responses
  if (response.status === 204) return null;
  
  try {
      return await response.json();
  } catch(e) {
      return null;
  }
}
