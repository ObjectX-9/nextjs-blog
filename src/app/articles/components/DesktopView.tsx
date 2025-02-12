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
    <div className="w-[20vw] border-r bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto">
        <nav className="p-4">
          <h2 className="text-lg font-bold mb-4">技术文档</h2>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category._id!)}
              className={`w-full text-left p-3 rounded-lg mb-2 relative group border ${selectedCategory === category._id
                ? "bg-black text-white border-transparent"
                : "hover:bg-gray-50 border-gray-200"
                }`}
            >
              <div className="absolute left-0 top-0 flex gap-1">
                {category.isTop && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedCategory === category._id
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-300 text-white hover:bg-gray-500'
                    }`}>
                    置顶
                  </span>
                )}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${selectedCategory === category._id
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-300 text-white hover:bg-gray-500'
                  }`}>
                  {category.status === 'completed' ? '已完成' : '进行中'}
                </span>
              </div>
              <div className="flex items-center justify-between min-h-[40px]">
                <span className="text-base truncate mr-2">{category.name}</span>
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
