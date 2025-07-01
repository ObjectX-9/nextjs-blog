import { ITodo } from "@/app/model/todo";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../../../data";
import { todoDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

// 获取指定任务的所有子任务
export const GET = withErrorHandler<[Request, { params: { id: string } }], { subTasks: ITodo[] }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const parentId = params.id;

    // 先查找父任务
    const parentTodo = await todoDb.findOne({ _id: parentId });
    if (!parentTodo) {
      return errorResponse(ApiErrors.NOT_FOUND('Parent todo not found'));
    }

    // 获取子任务列表
    if (!parentTodo.subTasks || parentTodo.subTasks.length === 0) {
      return successResponse({ subTasks: [] });
    }

    const subTaskIds = parentTodo.subTasks.map(sub => sub.taskId).filter(Boolean);
    const subTasks = await todoDb.find({ _id: { $in: subTaskIds } }, { sort: { createdAt: -1 } });

    return successResponse({ subTasks });
  }
);

// 为指定任务添加子任务
export const POST = withErrorHandler<[Request, { params: { id: string } }], { subTask: ITodo }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const parentId = params.id;
    const data = await parseRequestBody<ITodo>(request);

    RequestValidator.validateRequired(data, ['title', 'description', 'status']);

    // 先查找父任务
    const parentTodo = await todoDb.findOne({ _id: parentId });
    if (!parentTodo) {
      return errorResponse(ApiErrors.NOT_FOUND('Parent todo not found'));
    }

    // 创建子任务，继承父任务的项目ID
    const subTask: ITodo = {
      title: data.title,
      description: data.description,
      status: data.status,
      projectId: parentTodo.projectId, // 继承父任务的项目ID
      priority: data.priority || 3,
      color: data.color || parentTodo.color || '#3B82F6',
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 插入子任务
    const createdSubTask = await todoDb.insertOne(subTask);

    // 更新父任务的 subTasks 数组
    const updatedSubTasks = [
      ...(parentTodo.subTasks || []),
      { taskId: createdSubTask._id }
    ];

    await todoDb.updateOne(
      { _id: parentId },
      {
        $set: {
          subTasks: updatedSubTasks,
          updatedAt: new Date()
        }
      }
    );

    return successResponse({ subTask: createdSubTask });
  }
);

// 从指定任务中移除子任务
export const DELETE = withErrorHandler<[Request, { params: { id: string } }], { message: string }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const parentId = params.id;
    const apiParams = createApiParams(request);
    const subTaskId = apiParams.getString("subTaskId");

    RequestValidator.validateRequired({ subTaskId }, ['subTaskId']);

    // 先查找父任务
    const parentTodo = await todoDb.findOne({ _id: parentId });
    if (!parentTodo) {
      return errorResponse(ApiErrors.NOT_FOUND('Parent todo not found'));
    }

    // 检查子任务是否存在
    const subTask = await todoDb.findOne({ _id: subTaskId });
    if (!subTask) {
      return errorResponse(ApiErrors.NOT_FOUND('Sub task not found'));
    }

    // 从父任务的 subTasks 数组中移除
    const updatedSubTasks = (parentTodo.subTasks || []).filter(
      sub => sub.taskId !== subTaskId
    );

    await todoDb.updateOne(
      { _id: parentId },
      {
        $set: {
          subTasks: updatedSubTasks,
          updatedAt: new Date()
        }
      }
    );

    // 删除子任务
    await todoDb.deleteOne({ _id: subTaskId });

    return successResponse({ message: 'Sub task removed successfully' });
  }
); 