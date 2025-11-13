'use client';

import { IExternalArticle, ExternalArticleCountByCategory } from '@/app/model/external-article';
import { LinkOutlined } from '@ant-design/icons';

interface MobileLayoutProps {
    categories: ExternalArticleCountByCategory[];
    articles: IExternalArticle[];
    selectedCategory: string | null;
    categoryArticleCounts: Record<string, number>;
    showMobileList: boolean;
    onCategorySelect: (categoryId: string) => void;
    onShowMobileList: (show: boolean) => void;
    getCategoryName: (categoryId: string) => string;
}

export default function MobileLayout({
    categories,
    articles,
    selectedCategory,
    categoryArticleCounts,
    showMobileList,
    onCategorySelect,
    onShowMobileList,
    getCategoryName
}: MobileLayoutProps) {
    return (
        <>
            {showMobileList ? (
                <div className="flex flex-col min-h-screen bg-white h-[100vh]">
                    <div className="sticky top-0 bg-white border-b">
                        <div className="px-4 py-3">
                            <button
                                onClick={() => onShowMobileList(false)}
                                className="text-sm text-gray-500"
                            >
                                返回分类
                            </button>
                        </div>
                        <div className="px-4 pb-3">
                            <h2 className="text-xl font-bold">
                                {categories.find((cat) => cat.categoryId === selectedCategory)?.categoryName}
                            </h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto">
                        {articles.map((article) => (
                            <div
                                key={article._id}
                                className="block border border-gray-200 rounded-lg p-3 cursor-pointer"
                                onClick={() => {
                                    if (article.url) {
                                        window.open(article.url, '_blank');
                                    }
                                }}
                            >
                                <h3 className="font-medium flex items-center gap-2">
                                    <LinkOutlined className="text-sm" />
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        {getCategoryName(article.categoryId)}
                                    </span>
                                    <span>
                                        收录于 {new Date(article.createdAt!).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-6">外部文章</h1>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <button
                                key={category.categoryId}
                                onClick={() => {
                                    onCategorySelect(category.categoryId);
                                    onShowMobileList(true);
                                }}
                                className="w-full p-3 rounded-lg border border-gray-200 text-left"
                            >
                                <div className="flex justify-between items-center">
                                    <span>{category.categoryName}</span>
                                    <span className="text-sm text-gray-500">
                                        {categoryArticleCounts[category.categoryId] || 0} 篇文章
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
