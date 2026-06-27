import { create } from 'zustand';

const sessionStorageKey = "sharespace-session";

const getStoredSession = () => {
  try { return JSON.parse(window.localStorage.getItem(sessionStorageKey) || "null"); }
  catch { return null; }
};
const setStoredSession = (s) => window.localStorage.setItem(sessionStorageKey, JSON.stringify(s));
const clearStoredSession = () => window.localStorage.removeItem(sessionStorageKey);

const useAuthStore = create((set, get) => ({
  session: getStoredSession(),
  isDark: window.localStorage.getItem("sharespace-theme") === "dark",
  showLandingLoader: !getStoredSession() && !window.sessionStorage.getItem("sharespace-landing-loaded"),
  
  authenticate: (s) => {
    setStoredSession(s);
    set({ session: s });
  },
  updateSession: (s) => {
    setStoredSession(s);
    set({ session: s });
  },
  logout: () => {
    clearStoredSession();
    set({ session: null });
  },
  toggleDark: () => {
    const nextDark = !get().isDark;
    set({ isDark: nextDark });
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("theme-light");
      window.localStorage.setItem("sharespace-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("theme-light");
      window.localStorage.setItem("sharespace-theme", "light");
    }
  },
  completeLandingLoader: () => {
    window.sessionStorage.setItem("sharespace-landing-loaded", "true");
    set({ showLandingLoader: false });
  },
  initTheme: () => {
    const dark = get().isDark;
    if (dark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("theme-light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("theme-light");
    }
  }
}));

export default useAuthStore;
