"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { IBookmark, IBookmarkCategory } from "@/app/model/bookmark";
import { bookmarksBusiness } from "@/app/business/bookmarks";
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
import { MessageInstance } from "antd/es/message/interface";

const { Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface EditingBookmark {
  categoryId: string;
  newCategoryId: string;
  bookmarkId: string;
  bookmark: Partial<IBookmark>;
}

// 提取错误处理函数
const handleApiError = (
  error: unknown,
  messageApi: MessageInstance,
  customMessage: string
) => {
  console.error(`Error ${customMessage}:`, error);
  messageApi.error(customMessage);
};

// 提取表格列定义到组件外部
const createCategoryColumns = (handleDeleteCategory: (id: string) => void) => [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "书签数量",
    dataIndex: "bookmarks",
    key: "bookmarkCount",
    render: (bookmarks: IBookmark[]) => bookmarks.length,
  },
  {
    title: "操作",
    key: "action",
    render: (_: unknown, record: IBookmarkCategory) => (
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

const createBookmarkColumns = (
  categories: IBookmarkCategory[],
  startEditingBookmark: (
    categoryId: string,
    bookmarkId: string,
    bookmark: IBookmark
  ) => void,
  handleDeleteBookmark: (id: string) => void
) => [
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
      dataIndex: "categoryName",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: IBookmark & { categoryName: string }) => {
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

// Modal 配置
const modalConfig = {
  addBookmark: {
    title: "添加新书签",
    okText: "添加",
    cancelText: "取消",
  },
  editBookmark: {
    title: "编辑书签",
    okText: "保存",
    cancelText: "取消",
  },
  deleteConfirm: {
    title: "确认删除",
    okText: "确认",
    cancelText: "取消",
  },
};

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
  const [messageApi, contextHolder] = message.useMessage();
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");

  // 使用 useCallback 优化回调函数
  const fetchCategories = useCallback(async () => {
    try {
      const data = await bookmarksBusiness.getBookmarkCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0]._id!.toString());
      }
    } catch (error) {
      handleApiError(error, messageApi, "获取分类失败");
    }
  }, [messageApi, selectedCategoryId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      Modal.confirm({
        ...modalConfig.deleteConfirm,
        content: "确定要删除这个分类及其所有书签吗？",
        onOk: async () => {
          setIsUpdating(true);
          try {
            await bookmarksBusiness.deleteBookmarkCategory(categoryId);
            await fetchCategories();
            messageApi.success("分类删除成功");
          } catch (error) {
            handleApiError(error, messageApi, "删除分类失败");
          } finally {
            setIsUpdating(false);
          }
        },
      });
    },
    [fetchCategories, messageApi]
  );

  const handleDeleteBookmark = useCallback(
    async (bookmarkId: string) => {
      Modal.confirm({
        ...modalConfig.deleteConfirm,
        content: "确定要删除这个书签吗？",
        onOk: async () => {
          setIsUpdating(true);
          try {
            await bookmarksBusiness.deleteBookmark(bookmarkId);
            await fetchCategories();
            messageApi.success("书签删除成功");
          } catch (error) {
            handleApiError(error, messageApi, "删除书签失败");
          } finally {
            setIsUpdating(false);
          }
        },
      });
    },
    [fetchCategories, messageApi]
  );

  const startEditingBookmark = useCallback(
    (categoryId: string, bookmarkId: string, bookmark: IBookmark) => {
      setEditingBookmark({
        categoryId,
        newCategoryId: categoryId,
        bookmarkId,
        bookmark: { ...bookmark },
      });
    },
    []
  );

  // 使用 useMemo 优化派生状态
  const allBookmarks = useMemo(
    () =>
      categories
        .filter((category) => category._id)
        .flatMap((category) =>
          category.bookmarks.map((bookmark) => ({
            ...bookmark,
            categoryId: category._id!,
            categoryName: category.name,
          }))
        ),
    [categories]
  );

  const filteredBookmarks = useMemo(
    () =>
      filterCategoryId === "all"
        ? allBookmarks
        : allBookmarks.filter(
          (bookmark) => bookmark.categoryId.toString() === filterCategoryId
        ),
    [allBookmarks, filterCategoryId]
  );

  // 使用 useMemo 优化表格列配置
  const categoryColumns = useMemo(
    () => createCategoryColumns(handleDeleteCategory),
    [handleDeleteCategory]
  );

  const bookmarkColumns = useMemo(
    () =>
      createBookmarkColumns(
        categories,
        startEditingBookmark,
        handleDeleteBookmark
      ),
    [categories, startEditingBookmark, handleDeleteBookmark]
  );

  const handleAddCategory = async () => {
    if (newCategory.name?.trim()) {
      setIsUpdating(true);
      try {
        await bookmarksBusiness.createBookmarkCategory({ name: newCategory.name });
        await fetchCategories();
        setNewCategory({ name: "" });
        messageApi.success("分类创建成功");
      } catch (error) {
        handleApiError(error, messageApi, "创建分类失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAddBookmark = async () => {
    if (newBookmark.title && newBookmark.url && selectedCategoryId) {
      setIsUpdating(true);
      try {
        await bookmarksBusiness.createBookmark({
          ...newBookmark,
          categoryId: selectedCategoryId,
        } as Omit<IBookmark, '_id' | 'createdAt' | 'updatedAt'>);
        await fetchCategories();
        setNewBookmark({ title: "", url: "", description: "" });
        setShowAddBookmark(false);
        messageApi.success("书签创建成功");
      } catch (error) {
        handleApiError(error, messageApi, "创建书签失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleEditBookmarkSave = async () => {
    if (editingBookmark) {
      setIsUpdating(true);
      try {
        await bookmarksBusiness.updateBookmark({
          _id: editingBookmark.bookmarkId,
          ...editingBookmark.bookmark,
          categoryId: editingBookmark.newCategoryId,
        } as IBookmark);
        await fetchCategories();
        setEditingBookmark(null);
        messageApi.success("书签更新成功");
      } catch (error) {
        handleApiError(error, messageApi, "更新书签失败");
      } finally {
        setIsUpdating(false);
      }
    }
  };

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
        {...modalConfig.addBookmark}
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
        {...modalConfig.editBookmark}
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
