"use client";

import { useState } from "react";
import { Project, ProjectCategory, projectData } from "@/config/projects";

interface EditProjectForm extends Project {
  categoryIndex: number;
  projectIndex?: number;
}

export default function ProjectsAdmin() {
  const [categories, setCategories] = useState<ProjectCategory[]>(projectData);
  const [editingProject, setEditingProject] = useState<EditProjectForm | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<{ index: number; data: ProjectCategory } | null>(null);

  const saveToAPI = async (newCategories: ProjectCategory[]) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: newCategories }),
      });

      if (!response.ok) {
        throw new Error('Failed to save projects');
      }

      const data = await response.json();
      if (data.success) {
        setCategories(newCategories);
      } else {
        throw new Error('Failed to save projects');
      }
    } catch (error) {
      console.error('Error saving projects:', error);
      alert('保存失败，请重试');
    }
  };

  const handleSaveProject = async (project: EditProjectForm) => {
    const newCategories = [...categories];
    const { categoryIndex, projectIndex, ...projectData } = project;

    if (projectIndex !== undefined) {
      // Edit existing project
      newCategories[categoryIndex].projects[projectIndex] = projectData;
    } else {
      // Add new project
      newCategories[categoryIndex].projects.push(projectData);
    }

    await saveToAPI(newCategories);
    setEditingProject(null);
  };

  const handleDeleteProject = async (categoryIndex: number, projectIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].projects.splice(projectIndex, 1);
    await saveToAPI(newCategories);
  };

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.description) {
      const newCategories = [...categories, { ...newCategory, projects: [] }];
      await saveToAPI(newCategories);
      setNewCategory({ name: "", description: "" });
    }
  };

  const handleDeleteCategory = async (categoryIndex: number) => {
    if (confirm('确定要删除这个分类吗？该分类下的所有项目都会被删除。')) {
      const newCategories = [...categories];
      newCategories.splice(categoryIndex, 1);
      await saveToAPI(newCategories);
    }
  };

  const handleSaveCategory = async (index: number, updatedCategory: ProjectCategory) => {
    const newCategories = [...categories];
    newCategories[index] = updatedCategory;
    await saveToAPI(newCategories);
    setEditingCategory(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">项目管理</h1>
      
      {/* Add New Category Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">添加新分类</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="分类名称"
            className="px-3 py-2 border rounded"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="分类描述"
            className="px-3 py-2 border rounded flex-1"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加分类
          </button>
        </div>
      </div>

      {/* Project Categories */}
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <p className="text-gray-600">{category.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setEditingCategory({
                  index: categoryIndex,
                  data: {
                    name: category.name,
                    description: category.description,
                    projects: category.projects
                  }
                })}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                编辑分类
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryIndex)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除分类
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {category.projects.map((project, projectIndex) => (
              <div key={projectIndex} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-gray-600">{project.description}</p>
                    <div className="mt-2 space-x-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-sm bg-gray-100 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingProject({
                        ...project,
                        categoryIndex,
                        projectIndex
                      })}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteProject(categoryIndex, projectIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
                categoryIndex
              })}
              className="px-4 py-2 border border-dashed rounded-lg w-full text-gray-500 hover:bg-gray-50"
            >
              + 添加新项目
            </button>
          </div>
        </div>
      ))}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingProject.projectIndex !== undefined ? "编辑项目" : "添加新项目"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="项目标题"
                className="w-full px-3 py-2 border rounded"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
              />
              <textarea
                placeholder="项目描述"
                className="w-full px-3 py-2 border rounded"
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="GitHub URL"
                className="w-full px-3 py-2 border rounded"
                value={editingProject.github || ""}
                onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
              />
              <input
                type="text"
                placeholder="项目URL"
                className="w-full px-3 py-2 border rounded"
                value={editingProject.url || ""}
                onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
              />
              <input
                type="text"
                placeholder="标签 (用逗号分隔)"
                className="w-full px-3 py-2 border rounded"
                value={editingProject.tags.join(", ")}
                onChange={(e) => setEditingProject({
                  ...editingProject,
                  tags: e.target.value.split(",").map(tag => tag.trim())
                })}
              />
              <select
                className="w-full px-3 py-2 border rounded"
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
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSaveProject(editingProject)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">编辑分类</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="分类名称"
                className="w-full px-3 py-2 border rounded"
                value={editingCategory.data.name}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  data: { ...editingCategory.data, name: e.target.value }
                })}
              />
              <input
                type="text"
                placeholder="分类描述"
                className="w-full px-3 py-2 border rounded"
                value={editingCategory.data.description}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  data: { ...editingCategory.data, description: e.target.value }
                })}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSaveCategory(editingCategory.index, editingCategory.data)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
