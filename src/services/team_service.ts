import { api } from "./axios_service";

export const teamService = {
  list: async () => {
    const response = await api.get("/teams/get-all-teams");
    return response.data;
  },
};
