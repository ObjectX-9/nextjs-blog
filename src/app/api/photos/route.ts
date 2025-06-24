import { IPhoto } from "@/app/model/photo";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { photoDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { photos: IPhoto[] }>(async () => {
  const photos = await photoDb.find({}, { sort: { date: -1 } });
  return successResponse({ photos });
});

export const POST = withErrorHandler<[Request], { photo: IPhoto }>(async (request: Request) => {
  const data = await parseRequestBody<IPhoto>(request);
  RequestValidator.validateRequired(data, ['src', 'width', 'height', 'title', 'location', 'date']);

  const photo = {
    src: data.src,
    width: data.width,
    height: data.height,
    title: data.title,
    location: data.location,
    date: data.date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await photoDb.insertOne(photo);

  return successResponse({ photo: result });
});

export const PUT = withErrorHandler<[Request], { photo: IPhoto }>(async (request: Request) => {
  const data = await parseRequestBody<IPhoto>(request);
  RequestValidator.validateRequired(data, ['_id', 'src', 'width', 'height', 'title', 'location', 'date']);

  const updateData = {
    ...(data.src && { src: data.src }),
    ...(data.width && { width: data.width }),
    ...(data.height && { height: data.height }),
    ...(data.title && { title: data.title }),
    ...(data.location && { location: data.location }),
    ...(data.date && { date: data.date }),
    updatedAt: new Date().toISOString(),
  };

  const result = await photoDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ photo: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Photo not found'));
});

export const DELETE = withErrorHandler<[Request], { photo: IPhoto }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await photoDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ photo: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Photo not found'));
});
