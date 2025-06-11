"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCategory } from "@/app/model/project";
import {
  Button,
  Input,
  Modal,
  Card,
  Space,
  Tag,
  Select,
  Typography,
  Popconfirm,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GithubOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface EditProjectForm extends Omit<Project, "categoryId"> {
  categoryId?: string;
  _id?: string;
}

interface Category extends Omit<ProjectCategory, "_id"> {
  _id?: string;
}

export default function ProjectsAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<(Project & { _id: string })[]>([]);
  const [editingProject, setEditingProject] = useState<EditProjectForm | null>(
    null
  );
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<{
    _id: string;
    data: Category;
  } | null>(null);
  const [tagInput, setTagInput] = useState("");

  // Fetch categories and projects
  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await fetch("/api/projects/categories");
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      // Fetch all projects
      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("加载数据失败，请刷新页面重试");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProject = async (project: EditProjectForm) => {
    try {
      const method = project._id ? "PUT" : "POST";
      const response = await fetch("/api/projects", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      await fetchData();
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("保存失败，请重试");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      await fetchData();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("删除失败，请重试");
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.description) {
      try {
        const response = await fetch("/api/projects/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        });

        if (!response.ok) {
          throw new Error("Failed to add category");
        }

        await fetchData();
        setNewCategory({ name: "", description: "" });
      } catch (error) {
        console.error("Error adding category:", error);
        alert("添加分类失败，请重试");
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("确定要删除这个分类吗？该分类下的所有项目都会被删除。")) {
      try {
        const response = await fetch(
          `/api/projects/categories?id=${categoryId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete category");
        }

        await fetchData();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("删除失败，请重试");
      }
    }
  };

  const handleSaveCategory = async (
    categoryId: string,
    updatedCategory: Category
  ) => {
    try {
      const response = await fetch("/api/projects/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: categoryId, ...updatedCategory }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      await fetchData();
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("更新失败，请重试");
    }
  };

  // Group projects by category
  const getProjectsByCategory = (categoryId: string) => {
    return projects.filter(
      (project) => project.categoryId.toString() === categoryId
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[100vw] flex flex-col min-h-[100vh] bg-white">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <Title level={2} className="!mb-0">
          项目管理
        </Title>
      </div>

      {/* Add New Category Section */}
      <Card className="mb-6" bordered={false}>
        <Title level={4} className="mb-4">
          添加新分类
        </Title>
        <Space.Compact block size="large">
          <Input
            placeholder="分类名称"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <Input
            placeholder="分类描述"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            添加分类
          </Button>
        </Space.Compact>
      </Card>

      {/* Project Categories */}
      <div className="flex-1 space-y-6">
        {categories.map((category) => {
          const categoryProjects = getProjectsByCategory(category._id!);
          return (
            <Card key={category._id} className="shadow-sm" bordered={false}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-6 pb-4 border-b">
                <div>
                  <Title level={4} className="!mb-1">
                    {category.name}
                  </Title>
                  <Text type="secondary">{category.description}</Text>
                </div>
                <Space>
                  <Button
                    type="primary"
                    ghost
                    onClick={() =>
                      setEditingCategory({
                        _id: category._id!,
                        data: {
                          name: category.name,
                          description: category.description,
                          projects: category.projects,
                        },
                      })
                    }
                  >
                    编辑分类
                  </Button>
                  <Popconfirm
                    title="确定要删除这个分类吗？"
                    description="该分类下的所有项目都会被删除。"
                    onConfirm={() => handleDeleteCategory(category._id!)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger ghost>
                      删除分类
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
              <div className="grid gap-4">
                {categoryProjects.map((project) => (
                  <Card
                    key={project._id}
                    size="small"
                    className="hover:shadow-md transition-shadow duration-300"
                    bordered={false}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <Title level={5} className="!mb-2">
                          {project.title}
                        </Title>
                        <Paragraph type="secondary" className="!mb-3">
                          {project.description}
                        </Paragraph>
                        <Space size={[0, 8]} wrap className="mb-3">
                          {project.tags.map((tag, index) => (
                            <Tag key={index} className="rounded-full px-3 py-1">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                        <Space className="text-sm" size="middle">
                          <Tag
                            className="rounded-full"
                            color={
                              project.status === "completed"
                                ? "success"
                                : project.status === "in-progress"
                                ? "processing"
                                : "default"
                            }
                          >
                            {project.status === "completed"
                              ? "已完成"
                              : project.status === "in-progress"
                              ? "进行中"
                              : "计划中"}
                          </Tag>
                          {project.github && (
                            <Button
                              type="link"
                              href={project.github}
                              target="_blank"
                              icon={<GithubOutlined />}
                              size="small"
                              className="!px-0"
                            >
                              GitHub
                            </Button>
                          )}
                          {project.url && (
                            <Button
                              type="link"
                              href={project.url}
                              target="_blank"
                              icon={<LinkOutlined />}
                              size="small"
                              className="!px-0"
                            >
                              项目链接
                            </Button>
                          )}
                        </Space>
                      </div>
                      <Space>
                        <Button
                          type="primary"
                          ghost
                          onClick={() =>
                            setEditingProject({
                              ...project,
                              categoryId: category._id,
                            })
                          }
                          icon={<EditOutlined />}
                        >
                          编辑
                        </Button>
                        <Popconfirm
                          title="确定要删除这个项目吗？"
                          onConfirm={() => handleDeleteProject(project._id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button danger ghost icon={<DeleteOutlined />}>
                            删除
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  </Card>
                ))}
                <Button
                  block
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setEditingProject({
                      title: "",
                      description: "",
                      tags: [],
                      status: "planned",
                      categoryId: category._id,
                    })
                  }
                  className="hover:border-blue-400 hover:text-blue-400 transition-colors duration-300"
                >
                  添加新项目
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Project Modal */}
      <Modal
        open={!!editingProject}
        title={editingProject?._id ? "编辑项目" : "添加新项目"}
        onCancel={() => setEditingProject(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingProject(null)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => editingProject && handleSaveProject(editingProject)}
          >
            保存
          </Button>,
        ]}
        width={720}
        className="top-[50px]"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(2px)",
        }}
      >
        {editingProject && (
          <Form layout="vertical" className="mt-4">
            <Form.Item
              label="项目标题"
              required
              tooltip="项目的名称，建议简短明了"
            >
              <Input
                value={editingProject.title}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    title: e.target.value,
                  })
                }
                placeholder="请输入项目标题"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="项目描述"
              required
              tooltip="详细描述项目的功能和特点"
            >
              <TextArea
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    description: e.target.value,
                  })
                }
                placeholder="请输入项目描述"
                rows={4}
                size="large"
              />
            </Form.Item>
            <Form.Item label="GitHub 地址" tooltip="项目的 GitHub 仓库地址">
              <Input
                value={editingProject.github || ""}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    github: e.target.value,
                  })
                }
                placeholder="请输入 GitHub 地址"
                prefix={<GithubOutlined className="text-gray-400" />}
                size="large"
              />
            </Form.Item>
            <Form.Item label="项目地址" tooltip="项目的线上访问地址">
              <Input
                value={editingProject.url || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, url: e.target.value })
                }
                placeholder="请输入项目地址"
                prefix={<LinkOutlined className="text-gray-400" />}
                size="large"
              />
            </Form.Item>
            <Form.Item label="标签" tooltip="用于分类和快速识别项目的关键词">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="输入标签后按回车添加，支持逗号分隔"
                size="large"
                suffix={
                  <Text type="secondary" className="text-xs">
                    按回车或逗号添加
                  </Text>
                }
                onPressEnter={(e) => {
                  e.preventDefault();
                  const newTags = tagInput
                    .split(/[,，]/)
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  if (newTags.length > 0) {
                    setEditingProject({
                      ...editingProject,
                      tags: Array.from(
                        new Set([...editingProject.tags, ...newTags])
                      ),
                    });
                    setTagInput("");
                  }
                }}
              />
              <div className="mt-2">
                <Space size={[0, 8]} wrap>
                  {editingProject.tags.map((tag, index) => (
                    <Tag
                      key={index}
                      closable
                      className="rounded-full px-3 py-1"
                      onClose={() => {
                        setEditingProject({
                          ...editingProject,
                          tags: editingProject.tags.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Form.Item>
            <Form.Item label="状态" required tooltip="项目当前的开发状态">
              <Select
                value={editingProject.status}
                onChange={(value) =>
                  setEditingProject({
                    ...editingProject,
                    status: value,
                  })
                }
                options={[
                  { label: "计划中", value: "planned" },
                  { label: "进行中", value: "in-progress" },
                  { label: "已完成", value: "completed" },
                ]}
                size="large"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        open={!!editingCategory}
        title="编辑分类"
        onCancel={() => setEditingCategory(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingCategory(null)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() =>
              editingCategory &&
              handleSaveCategory(editingCategory._id, editingCategory.data)
            }
          >
            保存
          </Button>,
        ]}
        width={520}
        className="top-[50px]"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(2px)",
        }}
      >
        {editingCategory && (
          <Form layout="vertical" className="mt-4">
            <Form.Item
              label="分类名称"
              required
              tooltip="分类的名称，用于区分不同类型的项目"
            >
              <Input
                value={editingCategory.data.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    data: { ...editingCategory.data, name: e.target.value },
                  })
                }
                placeholder="请输入分类名称"
                size="large"
              />
            </Form.Item>
            <Form.Item label="分类描述" required tooltip="对这个分类的简要说明">
              <Input.TextArea
                value={editingCategory.data.description}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    data: {
                      ...editingCategory.data,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="请输入分类描述"
                size="large"
                rows={3}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
