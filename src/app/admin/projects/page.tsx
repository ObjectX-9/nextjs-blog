"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCategory } from "@/app/model/project";

interface EditProjectForm extends Omit<Project, 'categoryId'> {
  categoryId?: string;
  _id?: string;
}

interface Category extends Omit<ProjectCategory, '_id'> {
  _id?: string;
}

export default function ProjectsAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<(Project & { _id: string })[]>([]);
  const [editingProject, setEditingProject] = useState<EditProjectForm | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<{ _id: string; data: Category } | null>(null);
  const [tagInput, setTagInput] = useState("");

  // Fetch categories and projects
  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await fetch('/api/projects/categories');
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      // Fetch all projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('加载数据失败，请刷新页面重试');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProject = async (project: EditProjectForm) => {
    try {
      const method = project._id ? 'PUT' : 'POST';
      const response = await fetch('/api/projects', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      await fetchData();
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('删除失败，请重试');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.description) {
      try {
        const response = await fetch('/api/projects/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory),
        });

        if (!response.ok) {
          throw new Error('Failed to add category');
        }

        await fetchData();
        setNewCategory({ name: "", description: "" });
      } catch (error) {
        console.error('Error adding category:', error);
        alert('添加分类失败，请重试');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？该分类下的所有项目都会被删除。')) {
      try {
        const response = await fetch(`/api/projects/categories?id=${categoryId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete category');
        }

        await fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleSaveCategory = async (categoryId: string, updatedCategory: Category) => {
    try {
      const response = await fetch('/api/projects/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: categoryId, ...updatedCategory }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      await fetchData();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('更新失败，请重试');
    }
  };

  // Group projects by category
  const getProjectsByCategory = (categoryId: string) => {
    return projects.filter(project => project.categoryId.toString() === categoryId);
  };

  return (
    <div className="p-4 md:p-6 max-w-[100vw] overflow-x-hidden">
      <h1 className="text-xl md:text-2xl font-bold mb-6">项目管理</h1>
      
      {/* Add New Category Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg md:text-xl font-semibold mb-4">添加新分类</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="分类名称"
            className="px-3 py-2 border rounded w-full md:w-auto"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="分类描述"
            className="px-3 py-2 border rounded w-full md:flex-1"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full md:w-auto"
          >
            添加分类
          </button>
        </div>
      </div>

      {/* Project Categories */}
      {categories.map((category) => {
        const categoryProjects = getProjectsByCategory(category._id!);
        return (
          <div key={category._id} className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">{category.name}</h2>
                <p className="text-gray-600 text-sm md:text-base">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory({
                    _id: category._id!,
                    data: {
                      name: category.name,
                      description: category.description,
                      projects: category.projects
                    }
                  })}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex-1 md:flex-none"
                >
                  编辑分类
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id!)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex-1 md:flex-none"
                >
                  删除分类
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {categoryProjects.map((project) => (
                <div key={project._id} className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg">{project.title}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{project.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs md:text-sm bg-gray-100 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="mr-4">状态: {
                          project.status === 'completed' ? '已完成' :
                          project.status === 'in-progress' ? '进行中' : '计划中'
                        }</span>
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" 
                             className="mr-4 text-blue-500 hover:underline">
                            GitHub
                          </a>
                        )}
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer"
                             className="text-blue-500 hover:underline">
                            项目链接
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 md:flex-none w-full md:w-auto">
                      <button
                        onClick={() => setEditingProject({
                          ...project,
                          categoryId: category._id
                        })}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex-1 md:flex-none"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex-1 md:flex-none"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setEditingProject({
                  title: "",
                  description: "",
                  tags: [],
                  status: "planned",
                  categoryId: category._id
                })}
                className="px-4 py-2 border border-dashed rounded-lg w-full text-gray-500 hover:bg-gray-50 text-sm md:text-base"
              >
                + 添加新项目
              </button>
            </div>
          </div>
        );
      })}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProject._id ? "编辑项目" : "添加新项目"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="项目标题"
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
                <textarea
                  placeholder="项目描述"
                  className="w-full px-3 py-2 border rounded text-base min-h-[100px]"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingProject.github || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="项目URL"
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingProject.url || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
                />
                <div>
                  <input
                    type="text"
                    placeholder="标签 (用逗号分隔，按回车添加)"
                    className="w-full px-3 py-2 border rounded text-base"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const newTags = tagInput.split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
                        if (newTags.length > 0) {
                          setEditingProject({
                            ...editingProject,
                            tags: [...new Set([...editingProject.tags, ...newTags])]
                          });
                          setTagInput('');
                        }
                      }
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingProject.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-700"
                          onClick={() => {
                            setEditingProject({
                              ...editingProject,
                              tags: editingProject.tags.filter((_, i) => i !== index)
                            });
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <select
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({
                    ...editingProject,
                    status: e.target.value as "completed" | "in-progress" | "planned"
                  })}
                >
                  <option value="planned">计划中</option>
                  <option value="in-progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-50 flex-1 text-base"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleSaveProject(editingProject)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 text-base"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">编辑分类</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="分类名称"
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingCategory.data.name}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    data: { ...editingCategory.data, name: e.target.value }
                  })}
                />
                <input
                  type="text"
                  placeholder="分类描述"
                  className="w-full px-3 py-2 border rounded text-base"
                  value={editingCategory.data.description}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    data: { ...editingCategory.data, description: e.target.value }
                  })}
                />
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-50 flex-1 text-base"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleSaveCategory(editingCategory._id, editingCategory.data)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 text-base"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
