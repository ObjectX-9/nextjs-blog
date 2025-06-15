import { request } from "@/utils/request";
import { IStack } from "../model/stack";

class StacksBusiness {
    async getStacks(): Promise<IStack[]> {
        const response = await request.get<{ stacks: IStack[] }>('stacks');
        return response.data.stacks;
    }

    async createStack(stack: IStack): Promise<IStack> {
        const response = await request.post<IStack>('stacks', stack);
        return response.data;
    }

    async updateStack(stack: IStack): Promise<IStack> {
        const response = await request.put<IStack>('stacks', stack);
        return response.data;
    }

    async deleteStack(id: string): Promise<IStack> {
        const response = await request.delete<IStack>(`stacks?id=${id}`);
        return response.data;
    }
}

export const stacksBusiness = new StacksBusiness();