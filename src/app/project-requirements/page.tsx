"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Tag, message, Modal, Form, Input, DatePicker } from "antd";
import {
  Target,
  Square,
  Clock,
  AlertCircle,
  Pause, 
  Plus,
  Filter,
  Calendar,
  Code,
  Briefcase,
  User,
  Edit,
  FileText
} from "lucide-react";
import { IProjectRequirements, ProjectRequirementsStatus, ProjectRequirementsType } from "@/app/model/project-requirements";
import { projectRequirementsBusiness } from "../business/project-requirements";

// 状态配置
const statusConfig = {
  [ProjectRequirementsStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-800", icon: Square },
  [ProjectRequirementsStatus.IN_PROGRESS]: { label: "进行中", color: "bg-blue-100 text-blue-800", icon: Clock },
  [ProjectRequirementsStatus.COMPLETED]: { label: "已完成", color: "bg-green-100 text-green-800", icon: Target },
  [ProjectRequirementsStatus.DELAYED]: { label: "已延期", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  [ProjectRequirementsStatus.CANCELLED]: { label: "已取消", color: "bg-red-100 text-red-800", icon: AlertCircle },
  [ProjectRequirementsStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
  [ProjectRequirementsStatus.ARCHIVED]: { label: "已归档", color: "bg-purple-100 text-purple-800", icon: Target },
};

// 类型配置
const typeConfig = {
  [ProjectRequirementsType.work]: { label: "工作", color: "bg-blue-100 text-blue-800", icon: Briefcase },
  [ProjectRequirementsType.personal]: { label: "个人", color: "bg-green-100 text-green-800", icon: User },
};

// 难度级别配置
const difficultyConfig = {
  1: { label: "简单", color: "bg-green-100 text-green-800" },
  2: { label: "中等", color: "bg-yellow-100 text-yellow-800" },
  3: { label: "困难", color: "bg-orange-100 text-orange-800" },
  4: { label: "极难", color: "bg-red-100 text-red-800" },
};

// 获取状态颜色
const getStatusColor = (status: ProjectRequirementsStatus) => {
  switch (status) {
    case ProjectRequirementsStatus.TODO: return 'default';
    case ProjectRequirementsStatus.IN_PROGRESS: return 'blue';
    case ProjectRequirementsStatus.COMPLETED: return 'green';
    case ProjectRequirementsStatus.DELAYED: return 'orange';
    case ProjectRequirementsStatus.CANCELLED: return 'red';
    case ProjectRequirementsStatus.DELETED: return 'default';
    case ProjectRequirementsStatus.ARCHIVED: return 'purple';
    default: return 'default';
  }
};

// 获取类型颜色
const getTypeColor = (type: ProjectRequirementsType) => {
  switch (type) {
    case ProjectRequirementsType.work: return 'blue';
    case ProjectRequirementsType.personal: return 'green';
    default: return 'default';
  }
};

// 获取难度级别颜色
const getDifficultyColor = (level: number) => {
  switch (level) {
    case 1: return 'green';
    case 2: return 'gold';
    case 3: return 'orange';
    case 4: return 'red';
    default: return 'default';
  }
};

// 项目需求骨架屏组件
const ProjectRequirementSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

// 项目需求项组件
const ProjectRequirementItem = ({
  requirement,
  onStatusChange,
  onDelete
}: {
  requirement: IProjectRequirements;
  onStatusChange: (id: string, status: ProjectRequirementsStatus) => void;
  onDelete: (id: string) => void;
}) => {
  const StatusIcon = statusConfig[requirement.status].icon;
  const TypeIcon = typeConfig[requirement.type].icon;
  const isOverdue = requirement.endDate && new Date(requirement.endDate) < new Date() &&
    requirement.status !== ProjectRequirementsStatus.COMPLETED &&
    requirement.status !== ProjectRequirementsStatus.CANCELLED;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusToggle = () => {
    const newStatus = requirement.status === ProjectRequirementsStatus.COMPLETED ?
      ProjectRequirementsStatus.TODO : ProjectRequirementsStatus.COMPLETED;
    onStatusChange(requirement._id!, newStatus);
  };

  return (
    <Card className={`p-4 transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="space-y-3">
        {/* 标题和状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleStatusToggle}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <StatusIcon size={18} className={requirement.status === ProjectRequirementsStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
            </button>
            <h3 className={`font-medium ${requirement.status === ProjectRequirementsStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
              {requirement.title}
            </h3>
          </div>
          <Tag color={getStatusColor(requirement.status)}>
            {statusConfig[requirement.status].label}
          </Tag>
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-600 ml-7">{requirement.description}</p>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 类型 */}
            <Tag color={getTypeColor(requirement.type)}>
              <TypeIcon size={12} className="inline mr-1" />
              {typeConfig[requirement.type].label}
            </Tag>

            {/* 难度级别 */}
            <Tag color={getDifficultyColor(requirement.difficultyLevel || 2)}>
              {difficultyConfig[requirement.difficultyLevel || 2].label}
            </Tag>

            {/* 结束日期 */}
            {requirement.endDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                <Calendar size={14} />
                {formatDate(requirement.endDate)}
              </div>
            )}

            {/* 技术栈数量 */}
            {requirement.techStack && requirement.techStack.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Code size={14} />
                {requirement.techStack.length} 技术栈
              </div>
            )}

            {/* 关联 Todo 数量 */}
            {requirement.todos && requirement.todos.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Target size={14} />
                {requirement.todos.length} 任务
              </div>
            )}

            {/* 技术方案状态 */}
            {requirement.techSolutionOssPath && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Edit size={14} />
                有方案
              </div>
            )}

            {/* 反思笔记状态 */}
            {requirement.reflectionOssPath && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <FileText size={14} />
                有反思
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/tech-solution`}
              className={requirement.techSolutionOssPath ? "text-blue-600 hover:text-blue-700 bg-blue-50" : "text-blue-600 hover:text-blue-700"}
              title={requirement.techSolutionOssPath ? "编辑技术方案" : "创建技术方案"}
            >
              <Edit size={14} className="mr-1" />
              {requirement.techSolutionOssPath ? "方案✓" : "方案"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/reflection`}
              className={requirement.reflectionOssPath ? "text-purple-600 hover:text-purple-700 bg-purple-50" : "text-purple-600 hover:text-purple-700"}
              title={requirement.reflectionOssPath ? "编辑反思笔记" : "创建反思笔记"}
            >
              <FileText size={14} className="mr-1" />
              {requirement.reflectionOssPath ? "反思✓" : "反思"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(requirement._id!, ProjectRequirementsStatus.IN_PROGRESS)}
              disabled={requirement.status === ProjectRequirementsStatus.IN_PROGRESS}
            >
              开始
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(requirement._id!)}
              className="text-red-600 hover:text-red-700"
            >
              删除
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ProjectRequirementsPage() {
  const [projectRequirements, setProjectRequirements] = useState<IProjectRequirements[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

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
      setProjectRequirements(requirementsList);
    } catch (error) {
      message.error("获取项目需求失败: " + error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, selectedDifficulty]);

  // 获取统计信息
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await projectRequirementsBusiness.getProjectRequirementsStats();
      setStats(statsData);
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjectRequirements();
  }, [fetchProjectRequirements]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto custom-scrollbar-thin">
      {/* 头部 */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">项目需求</h1>
            <p className="text-gray-600 mt-1">管理您的项目需求和开发计划</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            新建需求
          </Button>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">总需求</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">进行中</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">完成率</div>
            </Card>
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">筛选：</span>
          </div>

          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 150 }}
            placeholder="选择类型"
          >
            <Select.Option value="all">所有类型</Select.Option>
            {Object.entries(typeConfig).map(([type, config]) => (
              <Select.Option key={type} value={type}>
                {config.label}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 150 }}
            placeholder="选择状态"
          >
            <Select.Option value="all">所有状态</Select.Option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Select.Option key={status} value={status}>
                {config.label}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            style={{ width: 150 }}
            placeholder="选择难度"
          >
            <Select.Option value="all">所有难度</Select.Option>
            {Object.entries(difficultyConfig).map(([level, config]) => (
              <Select.Option key={level} value={level}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 项目需求列表 */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="grid gap-4">
            {Array(6).fill(0).map((_, index) => (
              <ProjectRequirementSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : projectRequirements.length > 0 ? (
          <div className="grid gap-4">
            {projectRequirements.map((requirement) => (
              <ProjectRequirementItem
                key={requirement._id}
                requirement={requirement}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目需求</h3>
            <p className="text-gray-600">创建您的第一个项目需求开始规划吧！</p>
          </div>
        )}
      </div>

      {/* 创建项目需求模态框 */}
      <Modal
        title="新建项目需求"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProjectRequirement}
        >
          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="输入需求标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="需求描述"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <Input.TextArea rows={3} placeholder="输入需求描述" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="type"
              label="需求类型"
              rules={[{ required: true, message: '请选择需求类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择需求类型">
                <Select.Option value={ProjectRequirementsType.work}>工作</Select.Option>
                <Select.Option value={ProjectRequirementsType.personal}>个人</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="难度级别"
              style={{ flex: 1 }}
            >
              <Select placeholder="选择难度级别">
                <Select.Option value={1}>简单</Select.Option>
                <Select.Option value={2}>中等</Select.Option>
                <Select.Option value={3}>困难</Select.Option>
                <Select.Option value={4}>极难</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="difficulty"
            label="技术难点"
          >
            <Input.TextArea rows={2} placeholder="描述技术难点（可选）" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择开始日期"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择结束日期"
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建需求
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
} 