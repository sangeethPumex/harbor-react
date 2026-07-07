import { api } from "./axios_service";

export const userService = {
  list: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getByID: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  listRoles: async () => {
    const response = await api.get("/roles");
    return response.data;
  },
  patch: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
