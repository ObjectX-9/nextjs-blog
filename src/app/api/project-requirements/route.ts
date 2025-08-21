import { IProjectRequirements, ProjectRequirementsStatus, ProjectRequirementsType } from "@/app/model/project-requirements";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { projectRequirementsDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { projectRequirements: IProjectRequirements[] }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const type = apiParams.getString("type");
  const status = apiParams.getString("status");
  const difficultyLevel = apiParams.getNumber("difficultyLevel");

  let filter: any = {};

  // 根据类型筛选
  if (type && Object.values(ProjectRequirementsType).includes(type as ProjectRequirementsType)) {
    filter.type = type;
  }

  // 根据状态筛选
  if (status && Object.values(ProjectRequirementsStatus).includes(status as ProjectRequirementsStatus)) {
    filter.status = status;
  }

  // 根据难度级别筛选
  if (difficultyLevel) {
    filter.difficultyLevel = difficultyLevel;
  }

  const projectRequirements = await projectRequirementsDb.find(filter, { sort: { createdAt: -1 } });

  return successResponse({ projectRequirements });
});

export const POST = withErrorHandler<[Request], { projectRequirement: IProjectRequirements }>(async (request: Request) => {
  const data = await parseRequestBody<IProjectRequirements>(request);
  RequestValidator.validateRequired(data, ['title', 'description', 'status', 'type']);

  const projectRequirement: IProjectRequirements = {
    title: data.title,
    description: data.description,
    status: data.status,
    type: data.type,
    difficultyLevel: data.difficultyLevel || 2,
    color: data.color || '#3B82F6',
    ...(data.startDate && { startDate: new Date(data.startDate) }),
    ...(data.endDate && { endDate: new Date(data.endDate) }),
    ...(data.techStack && { techStack: data.techStack }),
    ...(data.todos && { todos: data.todos }),
    ...(data.difficulty && { difficulty: data.difficulty }),
    ...(data.techSolutionOssPath && { techSolutionOssPath: data.techSolutionOssPath }),
    ...(data.reflectionOssPath && { reflectionOssPath: data.reflectionOssPath }),
    ...(data.relatedDocs && { relatedDocs: data.relatedDocs }),
    ...(data.relatedGithubRepos && { relatedGithubRepos: data.relatedGithubRepos }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await projectRequirementsDb.insertOne(projectRequirement);

  return successResponse({ projectRequirement: result });
});

export const PUT = withErrorHandler<[Request], { projectRequirement: IProjectRequirements }>(async (request: Request) => {
  const data = await parseRequestBody<IProjectRequirements>(request);
  RequestValidator.validateRequired(data, ['_id']);

  const updateData: any = {
    updatedAt: new Date(),
  };

  // 只更新提供的字段
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.status) updateData.status = data.status;
  if (data.type) updateData.type = data.type;
  if (data.difficultyLevel !== undefined) updateData.difficultyLevel = data.difficultyLevel;
  if (data.color) updateData.color = data.color;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.techStack !== undefined) updateData.techStack = data.techStack;
  if (data.todos !== undefined) updateData.todos = data.todos;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.techSolutionOssPath !== undefined) updateData.techSolutionOssPath = data.techSolutionOssPath;
  if (data.reflectionOssPath !== undefined) updateData.reflectionOssPath = data.reflectionOssPath;
  if (data.relatedDocs !== undefined) updateData.relatedDocs = data.relatedDocs;
  if (data.relatedGithubRepos !== undefined) updateData.relatedGithubRepos = data.relatedGithubRepos;

  const result = await projectRequirementsDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ projectRequirement: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Project requirement not found'));
});

export const DELETE = withErrorHandler<[Request], { projectRequirement: IProjectRequirements }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await projectRequirementsDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ projectRequirement: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Project requirement not found'));
}); 