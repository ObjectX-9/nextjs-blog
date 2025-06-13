import { getDb } from "@/lib/mongodb";
import {
  ApiErrors,
  successResponse,
  withErrorHandler,
} from "@/app/api/data";
import { ArticleStatus } from "@/app/model/article";

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  count: number;
}

// 获取分类文章统计
export const GET = withErrorHandler<[], CategoryStats[]>(async () => {
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
        }
      }
    },
    {
      $sort: { order: 1, categoryName: 1 }
    }
  ];

  const stats = await db
    .collection("articleCategories")
    .aggregate<CategoryStats>(pipeline)
    .toArray();

  return successResponse<CategoryStats[]>(stats, '获取分类统计成功');
}); 