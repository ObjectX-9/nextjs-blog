"use client";

import { useState, useEffect, useCallback } from "react";
import { message, Form, Button } from "antd";
import dayjs from 'dayjs';

import {
  Target,
  Plus,
  Calendar
} from "lucide-react";
import { IProjectRequirements, ProjectRequirementsStatus, ProjectRequirementsType } from "@/app/model/types/project-requirements";
import { projectRequirementsBusiness } from "../business/project-requirements";
import { todosBusiness } from "../business/todos";
import { IStack } from "@/app/model/stack";
import { stacksBusiness } from "../business/stacks";
import { Article } from "@/app/model/article";
import { articlesService } from "../business/articles";

// 导入拆分的组件
import { ProjectRequirementSkeleton } from "./ProjectRequirementSkeleton";
import { TimelineRequirementItem } from "./TimelineRequirementItem";
import { ProjectRequirementItem } from "./ProjectRequirementItem";
import { CreateRequirementModal } from "./CreateRequirementModal";
import { EditRequirementModal } from "./EditRequirementModal";
import { Sidebar } from "./Sidebar";
import { FilterBar } from "./FilterBar";

export default function ProjectRequirementsPage() {
  const [projectRequirements, setProjectRequirements] = useState<IProjectRequirements[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<IProjectRequirements | null>(null);
  const [editForm] = Form.useForm();
  const [todoStats, setTodoStats] = useState<Record<string, { total: number; completed: number }>>({});
  const [stacks, setStacks] = useState<IStack[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [timelineGrouped, setTimelineGrouped] = useState<{
    [year: string]: {
      [month: string]: IProjectRequirements[]
    }
  }>({});
  const [articles, setArticles] = useState<Article[]>([]);

  // 获取项目需求列表
  const fetchProjectRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (selectedType !== "all") {
        params.type = selectedType as ProjectRequirementsType;
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus as ProjectRequirementsStatus;
      }

      if (selectedDifficulty !== "all") {
        params.difficultyLevel = parseInt(selectedDifficulty);
      }

      const requirementsList = await projectRequirementsBusiness.getProjectRequirements(params);

      // 按起始时间排序，如果没有起始时间则使用创建时间
      const sortedRequirements = requirementsList.sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
        const dateB = b.startDate ? new Date(b.startDate) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
        return dateB.getTime() - dateA.getTime(); // 最新的在前
      });

      setProjectRequirements(sortedRequirements);

      // 如果是时间线视图，进行分组
      if (activeTab === 'timeline') {
        groupRequirementsByTimeline(sortedRequirements);
      }
    } catch (error) {
      message.error("获取项目需求失败: " + error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, selectedDifficulty, activeTab]);

  // 按时间线分组项目需求
  const groupRequirementsByTimeline = (requirements: IProjectRequirements[]) => {
    const grouped: {
      [year: string]: {
        [month: string]: IProjectRequirements[]
      }
    } = {};

    // 按起始时间分组，如果没有起始时间则使用创建时间
    requirements.forEach(requirement => {
      const date = requirement.startDate ? new Date(requirement.startDate) :
        (requirement.createdAt ? new Date(requirement.createdAt) : new Date());
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');

      if (!grouped[year]) {
        grouped[year] = {};
      }

      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }

      grouped[year][month].push(requirement);
    });

    // 对每个月内的需求按起始时间排序，如果没有起始时间则使用创建时间
    Object.keys(grouped).forEach(year => {
      Object.keys(grouped[year]).forEach(month => {
        grouped[year][month].sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
          const dateB = b.startDate ? new Date(b.startDate) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
          return dateB.getTime() - dateA.getTime(); // 最新的在前
        });
      });
    });

    setTimelineGrouped(grouped);
  };

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await projectRequirementsBusiness.getProjectRequirementsStats();
      setStats(statsData);
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  }, []);

  // 获取所有项目的todo统计
  const fetchTodoStats = useCallback(async () => {
    try {
      const allProjectStats = await todosBusiness.getProjectsStats();
      const statsMap: Record<string, { total: number; completed: number }> = {};
      allProjectStats.forEach(stat => {
        statsMap[stat.projectId] = {
          total: stat.total,
          completed: stat.completed
        };
      });
      setTodoStats(statsMap);
    } catch (error) {
      console.error("获取todo统计失败:", error);
    }
  }, []);

  // 获取技术栈列表
  const fetchStacks = useCallback(async () => {
    try {
      const stacksList = await stacksBusiness.getStacks();
      setStacks(stacksList);
    } catch (error) {
      console.error("获取技术栈失败:", error);
    }
  }, []);

  // 获取文章列表
  const fetchArticles = useCallback(async () => {
    try {
      const articlesList = await articlesService.getArticles({ limit: 1000 });
      setArticles(articlesList.items || []);
    } catch (error) {
      console.error("获取文章失败:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjectRequirements();
  }, [fetchProjectRequirements]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTodoStats();
  }, [fetchTodoStats]);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // 处理状态变更
  const handleStatusChange = async (id: string, status: ProjectRequirementsStatus) => {
    try {
      await projectRequirementsBusiness.updateProjectRequirement(id, { status });
      message.success("状态更新成功");
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("状态更新失败: " + error);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await projectRequirementsBusiness.deleteProjectRequirement(id);
      message.success("删除成功");
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("删除失败: " + error);
    }
  };

  // 处理编辑
  const handleEdit = (requirement: IProjectRequirements) => {
    setEditingRequirement(requirement);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({
      title: requirement.title,
      description: requirement.description,
      type: requirement.type,
      difficultyLevel: requirement.difficultyLevel,
      difficulty: requirement.difficulty,
      startDate: requirement.startDate ? dayjs(requirement.startDate) : null,
      endDate: requirement.endDate ? dayjs(requirement.endDate) : null,
      techStack: requirement.techStack || [],
      relatedDocs: requirement.relatedDocs || [],
      relatedGithubRepos: requirement.relatedGithubRepos || [],
    });
  };

  // 处理编辑项目需求
  const handleEditProjectRequirement = async (values: any) => {
    if (!editingRequirement?._id) return;

    try {
      const requirementData = {
        title: values.title,
        description: values.description,
        type: values.type,
        difficultyLevel: values.difficultyLevel || 2,
        ...(values.startDate && { startDate: values.startDate.toDate() }),
        ...(values.endDate && { endDate: values.endDate.toDate() }),
        ...(values.difficulty && { difficulty: values.difficulty }),
        ...(values.techStack && { techStack: values.techStack }),
        relatedDocs: values.relatedDocs || [],
        relatedGithubRepos: values.relatedGithubRepos || [],
      };

      await projectRequirementsBusiness.updateProjectRequirement(editingRequirement._id, requirementData);
      message.success("更新成功");
      setIsEditModalOpen(false);
      setEditingRequirement(null);
      editForm.resetFields();
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("更新失败: " + error);
    }
  };

  // 处理todo更新后的回调
  const handleTodoUpdated = useCallback(() => {
    fetchTodoStats();
  }, [fetchTodoStats]);

  // 处理创建项目需求
  const handleCreateProjectRequirement = async (values: any) => {
    try {
      const requirementData = {
        title: values.title,
        description: values.description,
        status: ProjectRequirementsStatus.TODO,
        type: values.type,
        difficultyLevel: values.difficultyLevel || 2,
        color: '#3B82F6',
        ...(values.startDate && { startDate: values.startDate.toDate() }),
        ...(values.endDate && { endDate: values.endDate.toDate() }),
        ...(values.difficulty && { difficulty: values.difficulty }),
        ...(values.techStack && { techStack: values.techStack }),
        relatedDocs: values.relatedDocs || [],
        relatedGithubRepos: values.relatedGithubRepos || [],
      };

      await projectRequirementsBusiness.createProjectRequirement(requirementData);
      message.success("创建成功");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchProjectRequirements();
      fetchStats();
    } catch (error) {
      message.error("创建失败: " + error);
    }
  };

  return (
    <main className="flex h-screen w-full box-border bg-white">
      {/* 左侧导航 */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
        projectRequirements={projectRequirements}
        onTimelineGroup={groupRequirementsByTimeline}
      />

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 头部操作栏 */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            {activeTab === 'timeline' ? '时间线视图' : '全部需求'}
          </h2>
          <Button
            type="default"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus size={16} />}
          >
            新建需求
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 全部需求 - 仅在all tab下显示 */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* 筛选器 */}
              <FilterBar
                selectedType={selectedType}
                selectedStatus={selectedStatus}
                selectedDifficulty={selectedDifficulty}
                onTypeChange={setSelectedType}
                onStatusChange={setSelectedStatus}
                onDifficultyChange={setSelectedDifficulty}
              />

              {/* 项目需求列表 */}
              {loading ? (
                <div className="grid gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <ProjectRequirementSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              ) : projectRequirements.length > 0 ? (
                <div className="grid gap-6">
                  {projectRequirements.map((requirement) => (
                    <ProjectRequirementItem
                      key={requirement._id}
                      requirement={requirement}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      todoStat={todoStats[requirement._id!]}
                      onTodoUpdated={handleTodoUpdated}
                      stacks={stacks}
                      articles={articles}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Target size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">暂无项目需求</h3>
                  <p className="text-gray-500">创建您的第一个项目需求开始规划吧！</p>
                </div>
              )}
            </div>
          )}

          {/* 时间线视图 - 仅在timeline tab下显示 */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* 筛选器 */}
              <FilterBar
                selectedType={selectedType}
                selectedStatus={selectedStatus}
                selectedDifficulty={selectedDifficulty}
                onTypeChange={setSelectedType}
                onStatusChange={setSelectedStatus}
                onDifficultyChange={setSelectedDifficulty}
              />

              {/* 时间线内容 */}
              {loading ? (
                <div className="space-y-6">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                      <div className="h-6 w-32 bg-gray-100 rounded mb-3"></div>
                      <div className="flex">
                        <div className="w-3 h-3 rounded-full bg-gray-100 mr-6"></div>
                        <div className="flex-1 h-20 bg-gray-100 rounded border border-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(timelineGrouped).length > 0 ? (
                <div className="space-y-8">
                  {Object.keys(timelineGrouped).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                    <div key={year} className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {year}年
                      </h3>

                      {Object.keys(timelineGrouped[year]).sort((a, b) => parseInt(b) - parseInt(a)).map(month => (
                        <div key={`${year}-${month}`} className="ml-4 space-y-4">
                          <h4 className="text-md font-medium text-gray-600">
                            {month}月 ({timelineGrouped[year][month].length}项)
                          </h4>

                          <div className="space-y-4">
                            {timelineGrouped[year][month].map(requirement => (
                              <TimelineRequirementItem
                                key={requirement._id}
                                requirement={requirement}
                                onStatusChange={handleStatusChange}
                                onEdit={handleEdit}
                                stacks={stacks}
                                articles={articles}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">暂无项目需求</h3>
                  <p className="text-gray-500">创建您的第一个项目需求开始规划吧！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 弹窗组件 */}
      <CreateRequirementModal
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onFinish={handleCreateProjectRequirement}
        form={createForm}
        stacks={stacks}
        articles={articles}
      />

      <EditRequirementModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRequirement(null);
          editForm.resetFields();
        }}
        onFinish={handleEditProjectRequirement}
        form={editForm}
        stacks={stacks}
        articles={articles}
      />
    </main>
  );
} 