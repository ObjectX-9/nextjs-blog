import { ISocialLink, ISocialLinkBase } from "@/app/model/social-link";
import { socialLinkDb } from "@/utils/db-instances";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { socialLinks: ISocialLink[] }>(async (request: Request) => {
  const socialLinks = await socialLinkDb.find({});
  return successResponse({ socialLinks: socialLinks });
});

export const POST = withErrorHandler<[Request], { socialLink: ISocialLink }>(async (request: Request) => {
  const data = await parseRequestBody<ISocialLinkBase>(request);

  RequestValidator.validateRequired(data, ['name', 'icon', 'url', 'bgColor']);

  const socialLink: ISocialLinkBase = {
    name: data.name,
    icon: data.icon,
    url: data.url,
    bgColor: data.bgColor,
  };

  const result = await socialLinkDb.insertOne(socialLink);

  return successResponse({ socialLink: result });
});

export const PUT = withErrorHandler<[Request], { socialLink: ISocialLink }>(async (request: Request) => {
  const data = await parseRequestBody<ISocialLink>(request);

  RequestValidator.validateRequired(data, ['_id', 'name', 'icon', 'url', 'bgColor']);

  const updateData = {
    ...(data.name && { name: data.name }),
    ...(data.icon && { icon: data.icon }),
    ...(data.url && { url: data.url }),
    ...(data.bgColor && { bgColor: data.bgColor }),
    updatedAt: new Date(),
  };

  const result = await socialLinkDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ socialLink: data });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Social link not found'));
});

export const DELETE = withErrorHandler<[Request], { socialLink: ISocialLink }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await socialLinkDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ socialLink: { _id: id } });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Social link not found'));
});
