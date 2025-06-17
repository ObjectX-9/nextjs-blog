import { request } from "@/utils/request";
import { IInspiration, PaginatedInspirations } from "../model/inspiration";

class Inspirations {
    async getInspirations(): Promise<PaginatedInspirations> {
        const response = await request.get<PaginatedInspirations>('inspirations');
        return response.data;
    }

    async getInspiration(id: string): Promise<IInspiration> {
        const response = await request.get<{ inspiration: IInspiration }>(`inspirations/${id}`);
        return response.data.inspiration;
    }

    async createInspiration(inspiration: IInspiration): Promise<IInspiration> {
        const response = await request.post<IInspiration>('inspirations', inspiration);
        return response.data;
    }

    async updateInspiration(id: string, inspiration: IInspiration): Promise<IInspiration> {
        const response = await request.put<IInspiration>(`inspirations?id=${id}`, inspiration);
        return response.data;
    }

    async deleteInspiration(id: string): Promise<IInspiration> {
        const response = await request.delete<IInspiration>(`inspirations?id=${id}`);
        return response.data;
    }

    async getInspirationCount(): Promise<number> {
        const response = await request.get<{ count: number }>('inspirations/count');
        return response.data.count;
    }

    async updateInspirationStats(id: string, action: "like" | "view"): Promise<IInspiration> {
        const response = await request.post<IInspiration>(`inspirations/${id}/stats`, { action });
        return response.data;
    }
}

export const inspirationsBusiness = new Inspirations();