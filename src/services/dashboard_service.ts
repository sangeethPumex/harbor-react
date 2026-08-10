import { api } from "./axios_service";

export interface DashboardKPI {
  total_environments: number;
  healthy_environments: number;
  unhealthy_environments: number;
  deployments_past_hour: number;
  deployments_past_24_hours: number;
  deployment_frequency_weekly_average: number;
}

export interface DashboardActivityItem {
  type: string;
  title: string;
  description: string;
  project: string;
  author: string;
  timestamp: string;
}

export interface ProjectDeploymentGraphItem {
  project_name: string;
  data: Record<string, number>;
}

export const dashboardService = {
  getKPI: async (): Promise<DashboardKPI> => {
    const response = await api.get("/composition/dashboard-kpi");
    return response.data;
  },
  getRecentActivities: async (): Promise<DashboardActivityItem[]> => {
    const response = await api.get("/composition/dashboard-recent-activities");
    return response.data;
  },
  getDeploymentsGraph: async (): Promise<ProjectDeploymentGraphItem[]> => {
    const response = await api.get("/composition/dashboard-project-deployments-graph");
    return response.data;
  },
};
