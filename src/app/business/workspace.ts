import { request } from "@/utils/request";
import { IWorkspaceItem } from "../model/workspace-item";

interface PaginatedWorkspaceResponse {
    items: IWorkspaceItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

interface PaginationParams {
    page?: number;
    limit?: number;
}

class WorkspaceBusiness {
    /**
     * 获取工作空间物品列表
     * @param params 分页参数，如果不传则获取所有数据
     */
    async getWorkspaceItems(params?: PaginationParams): Promise<IWorkspaceItem[] | PaginatedWorkspaceResponse> {
        if (params?.page && params?.limit) {
            // 分页查询
            const response = await request.get<PaginatedWorkspaceResponse>(
                `workspaces?page=${params.page}&limit=${params.limit}`
            );
            return response.data;
        } else {
            // 获取所有数据
            const response = await request.get<{ workspaceItems: IWorkspaceItem[] }>('workspaces');
            return response.data.workspaceItems;
        }
    }

    /**
     * 创建工作空间物品
     */
    async createWorkspaceItem(workspaceItem: Omit<IWorkspaceItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<IWorkspaceItem> {
        const response = await request.post<{ workspaceItem: IWorkspaceItem }>('workspaces', workspaceItem);
        return response.data.workspaceItem;
    }

    /**
     * 更新工作空间物品
     */
    async updateWorkspaceItem(workspaceItem: IWorkspaceItem): Promise<IWorkspaceItem> {
        const response = await request.put<{ workspaceItem: IWorkspaceItem }>('workspaces', workspaceItem);
        return response.data.workspaceItem;
    }

    /**
     * 删除工作空间物品
     */
    async deleteWorkspaceItem(id: string): Promise<any> {
        const response = await request.delete<{ workspaceItem: any }>(`workspaces?id=${id}`);
        return response.data.workspaceItem;
    }

    /**
     * 根据 ID 获取单个工作空间物品
     */
    async getWorkspaceItemById(id: string): Promise<IWorkspaceItem | null> {
        try {
            const allItems = await this.getWorkspaceItems() as IWorkspaceItem[];
            return allItems.find(item => item._id === id) || null;
        } catch (error) {
            console.error('Error fetching workspace item by ID:', error);
            return null;
        }
    }

    /**
     * 批量创建工作空间物品
     */
    async createWorkspaceItems(workspaceItems: Omit<IWorkspaceItem, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IWorkspaceItem[]> {
        const createdItems: IWorkspaceItem[] = [];

        for (const item of workspaceItems) {
            try {
                const createdItem = await this.createWorkspaceItem(item);
                createdItems.push(createdItem);
            } catch (error) {
                console.error('Error creating workspace item:', error);
                // 可以选择是否继续处理其他项目
            }
        }

        return createdItems;
    }

    /**
     * 搜索工作空间物品
     */
    async searchWorkspaceItems(keyword: string): Promise<IWorkspaceItem[]> {
        const allItems = await this.getWorkspaceItems() as IWorkspaceItem[];

        if (!keyword.trim()) {
            return allItems;
        }

        const lowerKeyword = keyword.toLowerCase();
        return allItems.filter(item =>
            item.product.toLowerCase().includes(lowerKeyword) ||
            item.specs.toLowerCase().includes(lowerKeyword) ||
            item.buyAddress.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * 根据产品类型过滤工作空间物品
     */
    async filterWorkspaceItemsByProduct(productName: string): Promise<IWorkspaceItem[]> {
        const allItems = await this.getWorkspaceItems() as IWorkspaceItem[];

        return allItems.filter(item =>
            item.product.toLowerCase().includes(productName.toLowerCase())
        );
    }
}

export const workspaceBusiness = new WorkspaceBusiness(); 