export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (access: string) => {
  localStorage.setItem('accessToken', access);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
};
