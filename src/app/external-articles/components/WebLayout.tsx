'use client';

import { IExternalArticle, ExternalArticleCountByCategory } from '@/app/model/external-article';
import { LinkOutlined } from '@ant-design/icons';

interface WebLayoutProps {
    categories: ExternalArticleCountByCategory[];
    articles: IExternalArticle[];
    selectedCategory: string | null;
    categoryArticleCounts: Record<string, number>;
    loading: boolean;
    onCategorySelect: (categoryId: string) => void;
    getCategoryName: (categoryId: string) => string;
}

export default function WebLayout({
    categories,
    articles,
    selectedCategory,
    categoryArticleCounts,
    loading,
    onCategorySelect,
    getCategoryName
}: WebLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white">
                <nav className="p-4">
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">暂无分类</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <button
                                key={category.categoryId}
                                onClick={() => onCategorySelect(category.categoryId)}
                                className={`w-full text-left p-2 rounded-lg mb-2 ${selectedCategory === category.categoryId
                                    ? "bg-black text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{category.categoryName}</span>
                                    <span className="text-sm opacity-60">
                                        {categoryArticleCounts[category.categoryId] || 0} 篇文章
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </nav>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-8 h-[100vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                    {categories.find((cat) => cat.categoryId === selectedCategory)?.categoryName || '外部文章'}
                </h2>
                <div className="space-y-1">
                    {articles.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">该分类下暂无外部文章</p>
                            <p className="text-sm mt-2">请先在管理后台收录一些外部文章</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div
                                key={article._id}
                                className="block rounded-lg p-2 hover:bg-gray-100 transition-shadow cursor-pointer"
                                onClick={() => {
                                    if (article.url) {
                                        window.open(article.url, '_blank');
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium flex items-center gap-2 flex-1">
                                        <LinkOutlined className="text-sm" />
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm text-gray-500 ml-4 min-w-0">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                            {getCategoryName(article.categoryId)}
                                        </span>
                                        <span className="ml-4">
                                            收录于 {new Date(article.createdAt!).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
