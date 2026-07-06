import { api } from "./axios_service";

export const githubService = {
  getOrgs: async () => {
    const response = await api.get("/github/orgs");
    return response.data;
  },
  getRepos: async (org?: string) => {
    const response = await api.get("/github/repos", { params: org ? { org } : {} });
    return response.data;
  },
  getBranches: async (owner: string, repo: string) => {
    const response = await api.get("/github/branches", { params: { owner, repo } });
    return response.data;
  },
};
