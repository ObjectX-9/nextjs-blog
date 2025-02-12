import { Article, ArticleCategory } from '@/app/model/article';
import { ArticleSkeleton } from './Skeletons';

interface MobileViewProps {
  currentView: 'categories' | 'articles';
  categories: ArticleCategory[];
  selectedCategory: string | null;
  loading: boolean;
  filteredArticles: Article[];
  handleCategorySelect: (categoryId: string) => void;
  handleBack: () => void;
  handleArticleClick: (article: Article) => void;
}

export const MobileView = ({
  currentView,
  categories,
  selectedCategory,
  loading,
  filteredArticles,
  handleCategorySelect,
  handleBack,
  handleArticleClick,
}: MobileViewProps) => (
  <div className="w-full">
    <div
      className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">技术文档分类</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pt-0">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategorySelect(category._id!)}
                className="w-full text-left p-3 border-b last:border-b-0 relative group hover:bg-gray-50"
              >
                <div className="absolute left-0 top-0 flex gap-1">
                  {category.isTop && (
                    <span className="text-[10px] font-medium bg-gray-300 text-white px-1.5 py-0.5 rounded">
                      置顶
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-300 text-white`}>
                    {category.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
                <div className="flex items-center min-h-[40px]">
                  <span className="text-base font-medium truncate">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div
      className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'articles' ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="p-4 pt-16">
        <h2 className="text-lg font-bold mb-4">
          {categories.find(c => c._id === selectedCategory)?.name || '所有文章'}
        </h2>
        {loading ? (
          <ArticleSkeleton />
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <button
              key={article._id}
              onClick={() => handleArticleClick(article)}
              className="w-full text-left p-3 border-b last:border-b-0"
            >
              <div className="flex flex-col">
                <div className="font-medium truncate">{article.title}</div>
                <span className="text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 py-8">
            暂无文章
          </div>
        )}
      </div>
    </div>
  </div>
);
