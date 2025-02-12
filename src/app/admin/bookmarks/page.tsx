"use client";

import { useState, useEffect } from "react";
import { IBookmark, IBookmarkCategory } from "@/app/model/bookmark";
import { ObjectId } from "mongodb";
import {
  Button,
  Input,
  Select,
  Table,
  Modal,
  Typography,
  Space,
  Tabs,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface EditingBookmark {
  categoryId: string;
  newCategoryId: string;
  bookmarkId: string;
  bookmark: Partial<IBookmark>;
}

interface ActionModalBookmark {
  categoryId: string;
  bookmarkId: string;
  bookmark: IBookmark;
  categoryName: string;
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
  const [actionModalBookmark, setActionModalBookmark] =
    useState<ActionModalBookmark | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/bookmarks/categories");
      const data = await response.json();
      if (data?.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0]._id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      messageApi.error("获取分类失败");
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name?.trim()) {
      setIsUpdating(true);
      try {
        const response = await fetch("/api/bookmarks/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory.name }),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }

        await fetchCategories();
        setNewCategory({ name: "" });
        messageApi.success("分类创建成功");
      } catch (error) {
        console.error("Error creating category:", error);
        messageApi.error("创建分类失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个分类及其所有书签吗？",
      onOk: async () => {
        setIsUpdating(true);
        try {
          const response = await fetch(
            `/api/bookmarks/categories?id=${categoryId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete category");
          }

          await fetchCategories();
          messageApi.success("分类删除成功");
        } catch (error) {
          console.error("Error deleting category:", error);
          messageApi.error("删除分类失败");
        } finally {
          setIsUpdating(false);
        }
      },
    });
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
        messageApi.success("书签创建成功");
      } catch (error) {
        console.error("Error creating bookmark:", error);
        messageApi.error("创建书签失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个书签吗？",
      onOk: async () => {
        setIsUpdating(true);
        try {
          const response = await fetch(`/api/bookmarks?id=${bookmarkId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete bookmark");
          }

          await fetchCategories();
          messageApi.success("书签删除成功");
        } catch (error) {
          console.error("Error deleting bookmark:", error);
          messageApi.error("删除书签失败");
        } finally {
          setIsUpdating(false);
        }
      },
    });
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
        messageApi.success("书签更新成功");
      } catch (error) {
        console.error("Error updating bookmark:", error);
        messageApi.error("更新书签失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const categoryColumns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "书签数量",
      dataIndex: "bookmarks",
      key: "bookmarkCount",
      render: (bookmarks: any[]) => bookmarks.length,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: IBookmarkCategory) => (
        <Button
          type="primary"
          danger
          onClick={() => handleDeleteCategory(record._id!.toString())}
          icon={<DeleteOutlined />}
        >
          删除
        </Button>
      ),
    },
  ];

  const bookmarkColumns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "链接",
      dataIndex: "url",
      key: "url",
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          {url}
        </a>
      ),
    },
    {
      title: "分类",
      key: "category",
      render: (_: any, record: IBookmark, index: number) => {
        const category = categories.find((c) =>
          c.bookmarks.some((b) => b._id?.toString() === record._id?.toString())
        );
        return category?.name || "";
      },
    },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: IBookmark) => {
        const category = categories.find((c) =>
          c.bookmarks.some((b) => b._id?.toString() === record._id?.toString())
        );
        return (
          <Space>
            <Button
              onClick={() =>
                startEditingBookmark(
                  category?._id?.toString() || "",
                  record._id?.toString() || "",
                  record
                )
              }
              icon={<EditOutlined />}
            >
              编辑
            </Button>
            <Button
              danger
              onClick={() => handleDeleteBookmark(record._id?.toString() || "")}
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  const allBookmarks = categories
    .filter((category) => category._id)
    .flatMap((category) =>
      category.bookmarks.map((bookmark) => ({
        ...bookmark,
        categoryId: category._id!,
        categoryName: category.name,
      }))
    );

  const filteredBookmarks =
    filterCategoryId === "all"
      ? allBookmarks
      : allBookmarks.filter(
          (bookmark) => bookmark.categoryId.toString() === filterCategoryId
        );

  return (
    <div className="p-6">
      {contextHolder}
      <Title level={2}>书签管理</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        <TabPane tab="书签列表" key="bookmarks" />
        <TabPane tab="分类管理" key="categories" />
      </Tabs>

      {activeTab === "categories" && (
        <div className="space-y-4">
          <Space className="w-full">
            <Input
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="请输入分类名称"
            />
            <Button
              type="primary"
              onClick={handleAddCategory}
              loading={isUpdating}
            >
              添加分类
            </Button>
          </Space>

          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey={(record) => record._id?.toString() || ""}
            pagination={false}
          />
        </div>
      )}

      {activeTab === "bookmarks" && (
        <>
          <Space className="mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddBookmark(true)}
            >
              添加书签
            </Button>
            <Select
              style={{ width: 200 }}
              value={filterCategoryId}
              onChange={setFilterCategoryId}
              placeholder="选择分类筛选"
            >
              <Select.Option value="all">全部分类</Select.Option>
              {categories.map((category) => (
                <Select.Option
                  key={category._id?.toString()}
                  value={category._id?.toString() || ""}
                >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Space>

          <Table
            columns={bookmarkColumns}
            dataSource={filteredBookmarks}
            rowKey={(record) => record._id?.toString() || ""}
            pagination={{ pageSize: 10 }}
          />
        </>
      )}

      <Modal
        title="添加新书签"
        open={showAddBookmark}
        onOk={handleAddBookmark}
        onCancel={() => setShowAddBookmark(false)}
        confirmLoading={isUpdating}
      >
        <Space direction="vertical" className="w-full">
          <Select
            className="w-full"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            placeholder="选择分类"
          >
            {categories.map((category) => (
              <Select.Option
                key={category._id?.toString()}
                value={category._id?.toString() || ""}
              >
                {category.name}
              </Select.Option>
            ))}
          </Select>
          <Input
            value={newBookmark.title}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, title: e.target.value })
            }
            placeholder="请输入书签标题"
          />
          <Input
            value={newBookmark.url}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, url: e.target.value })
            }
            placeholder="请输入链接地址"
          />
          <TextArea
            value={newBookmark.description}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, description: e.target.value })
            }
            placeholder="请输入书签描述"
            rows={4}
          />
        </Space>
      </Modal>

      <Modal
        title="编辑书签"
        open={!!editingBookmark}
        onOk={handleEditBookmarkSave}
        onCancel={() => setEditingBookmark(null)}
        confirmLoading={isUpdating}
      >
        {editingBookmark && (
          <Space direction="vertical" className="w-full">
            <Select
              className="w-full"
              value={editingBookmark.newCategoryId}
              onChange={(value) =>
                setEditingBookmark({
                  ...editingBookmark,
                  newCategoryId: value,
                })
              }
            >
              {categories.map((category) => (
                <Select.Option
                  key={category._id?.toString()}
                  value={category._id?.toString() || ""}
                >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
            <Input
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
              placeholder="书签标题"
            />
            <Input
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
              placeholder="链接地址"
            />
            <TextArea
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
              placeholder="书签描述"
              rows={4}
            />
          </Space>
        )}
      </Modal>
    </div>
  );
}
