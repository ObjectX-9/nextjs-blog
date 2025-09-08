import { request } from "@/utils/request";
import { IFitnessRecord } from "../model/fitness";

interface FitnessRecordResponse {
    records: IFitnessRecord[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

class FitnessBusiness {
    async getFitnessRecords(params?: { page?: number; limit?: number }): Promise<IFitnessRecord[]> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `fitness?${query}` : 'fitness';

        const response = await request.get<FitnessRecordResponse>(url);
        return response.data.records;
    }

    async getFitnessRecordsWithPagination(params?: { page?: number; limit?: number }): Promise<FitnessRecordResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const url = query ? `fitness?${query}` : 'fitness';

        const response = await request.get<FitnessRecordResponse>(url);
        return response.data;
    }

    async getFitnessRecord(id: string): Promise<IFitnessRecord> {
        const response = await request.get<{ record: IFitnessRecord }>(`fitness/${id}`);
        return response.data.record;
    }

    async createFitnessRecord(record: Omit<IFitnessRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<IFitnessRecord> {
        const response = await request.post<{ record: IFitnessRecord }>('fitness', record);
        return response.data.record;
    }

    async createFitnessRecords(records: Omit<IFitnessRecord, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<{ insertedCount: number }> {
        const response = await request.post<{ insertedCount: number }>('fitness', { records });
        return response.data;
    }

    async updateFitnessRecord(record: IFitnessRecord): Promise<IFitnessRecord> {
        const response = await request.put<{ record: IFitnessRecord }>('fitness', record);
        return response.data.record;
    }

    async deleteFitnessRecord(id: string): Promise<IFitnessRecord> {
        const response = await request.delete<{ record: IFitnessRecord }>(`fitness?id=${id}`);
        return response.data.record;
    }
}

export const fitnessBusiness = new FitnessBusiness(); 