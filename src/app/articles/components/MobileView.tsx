import { Article, ArticleCountByCategory } from '@/app/model/article';
import { ArticleSkeleton } from './Skeletons';
import Link from 'next/link';
import { RssIcon } from '@/components/icons/RssIcon';
import LikeButton from '@/components/HomePage/LikeButton';
import ViewCounter from '@/components/HomePage/ViewCounter';

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
        className={`fixed inset-0 bg-white transition-transform duration-300 z-40 ${currentView === 'categories' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">技术文档分类</h2>
              <Link
                href="/api/rss?type=articles"
                target="_blank"
                className="text-orange-500 p-2 hover:bg-orange-50 rounded-lg transition-colors"
                title="订阅全部文章"
              >
                <RssIcon className="w-4 h-4" isSelected={false} />
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar-thin">
            <div className="pt-2">
              {categories.map((category, index) => (
                <div
                  key={category.categoryId}
                  className={`relative bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 ${index === 0 ? 'mt-1' : ''
                    } border-b border-gray-100 last:border-b-0`}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategorySelect(category.categoryId!);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategorySelect(category.categoryId!);
                    }}
                    className="w-full text-left p-4 pr-16 block touch-manipulation relative z-10"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: '80px'
                    }}
                  >
                    <div className="flex flex-col space-y-2">
                      <span className="text-base font-medium text-gray-900 leading-5">
                        {category.categoryName}
                      </span>
                      {category.description && (
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {category.description}
                        </span>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{category.count} 篇文章</span>
                        {category.isTop && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                            置顶
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
                    <Link
                      href={`/api/rss?type=articles&categoryId=${category.categoryId}`}
                      target="_blank"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`/api/rss?type=articles&categoryId=${category.categoryId}`, '_blank');
                      }}
                      onTouchStart={(e: React.TouchEvent<HTMLAnchorElement>) => {
                        e.stopPropagation();
                      }}
                      onTouchEnd={(e: React.TouchEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`/api/rss?type=articles&categoryId=${category.categoryId}`, '_blank');
                      }}
                      className="p-3 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors touch-manipulation"
                      title={`订阅 ${category.categoryName} 分类`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <RssIcon className="w-3.5 h-3.5" isSelected={false} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 z-50 ${currentView === 'articles' ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 touch-manipulation hover:bg-gray-50 active:bg-gray-100 transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg
              className="w-5 h-5 text-gray-700"
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

          <div className="p-4 pt-16 border-b bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {categories.find(c => c.categoryId === selectedCategory)?.categoryName || '所有文章'}
              </h2>
              {selectedCategory && (
                <Link
                  href={`/api/rss?type=articles&categoryId=${selectedCategory}`}
                  target="_blank"
                  className="text-orange-500 p-2 hover:bg-orange-50 rounded-lg transition-colors touch-manipulation"
                  title="订阅当前分类"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <RssIcon className="w-4 h-4" isSelected={false} />
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-thin">
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-4">
                  <ArticleSkeleton />
                </div>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <button
                    key={`${article._id}-${article.categoryId}`}
                    onClick={() => handleArticleClick(article)}
                    className="w-full text-left p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium text-gray-900 leading-5 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(article.createdAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                          })}
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <div className="flex items-center justify-center w-8">
                            <LikeButton articleId={article._id?.toString() || ""} initialLikes={article.likes || 0} />
                          </div>
                          <div className="flex items-center justify-center w-8">
                            <ViewCounter initialViews={article.views || 0} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">暂无文章</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}