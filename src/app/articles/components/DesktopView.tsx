import { Article, ArticleCountByCategory } from '@/app/model/article';
import { ArticleSkeletonDesktop } from './Skeletons';
import Link from 'next/link';
import { RssIcon } from '@/components/icons/RssIcon';

interface DesktopViewProps {
  /**
   * 分类列表
   */
  categories: ArticleCountByCategory[];
  /**
   * 当前选中的分类
   */
  selectedCategory: string | null;
  /**
   * 是否加载中
   */
  loading: boolean;
  /**
   * 当前选中的分类的文章列表
   */
  filteredArticles: Article[];
  /**
   * 处理分类选择
   */
  handleCategorySelect: (categoryId: string) => void;
  /**
   * 处理文章点击
   */
  handleArticleClick: (article: Article) => void;
}

export const DesktopView = (props: DesktopViewProps) => {
  const {
    categories,
    selectedCategory,
    loading,
    filteredArticles,
    handleCategorySelect,
    handleArticleClick
  } = props;
  return (
    <div className="flex w-full">
      <div className="w-[22vw] border-r bg-white">
        <div className="sticky top-0 h-screen overflow-y-auto custom-scrollbar-thin">
          <nav className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">技术文档</h2>
              <Link
                href="/api/rss?type=articles"
                target="_blank"
                className="text-orange-500 hover:text-orange-600"
                title="订阅全部文章"
              >
                <RssIcon className="w-4 h-4" isSelected={false} />
              </Link>
            </div>
            {categories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => handleCategorySelect(category.categoryId)}
                className={`w-full text-left pl-2 pr-2 pt-[2px] pb-[2px] mt-2 rounded-lg relative group ${selectedCategory === category.categoryId
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-between min-h-[40px]">
                  <div className="flex items-center gap-2">
                    <span className="text-base truncate">{category.categoryName}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {category.isTop && (
                        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${selectedCategory === category.categoryId
                          ? 'border-white/20 text-white/80'
                          : 'border-gray-200 text-gray-600'
                          }`}>
                          置顶
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${selectedCategory === category.categoryId
                        ? 'border-white/20 text-white/80'
                        : 'border-gray-200 text-gray-600'
                        }`}>
                        {category.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className={`text-sm ${selectedCategory === category.categoryId
                      ? 'text-white/60'
                      : 'text-gray-400'
                      }`}>
                      {category.count} 篇
                    </span>
                    {selectedCategory === category.categoryId && (
                      <Link
                        href={`/api/rss?type=articles&categoryId=${category.categoryId}`}
                        target="_blank"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                        className="text-orange-500 hover:text-orange-600 ml-2"
                        title={`订阅 ${category.categoryName} 分类`}
                      >
                        <RssIcon className="w-3 h-3" isSelected={true} />
                      </Link>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 border-r pl-8 bg-white">
        <div className="sticky top-0 h-screen overflow-y-auto custom-scrollbar-thin">
          <nav className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {categories.find(c => c.categoryId === selectedCategory)?.categoryName || '所有文章'}
              </h2>
              {selectedCategory && (
                <Link
                  href={`/api/rss?type=articles&categoryId=${selectedCategory}`}
                  target="_blank"
                  className="text-black hover:text-orange-600"
                  title="订阅当前分类"
                >
                  <RssIcon className="w-4 h-4" isSelected={false} />
                </Link>
              )}
            </div>

            {loading ? (
              <ArticleSkeletonDesktop />
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.categoryId}
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
  )
};
