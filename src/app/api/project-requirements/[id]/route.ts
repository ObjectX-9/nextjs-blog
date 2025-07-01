import { IProjectRequirements } from "@/app/model/project-requirements";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../../data";
import { projectRequirementsDb } from "@/utils/db-instances";
import { parseRequestBody } from "@/utils/api-helpers";

// 获取单个项目需求
export const GET = withErrorHandler<[Request, { params: { id: string } }], { projectRequirement: IProjectRequirements }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;

    const projectRequirement = await projectRequirementsDb.findOne({ _id: id });

    if (!projectRequirement) {
      return errorResponse(ApiErrors.NOT_FOUND('Project requirement not found'));
    }

    return successResponse({ projectRequirement });
  }
);

// 更新单个项目需求
export const PUT = withErrorHandler<[Request, { params: { id: string } }], { projectRequirement: IProjectRequirements }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;
    const data = await parseRequestBody<IProjectRequirements>(request);

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

    const result = await projectRequirementsDb.updateOne({ _id: id }, { $set: updateData });

    if (result.matchedCount > 0) {
      // 返回更新后的数据
      const updatedProjectRequirement = await projectRequirementsDb.findOne({ _id: id });
      return successResponse({ projectRequirement: updatedProjectRequirement });
    }

    return errorResponse(ApiErrors.NOT_FOUND('Project requirement not found'));
  }
);

// 删除单个项目需求
export const DELETE = withErrorHandler<[Request, { params: { id: string } }], { message: string }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;

    const result = await projectRequirementsDb.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      return successResponse({ message: 'Project requirement deleted successfully' });
    }

    return errorResponse(ApiErrors.NOT_FOUND('Project requirement not found'));
  }
); 