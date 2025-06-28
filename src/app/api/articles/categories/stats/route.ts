import {
  successResponse,
  withErrorHandler,
} from "@/app/api/data";
import { ArticleCountByCategory, ArticleStatus } from "@/app/model/article";
import { createDbHelper } from "@/utils/db-helpers";
import { verifyAdmin } from "@/utils/auth";

const articleCategoryDb = createDbHelper<ArticleCountByCategory>("articleCategories");

// 获取分类文章统计
export const GET = withErrorHandler<[], ArticleCountByCategory[]>(async () => {

  // 验证是否为管理员
  const isAdmin = await verifyAdmin();

  // 构建基础过滤条件
  const baseMatch: any = {};

  // 如果不是管理员，则过滤掉被标记为管理员专属的分类
  if (!isAdmin) {
    baseMatch.$or = [
      { isAdminOnly: { $ne: true } },
      { isAdminOnly: { $exists: false } }
    ];
  }

  // 使用聚合查询获取分类统计
  const pipeline = [
    // 如果有过滤条件，先过滤分类
    ...(Object.keys(baseMatch).length > 0 ? [{ $match: baseMatch }] : []),
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
        isTop: { $ifNull: ["$isTop", false] },
        isAdminOnly: { $ifNull: ["$isAdminOnly", false] }
      }
    },
    {
      $sort: { isTop: -1, order: 1, categoryName: 1 }
    }
  ];

  const stats = await articleCategoryDb.aggregate<ArticleCountByCategory>(pipeline);

  return successResponse<ArticleCountByCategory[]>(stats, '获取分类统计成功');
}); 