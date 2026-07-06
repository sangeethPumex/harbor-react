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
};
