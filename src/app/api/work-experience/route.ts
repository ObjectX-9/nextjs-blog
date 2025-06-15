import { IWorkExperience } from "@/app/model/work-experience";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../data";
import { workExperienceDb } from "@/utils/db-instances";
import { createApiParams, parseRequestBody, RequestValidator } from "@/utils/api-helpers";

export const GET = withErrorHandler<[Request], { workExperiences: IWorkExperience[] }>(async () => {
  const workExperiences = await workExperienceDb.find({}, { sort: { startDate: -1 } });
  return successResponse({ workExperiences });
});

export const POST = withErrorHandler<[Request], { workExperience: IWorkExperience }>(async (request: Request) => {
  const data = await parseRequestBody<IWorkExperience>(request);

  RequestValidator.validateRequired(data, ['company', 'position', 'description', 'startDate']);

  const workExperience: Omit<IWorkExperience, '_id'> = {
    company: data.company,
    companyUrl: data.companyUrl,
    position: data.position,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await workExperienceDb.insertOne(workExperience);

  return successResponse({ workExperience: result });

});

export const PUT = withErrorHandler<[Request], { workExperience: IWorkExperience }>(async (request: Request) => {
  const data = await parseRequestBody<IWorkExperience>(request);

  RequestValidator.validateRequired(data, ['_id', 'company', 'companyUrl', 'position', 'description', 'startDate']);

  const updateData: Partial<IWorkExperience> = {
    ...(data.company && { company: data.company }),
    ...(data.companyUrl && { companyUrl: data.companyUrl }),
    ...(data.position && { position: data.position }),
    ...(data.description && { description: data.description }),
    ...(data.startDate && { startDate: data.startDate }),
    ...(typeof data.endDate !== "undefined" && { endDate: data.endDate }),
    updatedAt: new Date().toISOString(),
  };

  const result = await workExperienceDb.updateOne({ _id: data._id }, { $set: updateData });

  if (result.matchedCount > 0) {
    return successResponse({ workExperience: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Work experience not found'));
});

export const DELETE = withErrorHandler<[Request], { workExperience: IWorkExperience }>(async (request: Request) => {
  const apiParams = createApiParams(request);
  const id = apiParams.getString("id");

  RequestValidator.validateRequired({ id }, ['id']);

  const result = await workExperienceDb.deleteOne({ _id: id });

  if (result.deletedCount > 0) {
    return successResponse({ workExperience: result });
  }

  return errorResponse(ApiErrors.NOT_FOUND('Work experience not found'));
});
