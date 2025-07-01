import { ITodo, TodoStatus } from "@/app/model/todo";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { todoDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { todos: ITodo[] }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const projectId = apiParams.getString("projectId");
  const status = apiParams.getString("status");
  const includeSubTasks = apiParams.getString("includeSubTasks") === "true";

  let filter: any = {};

  // 根据项目ID筛选
  if (projectId) {
    filter.projectId = projectId;
  }

  // 根据状态筛选
  if (status && Object.values(TodoStatus).includes(status as TodoStatus)) {
    filter.status = status;
  }

  const todos = await todoDb.find(filter, { sort: { createdAt: -1 } });

  // 如果需要包含子任务详情，获取所有子任务数据
  if (includeSubTasks) {
    const allSubTaskIds = todos
      .filter(todo => todo.subTasks && todo.subTasks.length > 0)
      .flatMap(todo => todo.subTasks!.map(sub => sub.taskId))
      .filter(Boolean);

    if (allSubTaskIds.length > 0) {
      const subTasks = await todoDb.find({ _id: { $in: allSubTaskIds } });
      const subTaskMap = new Map(subTasks.map(task => [task._id, task]));

      // 将子任务详情附加到父任务上
      todos.forEach(todo => {
        if (todo.subTasks && todo.subTasks.length > 0) {
          (todo as any).subTaskDetails = todo.subTasks
            .map(sub => subTaskMap.get(sub.taskId))
            .filter(Boolean);
        }
      });
    }
  }

  return successResponse({ todos });
});

export const POST = withErrorHandler<[Request], { todo: ITodo }>(async (request: Request) => {
  const data = await parseRequestBody<ITodo>(request);
  RequestValidator.validateRequired(data, ['title', 'description', 'projectId', 'status']);

  const todo: ITodo = {
    title: data.title,
    description: data.description,
    status: data.status,
    projectId: data.projectId,
    priority: data.priority || 3,
    color: data.color || '#3B82F6',
    ...(data.startDate && { startDate: new Date(data.startDate) }),
    ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
    ...(data.subTasks && { subTasks: data.subTasks }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await todoDb.insertOne(todo);

  return successResponse({ todo: result });
});

export const PUT = withErrorHandler<[Request], { todo: ITodo }>(async (request: Request) => {
  const data = await parseRequestBody<ITodo>(request);
  RequestValidator.validateRequired(data, ['_id']);

  const updateData: any = {
    updatedAt: new Date(),
  };

  // 只更新提供的字段
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.status) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.color) updateData.color = data.color;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.subTasks !== undefined) updateData.subTasks = data.subTasks;

  const result = await todoDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ todo: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
});

export const DELETE = withErrorHandler<[Request], { todo: ITodo }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  // 先查找要删除的任务
  const todo = await todoDb.findOne({ _id: id });
  if (!todo) {
    return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
  }

  // 如果有子任务，删除所有子任务
  if (todo.subTasks && todo.subTasks.length > 0) {
    const subTaskIds = todo.subTasks.map(sub => sub.taskId).filter(Boolean);

    if (subTaskIds.length > 0) {
      await todoDb.deleteMany({ _id: { $in: subTaskIds } });
    }
  }

  // 删除主任务
  const result = await todoDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ todo: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
}); 