export interface PaginatedData<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}