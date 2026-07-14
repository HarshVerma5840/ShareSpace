import { apiClient } from "../api/client";

export const apiBaseUrl = apiClient.defaults.baseURL;

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers, ...restOptions } = options;

  let requestHeaders = { ...headers };
  if (requestHeaders["Content-Type"] === "multipart/form-data") {
      delete requestHeaders["Content-Type"];
  }

  const config = {
    method,
    url: path,
    headers: requestHeaders,
    data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
    ...restOptions
  };

  return await apiClient(config);
}
