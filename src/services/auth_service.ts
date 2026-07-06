import { api } from "./axios_service";

export const authService = {
  login: async (payload: { email: string; pin?: string; password?: string }) => {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },
  register: async (payload: {
    name: string;
    email: string;
    role_id: string;
    github_username?: string;
    requires_github_access: boolean;
  }) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },
  setupPassword: async (payload: { token: string; password: string; pin: string }) => {
    const response = await api.post("/auth/setup-password", payload);
    return response.data;
  },
};
