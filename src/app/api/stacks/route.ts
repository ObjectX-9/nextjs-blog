import { IStack } from "@/app/model/stack";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { stackDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { stacks: IStack[] }>(async () => {
  const stacks = await stackDb.find({});
  return successResponse({ stacks });
});

// Create a new stack
export const POST = withErrorHandler<[Request], { stack: IStack }>(async (request: Request) => {
  const data = await parseRequestBody<IStack>(request);
  RequestValidator.validateRequired(data, ['title', 'description', 'link', 'iconSrc']);

  const stack = {
    title: data.title,
    description: data.description,
    link: data.link,
    iconSrc: data.iconSrc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await stackDb.insertOne(stack);

  return successResponse({ stack: result });
});

// Update a stack
export const PUT = withErrorHandler<[Request], { stack: IStack }>(async (request: Request) => {
  const data = await parseRequestBody<IStack>(request);
  RequestValidator.validateRequired(data, ['_id', 'title', 'description', 'link', 'iconSrc']);

  const updateData = {
    ...(data.title && { title: data.title }),
    ...(data.description && { description: data.description }),
    ...(data.link && { link: data.link }),
    ...(data.iconSrc && { iconSrc: data.iconSrc }),
    updatedAt: new Date(),
  };

  const result = await stackDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ stack: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Stack not found'));
});

export const DELETE = withErrorHandler<[Request], { stack: IStack }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await stackDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ stack: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Stack not found'));
});
