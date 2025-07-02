import { request } from "@/utils/request";
import { IProjectRequirements, ProjectRequirementsStatus, ProjectRequirementsType, ProjectRequirementsDifficultyLevel } from "../model/types/project-requirements";

interface GetProjectRequirementsParams {
  type?: ProjectRequirementsType;
  status?: ProjectRequirementsStatus;
  difficultyLevel?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

interface ProjectRequirementsStats {
  total: number;
  byStatus: Record<ProjectRequirementsStatus, number>;
  byType: Record<ProjectRequirementsType, number>;
  byDifficultyLevel: Record<number, number>;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

class ProjectRequirementsBusiness {
  /**
   * 获取项目需求列表
   */
  async getProjectRequirements(params?: GetProjectRequirementsParams): Promise<IProjectRequirements[]> {
    const queryParams: Record<string, string> = {};

    if (params?.type) {
      queryParams.type = params.type;
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    if (params?.difficultyLevel) {
      queryParams.difficultyLevel = params.difficultyLevel.toString();
    }

    const response = await request.get<{ projectRequirements: IProjectRequirements[] }>('project-requirements', queryParams);

    let projectRequirements = response.data.projectRequirements;

    // 客户端过滤（API 不支持的复杂筛选）
    if (params?.dateRange) {
      projectRequirements = projectRequirements.filter(req => {
        if (!req.startDate) return false;
        const startDate = new Date(req.startDate);
        const { start, end } = params.dateRange!;

        if (start && startDate < start) return false;
        if (end && startDate > end) return false;
        return true;
      });
    }

    return projectRequirements;
  }

  /**
   * 获取单个项目需求
   */
  async getProjectRequirement(id: string): Promise<IProjectRequirements> {
    const response = await request.get<{ projectRequirement: IProjectRequirements }>(`project-requirements/${id}`);
    return response.data.projectRequirement;
  }

  /**
   * 创建新项目需求
   */
  async createProjectRequirement(projectRequirement: Omit<IProjectRequirements, '_id' | 'createdAt' | 'updatedAt'>): Promise<IProjectRequirements> {
    const response = await request.post<{ projectRequirement: IProjectRequirements }>('project-requirements', projectRequirement);
    return response.data.projectRequirement;
  }

  /**
   * 更新项目需求
   */
  async updateProjectRequirement(id: string, projectRequirement: Partial<IProjectRequirements>): Promise<IProjectRequirements> {
    const response = await request.put<{ projectRequirement: IProjectRequirements }>(`project-requirements/${id}`, { _id: id, ...projectRequirement });
    return response.data.projectRequirement;
  }

  /**
   * 删除项目需求
   */
  async deleteProjectRequirement(id: string): Promise<void> {
    await request.delete<{ message: string }>(`project-requirements/${id}`);
  }

  /**
   * 搜索项目需求
   */
  async searchProjectRequirements(keyword: string, type?: ProjectRequirementsType): Promise<IProjectRequirements[]> {
    const params: GetProjectRequirementsParams = {};
    if (type) {
      params.type = type;
    }

    const allRequirements = await this.getProjectRequirements(params);

    if (!keyword.trim()) {
      return allRequirements;
    }

    const lowerKeyword = keyword.toLowerCase();
    return allRequirements.filter(req =>
      req.title.toLowerCase().includes(lowerKeyword) ||
      req.description.toLowerCase().includes(lowerKeyword) ||
      (req.difficulty && req.difficulty.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * 获取项目需求统计信息
   */
  async getProjectRequirementsStats(type?: ProjectRequirementsType): Promise<ProjectRequirementsStats> {
    const params: GetProjectRequirementsParams = {};
    if (type) {
      params.type = type;
    }

    const requirements = await this.getProjectRequirements(params);

    const stats: ProjectRequirementsStats = {
      total: requirements.length,
      byStatus: {
        [ProjectRequirementsStatus.TODO]: 0,
        [ProjectRequirementsStatus.IN_PROGRESS]: 0,
        [ProjectRequirementsStatus.COMPLETED]: 0,
        [ProjectRequirementsStatus.DELAYED]: 0,
        [ProjectRequirementsStatus.CANCELLED]: 0,
        [ProjectRequirementsStatus.DELETED]: 0,
        [ProjectRequirementsStatus.ARCHIVED]: 0,
      },
      byType: {
        [ProjectRequirementsType.work]: 0,
        [ProjectRequirementsType.personal]: 0,
      },
      byDifficultyLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      inProgress: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0,
    };

    const now = new Date();

    requirements.forEach(req => {
      // 状态统计
      stats.byStatus[req.status]++;

      // 类型统计
      stats.byType[req.type]++;

      // 难度级别统计
      const difficultyLevel = req.difficultyLevel || 2;
      stats.byDifficultyLevel[difficultyLevel]++;

      // 逾期统计
      if (req.endDate) {
        const endDate = new Date(req.endDate);
        if (endDate < now && req.status !== ProjectRequirementsStatus.COMPLETED && req.status !== ProjectRequirementsStatus.CANCELLED) {
          stats.overdue++;
        }
      }
    });

    stats.inProgress = stats.byStatus[ProjectRequirementsStatus.IN_PROGRESS];
    stats.completed = stats.byStatus[ProjectRequirementsStatus.COMPLETED];
    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }

  /**
   * 快速创建项目需求
   */
  async quickCreateProjectRequirement(title: string, description: string, type: ProjectRequirementsType): Promise<IProjectRequirements> {
    return this.createProjectRequirement({
      title,
      description,
      status: ProjectRequirementsStatus.TODO,
      type,
      difficultyLevel: 2,
      color: '#3B82F6',
    });
  }

  /**
   * 标记项目需求为完成
   */
  async completeProjectRequirement(id: string): Promise<IProjectRequirements> {
    return this.updateProjectRequirement(id, { status: ProjectRequirementsStatus.COMPLETED });
  }

  /**
   * 开始项目需求
   */
  async startProjectRequirement(id: string): Promise<IProjectRequirements> {
    return this.updateProjectRequirement(id, { status: ProjectRequirementsStatus.IN_PROGRESS });
  }
}

export const projectRequirementsBusiness = new ProjectRequirementsBusiness(); 