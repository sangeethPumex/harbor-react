import { api } from "./axios_service";

export const awsService = {
  getResources: async (services: string[]) => {
    const response = await api.post("/aws-api/resources", { services });
    return response.data;
  },
};
