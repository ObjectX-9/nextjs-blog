"use client";

import { useState, useEffect } from "react";
import { IBookmark, IBookmarkCategory } from "@/app/model/bookmark";
import { ObjectId } from "mongodb";

interface EditingBookmark {
  categoryId: string;
  newCategoryId: string;
  bookmarkId: string;
  bookmark: Partial<IBookmark>;
}

export default function BookmarksManagementPage() {
  const [categories, setCategories] = useState<IBookmarkCategory[]>([]);
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [newCategory, setNewCategory] = useState<Partial<IBookmarkCategory>>({
    name: "",
  });
  const [newBookmark, setNewBookmark] = useState<Partial<IBookmark>>({
    title: "",
    url: "",
    description: "",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingBookmark, setEditingBookmark] =
    useState<EditingBookmark | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/bookmarkCategories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0]._id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name?.trim()) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/bookmarkCategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory.name }),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }

        await fetchCategories();
        setNewCategory({ name: "" });
      } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category and all its bookmarks?"
      )
    ) {
      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/bookmarkCategories?id=${categoryId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        await fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAddBookmark = async () => {
    if (newBookmark.title && newBookmark.url && selectedCategoryId) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newBookmark,
            categoryId: selectedCategoryId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create bookmark");
        }

        await fetchCategories();
        setNewBookmark({ title: "", url: "", description: "" });
        setShowAddBookmark(false);
      } catch (error) {
        console.error("Error creating bookmark:", error);
        alert("Failed to create bookmark. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/bookmarks?id=${bookmarkId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete bookmark");
        }

        await fetchCategories();
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        alert("Failed to delete bookmark. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const startEditingBookmark = (
    categoryId: string,
    bookmarkId: string,
    bookmark: IBookmark
  ) => {
    setEditingBookmark({
      categoryId,
      newCategoryId: categoryId,
      bookmarkId,
      bookmark: { ...bookmark },
    });
  };

  const handleEditBookmarkSave = async () => {
    if (editingBookmark) {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/bookmarks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: editingBookmark.bookmarkId,
            ...editingBookmark.bookmark,
            categoryId: editingBookmark.newCategoryId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update bookmark");
        }

        await fetchCategories();
        setEditingBookmark(null);
      } catch (error) {
        console.error("Error updating bookmark:", error);
        alert("Failed to update bookmark. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h1 className="text-2xl font-bold p-6">书签管理</h1>

      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "bookmarks"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("bookmarks")}
          >
            书签列表
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            分类管理
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-auto w-full">
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">
                  分类名称
                </label>
                <input
                  className="border rounded px-3 py-2"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="请输入分类名称"
                />
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleAddCategory}
              >
                添加分类
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 w-1/4">名称</th>
                    <th className="text-left p-4 w-1/4">书签数量</th>
                    <th className="text-left p-4 w-1/4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{category.name}</td>
                      <td className="p-4">{category.bookmarks.length}</td>
                      <td className="p-4">
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                          onClick={() =>
                            handleDeleteCategory(category._id.toString())
                          }
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

        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setShowAddBookmark(true)}
            >
              添加书签
            </button>

            {showAddBookmark && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-[500px]">
                  <h3 className="text-lg font-semibold mb-4">添加新书签</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        分类
                      </label>
                      <select
                        className="w-full p-2 border rounded appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Cpath%20d%3D%22M10.293%204.293a1%201%200%20011.414%201.414l-5%205a1%201%200%2001-1.414%200l-5-5a1%201%200%20011.414-1.414L6%208.586l4.293-4.293z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] pr-8"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                      >
                        {categories.map((category, index) => (
                          <option key={index} value={category._id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        标题
                      </label>
                      <input
                        className="w-full p-2 border rounded"
                        value={newBookmark.title}
                        onChange={(e) =>
                          setNewBookmark({
                            ...newBookmark,
                            title: e.target.value,
                          })
                        }
                        placeholder="请输入书签标题"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        链接
                      </label>
                      <input
                        className="w-full p-2 border rounded"
                        value={newBookmark.url}
                        onChange={(e) =>
                          setNewBookmark({
                            ...newBookmark,
                            url: e.target.value,
                          })
                        }
                        placeholder="请输入链接地址"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        描述
                      </label>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={newBookmark.description}
                        onChange={(e) =>
                          setNewBookmark({
                            ...newBookmark,
                            description: e.target.value,
                          })
                        }
                        placeholder="请输入书签描述"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 bg-gray-200 rounded"
                        onClick={() => setShowAddBookmark(false)}
                      >
                        取消
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={handleAddBookmark}
                      >
                        确认添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingBookmark && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-[500px]">
                  <h3 className="text-lg font-semibold mb-4">编辑书签</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        分类
                      </label>
                      <select
                        className="w-full p-2 border rounded appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Cpath%20d%3D%22M10.293%204.293a1%201%200%20011.414%201.414l-5%205a1%201%200%2001-1.414%200l-5-5a1%201%200%20011.414-1.414L6%208.586l4.293-4.293z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] pr-8"
                        value={editingBookmark.newCategoryId}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            newCategoryId: e.target.value,
                          })
                        }
                      >
                        {categories.map((category, index) => (
                          <option key={index} value={category._id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        标题
                      </label>
                      <input
                        className="w-full p-2 border rounded"
                        value={editingBookmark.bookmark.title}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            bookmark: {
                              ...editingBookmark.bookmark,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        链接
                      </label>
                      <input
                        className="w-full p-2 border rounded"
                        value={editingBookmark.bookmark.url}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            bookmark: {
                              ...editingBookmark.bookmark,
                              url: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        描述
                      </label>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={editingBookmark.bookmark.description}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            bookmark: {
                              ...editingBookmark.bookmark,
                              description: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 bg-gray-200 rounded"
                        onClick={() => setEditingBookmark(null)}
                      >
                        取消
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={handleEditBookmarkSave}
                      >
                        保存修改
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 w-1/4">标题</th>
                    <th className="text-left p-4 w-1/4">链接</th>
                    <th className="text-left p-4 w-1/4">分类</th>
                    <th className="text-left p-4 w-1/4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) =>
                    category.bookmarks.map((bookmark) => (
                      <tr key={bookmark._id?.toString()} className="border-t">
                        <td className="p-4 truncate">{bookmark.title}</td>
                        <td className="p-4 truncate">
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {bookmark.url}
                          </a>
                        </td>
                        <td className="p-4">{category.name}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                              onClick={() =>
                                startEditingBookmark(
                                  category._id?.toString() || "",
                                  bookmark._id?.toString() || "",
                                  bookmark
                                )
                              }
                            >
                              编辑
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                              onClick={() =>
                                handleDeleteBookmark(
                                  bookmark._id?.toString() || ""
                                )
                              }
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
