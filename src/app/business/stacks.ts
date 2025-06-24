import { request } from "@/utils/request";
import { IStack } from "../model/stack";

class StacksBusiness {
    async getStacks(): Promise<IStack[]> {
        const response = await request.get<{ stacks: IStack[] }>('stacks');
        return response.data.stacks;
    }

    async createStack(stack: Omit<IStack, '_id'>): Promise<IStack> {
        const response = await request.post<{ stack: IStack }>('stacks', stack);
        return response.data.stack;
    }

    async updateStack(stack: IStack): Promise<IStack> {
        const response = await request.put<{ stack: IStack }>('stacks', stack);
        return response.data.stack;
    }

    async deleteStack(id: string): Promise<IStack> {
        const response = await request.delete<{ stack: IStack }>(`stacks?id=${id}`);
        return response.data.stack;
    }
}

export const stacksBusiness = new StacksBusiness();