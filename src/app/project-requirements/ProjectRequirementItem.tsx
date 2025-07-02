import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
    Target,
    Calendar,
    Code,
    AlertCircle,
    BookOpen,
    ExternalLink,
    Edit,
    FileText,
    Settings,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { IProjectRequirements, ProjectRequirementsStatus } from "@/app/model/types/project-requirements";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { IStack } from "@/app/model/stack";
import { Article } from "@/app/model/article";
import { todosBusiness } from "../business/todos";
import { statusConfig, typeConfig, difficultyConfig } from "./types";
import { StatusSelector } from "./StatusSelector";
import { TodoMiniItem } from "./TodoMiniItem";

interface ProjectRequirementItemProps {
    requirement: IProjectRequirements;
    onStatusChange: (id: string, status: ProjectRequirementsStatus) => void;
    onDelete: (id: string) => void;
    onEdit: (requirement: IProjectRequirements) => void;
    todoStat?: { total: number; completed: number };
    onTodoUpdated?: () => void;
    stacks: IStack[];
    articles: Article[];
}

export const ProjectRequirementItem = ({
    requirement,
    onStatusChange,
    onDelete,
    onEdit,
    todoStat,
    onTodoUpdated,
    stacks,
    articles
}: ProjectRequirementItemProps) => {
    const [todos, setTodos] = useState<ITodo[]>([]);
    const [loadingTodos, setLoadingTodos] = useState(false);
    const [showTodos, setShowTodos] = useState(false);

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

    // 获取项目相关的技术栈信息
    const getProjectStacks = () => {
        if (!requirement.techStack || requirement.techStack.length === 0) return [];
        return requirement.techStack
            .map(stackId => stacks.find(stack => stack._id === stackId))
            .filter((stack): stack is IStack => !!stack);
    };

    // 获取内部文章的真实标题
    const getArticleTitle = (articleId: string) => {
        const article = articles.find(a => a._id === articleId);
        return article ? article.title : '文章不存在';
    };

    // 获取项目相关的todo任务
    const fetchProjectTodos = async () => {
        if (!requirement._id) return;

        try {
            setLoadingTodos(true);
            const projectTodos = await todosBusiness.getProjectTodos(requirement._id);
            setTodos(projectTodos);
        } catch (error) {
            console.error("获取项目todo失败:", error);
        } finally {
            setLoadingTodos(false);
        }
    };

    // 处理todo状态变更
    const handleTodoStatusChange = async (todoId: string, status: TodoStatus) => {
        try {
            await todosBusiness.updateTodo(todoId, { status });
            // 重新获取todo列表
            await fetchProjectTodos();
            // 通知父组件更新统计
            onTodoUpdated?.();
        } catch (error) {
            console.error("更新todo状态失败:", error);
        }
    };

    // 切换显示todo列表
    const toggleShowTodos = () => {
        setShowTodos(!showTodos);
        if (!showTodos && todos.length === 0) {
            fetchProjectTodos();
        }
    };

    return (
        <Card className={`p-5 transition-all hover:shadow-lg hover:shadow-gray-200 border border-gray-200 bg-white rounded-xl ${isOverdue ? 'ring-2 ring-red-200 bg-red-50 border-red-200' : 'shadow-sm hover:border-gray-300'}`}>
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
                    <StatusSelector
                        status={requirement.status}
                        onChange={(newStatus) => onStatusChange(requirement._id!, newStatus)}
                        size="default"
                    />
                </div>

                {/* 描述 */}
                <div className="ml-10">
                    <p className="text-sm text-gray-600">{requirement.description}</p>
                </div>

                {/* 底部信息 */}
                <div className="flex gap-2 flex-col  ml-10">
                    <div className="flex items-center gap-2">
                        {/* 类型 */}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${typeConfig[requirement.type].color}`}>
                            <TypeIcon size={12} className="mr-1" />
                            {typeConfig[requirement.type].label}
                        </span>

                        {/* 难度级别 */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${difficultyConfig[requirement.difficultyLevel || 2].color}`}>
                            {difficultyConfig[requirement.difficultyLevel || 2].label}
                        </span>

                        {/* 结束日期 */}
                        {requirement.endDate && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                <Calendar size={12} className="mr-1" />
                                {formatDate(requirement.endDate)}
                            </span>
                        )}

                        {/* 技术栈信息 */}
                        {getProjectStacks().length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                                <Code size={12} className="mr-1" />
                                {getProjectStacks().length} 技术栈
                            </span>
                        )}

                        {/* 技术难点 */}
                        {requirement.difficulty && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-300 text-gray-900">
                                <AlertCircle size={12} className="mr-1" />
                                有难点
                            </span>
                        )}

                        {/* 关联文档 */}
                        {requirement.relatedDocs && requirement.relatedDocs.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                                <BookOpen size={12} className="mr-1" />
                                {requirement.relatedDocs.length} 文档
                            </span>
                        )}

                        {/* 关联 Todo 数量 */}
                        <div className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" onClick={toggleShowTodos}>
                            <Target size={14} />
                            <span>
                                {showTodos ? todos.length : (todoStat?.total || 0)} 任务
                                {todoStat && todoStat.total > 0 && (
                                    <span className="text-gray-800 ml-1">
                                        ({todoStat.completed}/{todoStat.total})
                                    </span>
                                )}
                            </span>
                            {showTodos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>

                        {/* 技术方案状态 */}
                        {requirement.techSolutionOssPath && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Edit size={14} />
                                有方案
                            </div>
                        )}

                        {/* 反思笔记状态 */}
                        {requirement.reflectionOssPath && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <FileText size={14} />
                                有反思
                            </div>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => onEdit(requirement)}
                            title="编辑基本信息"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                            <Settings size={12} className="mr-1.5" />
                            编辑
                        </button>
                        <button
                            onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/tech-solution`}
                            title={requirement.techSolutionOssPath ? "编辑技术方案" : "创建技术方案"}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.techSolutionOssPath
                                ? "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                                : "text-blue-600 bg-white border border-blue-200 hover:bg-blue-50"
                                }`}
                        >
                            <Edit size={12} className="mr-1.5" />
                            {requirement.techSolutionOssPath ? "方案✓" : "方案"}
                        </button>
                        <button
                            onClick={() => window.location.href = `/admin/project-requirements/edit/${requirement._id}/reflection`}
                            title={requirement.reflectionOssPath ? "编辑反思笔记" : "创建反思笔记"}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.reflectionOssPath
                                ? "text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100"
                                : "text-purple-600 bg-white border border-purple-200 hover:bg-purple-50"
                                }`}
                        >
                            <FileText size={12} className="mr-1.5" />
                            {requirement.reflectionOssPath ? "反思✓" : "反思"}
                        </button>
                        <button
                            onClick={() => onStatusChange(requirement._id!, ProjectRequirementsStatus.IN_PROGRESS)}
                            disabled={requirement.status === ProjectRequirementsStatus.IN_PROGRESS}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${requirement.status === ProjectRequirementsStatus.IN_PROGRESS
                                ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                                : "text-green-600 bg-white border border-green-200 hover:bg-green-50"
                                }`}
                        >
                            开始
                        </button>
                        <button
                            onClick={() => onDelete(requirement._id!)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                            删除
                        </button>
                    </div>
                </div>

                {/* Todo 任务列表 */}
                {showTodos && (
                    <div className="mt-4 pt-4 border-t border-gray-200 ml-10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700">相关任务</h4>
                                {loadingTodos && <span className="text-xs text-gray-500">加载中...</span>}
                            </div>

                            {!loadingTodos && todos.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {todos.map(todo => (
                                        <TodoMiniItem
                                            key={todo._id}
                                            todo={todo}
                                            onStatusChange={handleTodoStatusChange}
                                        />
                                    ))}
                                </div>
                            ) : !loadingTodos && todos.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-2">
                                    暂无相关任务
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* 技术栈详情和技术难点 */}
                {(getProjectStacks().length > 0 || requirement.difficulty || (requirement.relatedDocs && requirement.relatedDocs.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 ml-10">
                        <div className="space-y-4">
                            {/* 技术栈 */}
                            {getProjectStacks().length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">相关技术栈</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getProjectStacks().map(stack => (
                                            <div key={stack._id} className="flex items-center gap-2 py-1 px-3 bg-gray-100 rounded-lg text-sm">
                                                {stack.iconSrc && (
                                                    <img
                                                        src={stack.iconSrc}
                                                        alt={stack.title}
                                                        className="w-4 h-4 object-contain"
                                                        onError={(e) => {
                                                            // 如果图片加载失败，隐藏图片
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <span className="text-gray-800 font-medium">{stack.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 技术难点 */}
                            {requirement.difficulty && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">技术难点</h4>
                                    <div className="p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300">
                                        <p className="text-sm text-gray-800">{requirement.difficulty}</p>
                                    </div>
                                </div>
                            )}

                            {/* 关联文档 */}
                            {requirement.relatedDocs && requirement.relatedDocs.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">关联文档</h4>
                                    <div className="space-y-2">
                                        {requirement.relatedDocs.map((doc, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                {doc.type === 'article' ? (
                                                    <BookOpen size={14} className="text-gray-600 flex-shrink-0" />
                                                ) : (
                                                    <ExternalLink size={14} className="text-gray-600 flex-shrink-0" />
                                                )}
                                                {doc.type === 'article' ? (
                                                    <a
                                                        href={`/articles/${doc.value}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-700 hover:text-gray-900 underline truncate"
                                                    >
                                                        {getArticleTitle(doc.value)}
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={doc.value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-700 hover:text-gray-900 underline truncate"
                                                    >
                                                        {doc.title}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}; 