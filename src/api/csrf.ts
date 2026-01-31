import api from "./axios";

let csrfToken = null;

export const getCsrfToken = () => csrfToken;

export const initCsrf = async () => {
  const res = await api.get("/csrf");
  csrfToken = res.data?.csrfToken || res.data?.token || null;
  return csrfToken;
};

export const clearCsrf = () => {
  csrfToken = null;
};
