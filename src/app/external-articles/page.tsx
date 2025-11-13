'use client';

import { useState, useEffect, useCallback } from 'react';
import { IExternalArticle, ExternalArticleCountByCategory } from '@/app/model/external-article';
import { externalArticlesService } from '@/app/business/external-articles';
import { externalArticleCategoriesService } from '@/app/business/external-article-categories';
import WebLayout from './components/WebLayout';
import MobileLayout from './components/MobileLayout';

export default function ExternalArticlesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<ExternalArticleCountByCategory[]>([]);
    const [articles, setArticles] = useState<IExternalArticle[]>([]);
    const [showMobileList, setShowMobileList] = useState(false);
    const [categoryArticleCounts, setCategoryArticleCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // 获取分类统计
    const fetchCategories = useCallback(async () => {
        try {
            const data = await externalArticleCategoriesService.getCategoriesWithCount();

            const counts: Record<string, number> = {};

            data.forEach((category) => {
                counts[category.categoryId] = category.count;
            });

            setCategories(data);
            setCategoryArticleCounts(counts);

            if (!selectedCategory && data.length > 0) {
                setSelectedCategory(data[0].categoryId);
            }
        } catch (error) {
            console.error('获取外部文章分类失败:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    // 获取外部文章
    const fetchArticles = async (categoryId: string) => {
        if (!categoryId) return;

        try {
            const data = await externalArticlesService.getExternalArticles({
                categoryId: categoryId,
                page: 1,
                limit: 100,
                sortBy: 'latest'
            });
            setArticles(data.items);
        } catch (error) {
            console.error('获取外部文章失败:', error);
            setArticles([]);
        }
    };

    // 初始加载分类
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // 当选中的分类改变时获取文章
    useEffect(() => {
        if (selectedCategory) {
            fetchArticles(selectedCategory);
        }
    }, [selectedCategory]);

    // 获取分类名称
    const getCategoryName = (categoryId: string) => {
        const category = categories.find(c => c.categoryId === categoryId);
        return category?.categoryName || '未知分类';
    };

    return (
        <div className="min-h-screen bg-white flex-1">
            <div className="lg:hidden">
                <MobileLayout
                    categories={categories}
                    articles={articles}
                    selectedCategory={selectedCategory}
                    categoryArticleCounts={categoryArticleCounts}
                    showMobileList={showMobileList}
                    onCategorySelect={setSelectedCategory}
                    onShowMobileList={setShowMobileList}
                    getCategoryName={getCategoryName}
                />
            </div>
            <div className="hidden lg:block">
                <WebLayout
                    categories={categories}
                    articles={articles}
                    selectedCategory={selectedCategory}
                    categoryArticleCounts={categoryArticleCounts}
                    loading={loading}
                    onCategorySelect={setSelectedCategory}
                    getCategoryName={getCategoryName}
                />
            </div>
        </div>
    );
}
