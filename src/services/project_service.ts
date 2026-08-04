import { api } from "./axios_service";

interface CreateResourcePayload {
  aws_region: string;
  aws_service: string;
  aws_resource: string;
}

interface CreateEnvPayload {
  environment_name: string;
  branch_name: string;
  resources: CreateResourcePayload[];
}

interface CreateProjectPayload {
  project_name: string;
  project_description: string;
  team: string;
  project_type: string;
  tags: string[];
  members: string[];
  github_org: string;
  github_repo: string;
  branch: string;
  runtime: string;
  environments: CreateEnvPayload[];
}

export const projectService = {
  listPage: async (page: number, status: string) => {
    const response = await api.post("/composition/project-list-page", { page, status });
    return response.data;
  },
  getProjectDetails: async (id: string, page = 1, perPage = 10) => {
    const response = await api.post(`/composition/project-details/${id}`, { page, perPage });
    return response.data;
  },
  create: async (payload: CreateProjectPayload) => {
    const response = await api.post("/projects/create-project", payload);
    return response.data;
  },
  addEnvironment: async (id: string, payload: CreateEnvPayload) => {
    const response = await api.post(`/projects/${id}/add-environment`, payload);
    return response.data;
  },
  getEnvironmentDetails: async (id: string, envName: string) => {
    const response = await api.get(`/composition/project-environment-details/${id}/${envName}`);
    return response.data;
  },
  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};
