import { Article, ArticleCountByCategory } from '@/app/model/article';
import { ArticleSkeleton } from './Skeletons';
import Link from 'next/link';
import { RssIcon } from '@/components/icons/RssIcon';

interface MobileViewProps {
  currentView: 'categories' | 'articles';
  categories: ArticleCountByCategory[];
  selectedCategory: string | null;
  loading: boolean;
  filteredArticles: Article[];
  handleCategorySelect: (categoryId: string) => void;
  handleBack: () => void;
  handleArticleClick: (article: Article) => void;
}

export const MobileView = (props: MobileViewProps) => {
  const {
    currentView,
    categories,
    selectedCategory,
    loading,
    filteredArticles,
    handleCategorySelect,
    handleBack,
    handleArticleClick,
  } = props;
  return (
    <div className="w-full">
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">技术文档分类</h2>
              <Link
                href="/api/rss?type=articles"
                target="_blank"
                className="text-orange-500"
                title="订阅全部文章"
              >
                <RssIcon className="w-4 h-4" isSelected={false} />
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pt-0">
              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => handleCategorySelect(category.categoryId!)}
                  className="w-full text-left p-3 border-b last:border-b-0 relative group hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between min-h-[40px]">
                    <span className="text-base font-medium truncate">{category.categoryName}</span>
                    <Link
                      href={`/api/rss?type=articles&categoryId=${category.categoryId}`}
                      target="_blank"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                      className="text-orange-500"
                      title={`订阅 ${category.categoryName} 分类`}
                    >
                      <RssIcon className="w-3 h-3" isSelected={false} />
                    </Link>
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
        <div className="flex flex-col h-full">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
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

          <div className="p-4 pt-16 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {categories.find(c => c.categoryId === selectedCategory)?.categoryName || '所有文章'}
              </h2>
              {selectedCategory && (
                <Link
                  href={`/api/rss?type=articles&categoryId=${selectedCategory}`}
                  target="_blank"
                  className="text-orange-500"
                  title="订阅当前分类"
                >
                  <RssIcon className="w-4 h-4" isSelected={false} />
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-thin">
            <div className="p-4 pt-0">
              {loading ? (
                <ArticleSkeleton />
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <button
                    key={article.categoryId}
                    onClick={() => handleArticleClick(article)}
                    className="w-full text-left p-3 border-b last:border-b-0 hover:bg-gray-50"
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
      </div>
    </div>
  )
}