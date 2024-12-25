"use client";

import { useState, useEffect } from "react";
import { Article, ArticleCategory } from "@/app/model/article";

// 扩展Article接口以包含MongoDB的_id
interface ArticleWithId extends Article {
  _id: string;
}

export default function ArticlesManagementPage() {
  const [articles, setArticles] = useState<ArticleWithId[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [activeTab, setActiveTab] = useState("articles"); // 添加标签状态
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingArticle, setEditingArticle] = useState<{
    id: string;
    article: Partial<ArticleWithId>;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [newArticle, setNewArticle] = useState<Article>({
    title: "",
    url: "",
    category: "",
    categoryId: "",
    tags: [],
    likes: 0,
    views: 0,
    createdAt: "",
    updatedAt: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/articles/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleAddArticle = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ article: newArticle }),
      });

      const data = await response.json();
      if (data.success) {
        setArticles([...articles, data.article]);
        setShowAddArticle(false);
        setNewArticle({
          title: "",
          url: "",
          category: "",
          categoryId: "",
          tags: [],
          likes: 0,
          views: 0,
          createdAt: "",
          updatedAt: "",
        });
      }
    } catch (error) {
      console.error("Error adding article:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingArticle.id,
          updates: editingArticle.article
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticles(
            articles.map((article) =>
              article._id === editingArticle.id 
                ? { ...article, ...editingArticle.article }
                : article
            )
          );
          setEditingArticle(null);
        } else {
          console.error("Failed to update article:", data.error);
        }
      } else {
        console.error("Failed to update article");
      }
    } catch (error) {
      console.error("Error updating article:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteArticle = async (id: string, index: number) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      const response = await fetch("/api/articles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedArticles = articles.filter((_, idx) => idx !== index);
        setArticles(updatedArticles);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const handleAddTag = (isNewArticle: boolean = true) => {
    if (!tagInput.trim()) return;

    if (isNewArticle) {
      setNewArticle({
        ...newArticle,
        tags: [...newArticle.tags, tagInput.trim()],
      });
    } else if (editingArticle) {
      setEditingArticle({
        ...editingArticle,
        article: {
          ...editingArticle.article,
          tags: [...editingArticle.article.tags!, tagInput.trim()],
        },
      });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagIndex: number, isNewArticle: boolean = true) => {
    if (isNewArticle) {
      setNewArticle({
        ...newArticle,
        tags: newArticle.tags.filter((_, idx) => idx !== tagIndex),
      });
    } else if (editingArticle) {
      setEditingArticle({
        ...editingArticle,
        article: {
          ...editingArticle.article,
          tags: editingArticle.article.tags?.filter((_, idx) => idx !== tagIndex),
        },
      });
    }
  };

  // 在选择分类时更新分类名称
  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    if (selectedCategory) {
      if (editingArticle) {
        setEditingArticle({
          ...editingArticle,
          article: {
            ...editingArticle.article,
            categoryId,
            category: selectedCategory.name
          }
        });
      } else {
        setNewArticle({
          ...newArticle,
          categoryId,
          category: selectedCategory.name
        });
      }
    }
  };

  const handleEditClick = (article: ArticleWithId) => {
    setEditingArticle({
      id: article._id,
      article: {
        title: article.title,
        url: article.url,
        category: article.category,
        categoryId: article.categoryId,
        tags: article.tags,
        likes: article.likes,
        views: article.views,
      },
    });
  };

  // 处理编辑分类
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingCategory._id,
          name: editingCategory.name,
          description: editingCategory.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedCategories = categories.map(category =>
          category._id === editingCategory._id ? editingCategory : category
        );
        setCategories(updatedCategories);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理删除分类
  const handleDeleteCategory = async (id: string) => {
    // 检查是否有文章使用该分类
    const articlesUsingCategory = articles.filter(article => article.categoryId === id);
    if (articlesUsingCategory.length > 0) {
      alert(`无法删除此分类，因为还有 ${articlesUsingCategory.length} 篇文章在使用它。`);
      return;
    }

    if (!confirm("确定要删除这个分类吗？")) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedCategories = categories.filter(category => category._id !== id);
        setCategories(updatedCategories);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 添加分类
  const handleAddCategory = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();
      if (data.success) {
        setCategories([...categories, data.category]);
        setShowAddCategory(false);
        setNewCategory({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理更新点赞数
  const handleUpdateLikes = async (id: string, currentLikes: number) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          updates: { likes: currentLikes + 1 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticles(
            articles.map((article) =>
              article._id === id ? { ...article, likes: currentLikes + 1 } : article
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理更新浏览量
  const handleUpdateViews = async (id: string, currentViews: number) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/articles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          updates: { views: currentViews + 1 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticles(
            articles.map((article) =>
              article._id === id ? { ...article, views: currentViews + 1 } : article
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating views:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标签切换按钮 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">文章管理</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === "articles"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            文章列表
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded w-full sm:w-auto ${activeTab === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            分类管理
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mb-6">
        {activeTab === "articles" ? (
          <button
            onClick={() => setShowAddArticle(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
          >
            添加文章
          </button>
        ) : (
          <button
            onClick={() => setShowAddCategory(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
          >
            添加分类
          </button>
        )}
      </div>

      {/* 文章列表 */}
      {activeTab === "articles" && (
        <div className="bg-white rounded-lg shadow">
          {/* 移动端卡片视图 */}
          <div className="lg:hidden">
            {articles.map((article, index) => (
              <div key={article._id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{article.title}</h3>
                    <a href={article.url} className="text-sm text-blue-600 hover:text-blue-800 break-all">{article.url}</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => handleUpdateLikes(article._id, article.likes)}
                      className="inline-flex items-center space-x-1 text-gray-600"
                      disabled={isUpdating}
                    >
                      <span>👍</span>
                      <span>{article.likes}</span>
                    </button>
                    <button
                      onClick={() => handleUpdateViews(article._id, article.views)}
                      className="inline-flex items-center space-x-1 text-gray-600"
                      disabled={isUpdating}
                    >
                      <span>👁️</span>
                      <span>{article.views}</span>
                    </button>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => handleEditClick(article)}
                      className="flex-1 py-2 px-4 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article._id, index)}
                      className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 桌面端表格视图 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标签
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    点赞/阅读
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article, index) => (
                  <tr key={article._id}>
                    <td className="px-2 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500 hidden sm:block truncate max-w-[200px] sm:max-w-xs">
                        {article.url}
                      </div>
                      {/* 移动端显示的额外信息 */}
                      <div className="sm:hidden space-y-1 mt-2">
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{article.category}</div>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {article.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-[100px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateLikes(article._id, article.likes)}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            disabled={isUpdating}
                          >
                            <span>👍</span>
                            <span>{article.likes}</span>
                          </button>
                          <span>/</span>
                          <button
                            onClick={() => handleUpdateViews(article._id, article.views)}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            disabled={isUpdating}
                          >
                            <span>👁️</span>
                            <span>{article.views}</span>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateLikes(article._id, article.likes)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                          disabled={isUpdating}
                        >
                          <span>👍</span>
                          <span>{article.likes}</span>
                        </button>
                        <span>/</span>
                        <button
                          onClick={() => handleUpdateViews(article._id, article.views)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                          disabled={isUpdating}
                        >
                          <span>👁️</span>
                          <span>{article.views}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(article)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article._id, index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg shadow">
          {/* 移动端卡片视图 */}
          <div className="lg:hidden">
            {categories.map((category) => (
              <div key={category._id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    文章数量: {articles.filter(article => article.categoryId === category._id).length}
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="flex-1 py-2 px-4 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id!)}
                      className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "删除中..." : "删除"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 桌面端表格视图 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    文章数量
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-2 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {/* 移动端显示的额外信息 */}
                      <div className="sm:hidden space-y-1 mt-2">
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{category.description}</div>
                        <div className="text-sm text-gray-500">
                          文章数量: {articles.filter(article => article.categoryId === category._id).length}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-[300px]">
                        {category.description}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {articles.filter(article => article.categoryId === category._id).length}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 sm:mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id!)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "删除中..." : "删除"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 添加文章模态框 */}
      {showAddArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">添加文章</h2>
                <button
                  onClick={() => setShowAddArticle(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, title: e.target.value })
                  }
                  placeholder="请输入标题"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  链接
                </label>
                <input
                  type="text"
                  value={newArticle.url}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, url: e.target.value })
                  }
                  placeholder="请输入链接"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类
                </label>
                <select
                  value={newArticle.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 bg-gray-50 rounded-md border border-gray-200">
                  {newArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors group"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="输入标签后按回车添加"
                      className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                    />
                    {tagInput && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                        按回车添加
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                    disabled={!tagInput.trim()}
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddArticle(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddArticle}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "添加中..." : "添加"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑文章模态框 */}
      {editingArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">编辑文章</h2>
                <button
                  onClick={() => setEditingArticle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={editingArticle.article.title || ""}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      article: { ...editingArticle.article, title: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  链接
                </label>
                <input
                  type="url"
                  value={editingArticle.article.url || ""}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      article: { ...editingArticle.article, url: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类
                </label>
                <select
                  value={editingArticle.article.categoryId || ""}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 bg-gray-50 rounded-md border border-gray-200">
                  {editingArticle.article.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors group"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                        onClick={() => handleRemoveTag(index, false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag(false);
                        }
                      }}
                      placeholder="输入标签后按回车添加"
                      className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                    />
                    {tagInput && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                        按回车添加
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                    disabled={!tagInput.trim()}
                  >
                    添加
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    点赞数
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingArticle.article.likes || 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Math.max(0, parseInt(value) || 0);
                      setEditingArticle({
                        ...editingArticle,
                        article: {
                          ...editingArticle.article,
                          likes: numValue,
                        },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    浏览量
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingArticle.article.views || 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Math.max(0, parseInt(value) || 0);
                      setEditingArticle({
                        ...editingArticle,
                        article: {
                          ...editingArticle.article,
                          views: numValue,
                        },
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateArticle}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "更新中..." : "更新"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分类模态框 */}
      {editingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">编辑分类</h2>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类名称
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="请输入分类名称"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类描述
                </label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="请输入分类描述"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "更新中..." : "更新"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加分类模态框 */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">添加分类</h2>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类名称
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="请输入分类名称"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  分类描述
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="请输入分类描述"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "添加中..." : "添加"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
