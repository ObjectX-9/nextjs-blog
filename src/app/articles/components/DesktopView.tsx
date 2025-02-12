import { Article, ArticleCategory } from '@/app/model/article';
import { ArticleSkeletonDesktop } from './Skeletons';

interface DesktopViewProps {
  categories: ArticleCategory[];
  selectedCategory: string | null;
  loading: boolean;
  filteredArticles: Article[];
  categoryCounts: Record<string, number>;
  handleCategorySelect: (categoryId: string) => void;
  handleArticleClick: (article: Article) => void;
}

export const DesktopView = ({
  categories,
  selectedCategory,
  loading,
  filteredArticles,
  categoryCounts,
  handleCategorySelect,
  handleArticleClick,
}: DesktopViewProps) => (
  <div className="flex w-full">
    <div className="w-[22vw] border-r bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <nav className="p-4">
          <h2 className="text-lg font-bold mb-4">技术文档</h2>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category._id!)}
              className={`w-full text-left pl-2 pr-2 pt-[2px] pb-[2px] mt-2 rounded-lg relative group ${selectedCategory === category._id
                ? "bg-black text-white"
                : "hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-2">
                  <span className="text-base truncate">{category.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {category.isTop && (
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${selectedCategory === category._id
                        ? 'border-white/20 text-white/80'
                        : 'border-gray-200 text-gray-600'
                        }`}>
                        置顶
                      </span>
                    )}
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${selectedCategory === category._id
                      ? 'border-white/20 text-white/80'
                      : 'border-gray-200 text-gray-600'
                      }`}>
                      {category.status === 'completed' ? '已完成' : '进行中'}
                    </span>
                  </div>
                </div>
                <span className={`text-sm ${selectedCategory === category._id
                  ? 'text-white/60'
                  : 'text-gray-400'
                  }`}>
                  {categoryCounts[category._id!] || 0} 篇
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>

    <div className="flex-1 border-r pl-8 bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <nav className="p-4">
          <h2 className="text-lg font-bold mb-4">
            {categories.find(c => c._id === selectedCategory)?.name || '所有文章'}
          </h2>
          {loading ? (
            <ArticleSkeletonDesktop />
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <button
                key={article._id}
                onClick={() => handleArticleClick(article)}
                className="w-full text-left p-2 rounded-lg mb-2 hover:bg-gray-100"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">{article.title}</span>
                  <span className="text-sm opacity-60">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              暂无文章
            </div>
          )}
        </nav>
      </div>
    </div>
  </div>
);
