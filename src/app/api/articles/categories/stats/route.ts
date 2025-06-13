import { getDb } from "@/lib/mongodb";
import {
  successResponse,
  withErrorHandler,
} from "@/app/api/data";
import { ArticleCountByCategory, ArticleStatus } from "@/app/model/article";

// 获取分类文章统计
export const GET = withErrorHandler<[], ArticleCountByCategory[]>(async () => {
  const db = await getDb();

  // 使用聚合查询获取分类统计
  const pipeline = [
    {
      $lookup: {
        from: "articles",
        let: { categoryId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$categoryId", "$$categoryId"] },
                  { $eq: ["$status", ArticleStatus.PUBLISHED] }
                ]
              }
            }
          },
          {
            $count: "count"
          }
        ],
        as: "articleCount"
      }
    },
    {
      $project: {
        categoryId: { $toString: "$_id" },
        categoryName: "$name",
        count: {
          $ifNull: [
            { $arrayElemAt: ["$articleCount.count", 0] },
            0
          ]
        },
        order: { $ifNull: ["$order", 0] },
        status: { $ifNull: ["$status", "in_progress"] },
        createdAt: { $ifNull: ["$createdAt", ""] },
        updatedAt: { $ifNull: ["$updatedAt", ""] },
        description: { $ifNull: ["$description", ""] },
        isTop: { $ifNull: ["$isTop", false] }
      }
    },
    {
      $sort: { order: 1, categoryName: 1 }
    }
  ];

  const stats = await db
    .collection("articleCategories")
    .aggregate<ArticleCountByCategory>(pipeline)
    .toArray();

  return successResponse<ArticleCountByCategory[]>(stats, '获取分类统计成功');
}); 