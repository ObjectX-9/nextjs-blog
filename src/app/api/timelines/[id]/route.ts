import { ITimelineEvent } from "@/app/model/timeline";
import { ApiErrors, errorResponse, successResponse, withErrorHandler } from "../../data";
import { timelineDb } from "@/utils/db-instances";
import { createApiParams, RequestValidator } from "@/utils/api-helpers";
import { verifyAdmin } from "@/utils/auth";

export const GET = withErrorHandler<[Request, { params: { id: string } }], { event: ITimelineEvent }>(
    async (request: Request, { params }: { params: { id: string } }) => {
        const { id } = params;
        RequestValidator.validateRequired({ id }, ['id']);

        const event = await timelineDb.findOne({ _id: id });

        if (!event) {
            return errorResponse(ApiErrors.NOT_FOUND('时间轴事件未找到'));
        }

        // 检查权限：如果事件仅管理员可见，需要验证管理员身份
        if (event.isAdminOnly) {
            const isAdmin = await verifyAdmin();
            if (!isAdmin) {
                return errorResponse(ApiErrors.NOT_FOUND('时间轴事件未找到'));
            }
        }

        return successResponse({ event });
    }
); 