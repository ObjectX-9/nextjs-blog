import { request } from "@/utils/request";
import { ITimelineEvent } from "../model/timeline";

interface TimelineResponse {
    events: ITimelineEvent[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class TimelinesBusiness {
    async getTimelineEvents(params?: { page?: number; limit?: number }): Promise<ITimelineEvent[]> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `timelines?${query}` : 'timelines';

        const response = await request.get<TimelineResponse>(url);
        return response.data.events;
    }

    async getTimelineEventsWithPagination(params?: { page?: number; limit?: number }): Promise<TimelineResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `timelines?${query}` : 'timelines';

        const response = await request.get<TimelineResponse>(url);
        return response.data;
    }

    async getTimelineEvent(id: string): Promise<ITimelineEvent> {
        const response = await request.get<{ event: ITimelineEvent }>(`timelines/${id}`);
        return response.data.event;
    }

    async createTimelineEvent(event: Omit<ITimelineEvent, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITimelineEvent> {
        const response = await request.post<{ event: ITimelineEvent }>('timelines', event);
        return response.data.event;
    }

    async createTimelineEvents(events: Omit<ITimelineEvent, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{ insertedCount: number }> {
        const response = await request.post<{ insertedCount: number }>('timelines', { events });
        return response.data;
    }

    async updateTimelineEvent(event: ITimelineEvent): Promise<ITimelineEvent> {
        const response = await request.put<{ event: ITimelineEvent }>('timelines', event);
        return response.data.event;
    }

    async deleteTimelineEvent(id: string): Promise<ITimelineEvent> {
        const response = await request.delete<{ event: ITimelineEvent }>(`timelines?id=${id}`);
        return response.data.event;
    }
}

export const timelinesBusiness = new TimelinesBusiness(); 