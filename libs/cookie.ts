export const setCookie = (name: string, value: string) => {
  const expires = new Date(Date.now() + 3 * 864e5).toUTCString();

  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }
};

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? match.split("=")[1] : undefined;
};

export const clearCookie = (name: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }
};