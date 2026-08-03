import { api } from "./axios_service";

export const awsService = {
  getResources: async (services: string[]) => {
    const response = await api.post("/aws-api/resources", { services });
    return response.data;
  },
  getECSTasks: async (clusterName: string) => {
    const response = await api.get(`/aws-api/ecs/clusters/${encodeURIComponent(clusterName)}/tasks`);
    return response.data;
  },
};
