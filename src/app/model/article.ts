export interface Article {
  // MongoDB ID
  _id?: string;

  // 文章标题
  title: string;
  
  // 文章链接
  url: string;
  
  // 文章分类
  category: string;
  
  // 文章分类ID
  categoryId: string; 
  
  // 文章标签（可以有多个）
  tags: string[];
  
  // 点赞数
  likes: number;
  
  // 阅读数
  views: number;
  
  // 创建时间
  createdAt: string;
  
  // 更新时间（可选）
  updatedAt: string;
}

// 文章分类枚举
// export enum ArticleCategory {
//   TECH = 'tech',
//   LIFE = 'life',
//   THOUGHTS = 'thoughts',
//   TUTORIAL = 'tutorial',
//   OTHER = 'other',
// }

// 文章分类接口
export interface ArticleCategory {
  _id?: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
