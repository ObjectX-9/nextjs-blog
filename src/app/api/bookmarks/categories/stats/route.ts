import {
    successResponse,
    withErrorHandler,
} from "@/app/api/data";
import { BookmarkCountByCategory } from "@/app/model/bookmark";
import { bookmarkCategoryDb } from "@/utils/db-instances";

// 获取收藏夹分类统计
export const GET = withErrorHandler<[], BookmarkCountByCategory[]>(async () => {
    // 使用聚合查询获取分类统计
    const pipeline = [
        {
            $lookup: {
                from: "bookmarks",
                let: { categoryId: { $toString: "$_id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$categoryId", "$$categoryId"]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                as: "bookmarkCount"
            }
        },
        {
            $project: {
                categoryId: { $toString: "$_id" },
                categoryName: "$name",
                count: {
                    $ifNull: [
                        { $arrayElemAt: ["$bookmarkCount.count", 0] },
                        0
                    ]
                },
                createdAt: { $ifNull: ["$createdAt", ""] },
                updatedAt: { $ifNull: ["$updatedAt", ""] }
            }
        },
        {
            $sort: { categoryName: 1 }
        }
    ];

    const stats = await bookmarkCategoryDb.aggregate<BookmarkCountByCategory>(pipeline);

    return successResponse<BookmarkCountByCategory[]>(stats, '获取收藏夹分类统计成功');
}); 