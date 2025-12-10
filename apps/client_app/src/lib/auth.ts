export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
