import axios from 'axios';

const fallbackApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8080/api`;
const baseURL = (import.meta.env.VITE_API_URL || fallbackApiBaseUrl).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Response interceptor for handling common behaviors (e.g. 204 No Content)
apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return null;
    }
    return response.data;
  },
  (error) => {
    let msg = "An error occurred";
    if (error.response) {
      msg = error.response.data?.message || error.response.statusText || msg;
    } else if (error.request) {
      msg = "No response from server";
    } else {
      msg = error.message;
    }
    return Promise.reject(new Error(msg));
  }
);
