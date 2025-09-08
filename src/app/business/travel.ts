import { request } from "@/utils/request";
import { ITravelRecord } from "../model/travel";

interface TravelRecordResponse {
    records: ITravelRecord[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class TravelBusiness {
    async getTravelRecords(params?: { page?: number; limit?: number }): Promise<ITravelRecord[]> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `travel?${query}` : 'travel';

        const response = await request.get<TravelRecordResponse>(url);
        return response.data.records;
    }

    async getTravelRecordsWithPagination(params?: { page?: number; limit?: number }): Promise<TravelRecordResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `travel?${query}` : 'travel';

        const response = await request.get<TravelRecordResponse>(url);
        return response.data;
    }

    async getTravelRecord(id: string): Promise<ITravelRecord> {
        const response = await request.get<{ record: ITravelRecord }>(`travel/${id}`);
        return response.data.record;
    }

    async createTravelRecord(record: Omit<ITravelRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITravelRecord> {
        const response = await request.post<{ record: ITravelRecord }>('travel', record);
        return response.data.record;
    }

    async createTravelRecords(records: Omit<ITravelRecord, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{ insertedCount: number }> {
        const response = await request.post<{ insertedCount: number }>('travel', { records });
        return response.data;
    }

    async updateTravelRecord(record: ITravelRecord): Promise<ITravelRecord> {
        const response = await request.put<{ record: ITravelRecord }>('travel', record);
        return response.data.record;
    }

    async deleteTravelRecord(id: string): Promise<ITravelRecord> {
        const response = await request.delete<{ record: ITravelRecord }>(`travel?id=${id}`);
        return response.data.record;
    }
}

export const travelBusiness = new TravelBusiness(); 