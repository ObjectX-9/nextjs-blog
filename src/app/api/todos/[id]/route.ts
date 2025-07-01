import { ITodo } from "@/app/model/todo";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../../data";
import { todoDb } from "@/utils/db-instances";
import { parseRequestBody, RequestValidator } from "@/utils/api-helpers";

// 获取单个 Todo
export const GET = withErrorHandler<[Request, { params: { id: string } }], { todo: ITodo }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;

    const todo = await todoDb.findOne({ _id: id });

    if (!todo) {
      return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
    }

    // 如果有子任务，获取子任务详情
    if (todo.subTasks && todo.subTasks.length > 0) {
      const subTaskIds = todo.subTasks.map(sub => sub.taskId).filter(Boolean);
      if (subTaskIds.length > 0) {
        const subTasks = await todoDb.find({ _id: { $in: subTaskIds } });
        (todo as any).subTaskDetails = subTasks;
      }
    }

    return successResponse({ todo });
  }
);

// 更新单个 Todo
export const PUT = withErrorHandler<[Request, { params: { id: string } }], { todo: ITodo }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;
    const data = await parseRequestBody<ITodo>(request);

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

    const result = await todoDb.updateOne({ _id: id }, { $set: updateData });

    if (result.matchedCount > 0) {
      // 返回更新后的数据
      const updatedTodo = await todoDb.findOne({ _id: id });
      return successResponse({ todo: updatedTodo });
    }

    return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
  }
);

// 删除单个 Todo
export const DELETE = withErrorHandler<[Request, { params: { id: string } }], { message: string }>(
  async (request: Request, { params }: { params: { id: string } }) => {
    const id = params.id;

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
      return successResponse({ message: 'Todo deleted successfully' });
    }

    return errorResponse(ApiErrors.NOT_FOUND('Todo not found'));
  }
); 