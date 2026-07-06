import { api } from "./axios_service";

interface CreateResourcePayload {
  aws_region: string;
  aws_service: string;
  aws_resource: string;
}

interface CreateEnvPayload {
  environment_name: string;
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
  create: async (payload: CreateProjectPayload) => {
    const response = await api.post("/projects/create-project", payload);
    return response.data;
  },
};
