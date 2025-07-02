import { useState, useEffect, useCallback } from "react";
import { CheckSquare } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { IProjectRequirements } from "@/app/model/types/project-requirements";
import { todosBusiness } from "../../business/todos";
import { DailyTodoItem } from "./DailyTodoItem";

interface DailyTodoModuleProps {
    onStatusChange: (id: string, status: TodoStatus) => void;
    onEdit: (todo: ITodo) => void;
    refreshTrigger?: number;
    projectRequirements: IProjectRequirements[];
}

export const DailyTodoModule = ({
    onStatusChange,
    onEdit,
    refreshTrigger,
    projectRequirements
}: DailyTodoModuleProps) => {
    const [todayTodos, setTodayTodos] = useState<ITodo[]>([]);
    const [overdueTodos, setOverdueTodos] = useState<ITodo[]>([]);
    const [upcomingTodos, setUpcomingTodos] = useState<ITodo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDailyTodos = useCallback(async () => {
        try {
            setLoading(true);
            const [today, overdue, upcoming] = await Promise.all([
                todosBusiness.getTodayDueTodos(),
                todosBusiness.getOverdueTodos(),
                todosBusiness.getUpcomingTodos()
            ]);

            setTodayTodos(today);
            setOverdueTodos(overdue);
            setUpcomingTodos(upcoming.slice(0, 3)); // 只显示前3个即将到期的任务
        } catch (error) {
            console.error("获取每日任务失败:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDailyTodos();
    }, [fetchDailyTodos]);

    // 监听外部刷新触发器
    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            fetchDailyTodos();
        }
    }, [refreshTrigger, fetchDailyTodos]);

    // 按项目分组逾期任务
    const groupOverdueByProject = () => {
        const groups: Record<string, { project: IProjectRequirements | null, todos: ITodo[] }> = {};

        // 先处理有项目的任务
        overdueTodos.forEach(todo => {
            if (todo.projectId) {
                const projectId = todo.projectId;
                if (!groups[projectId]) {
                    const project = projectRequirements.find(p => p._id === projectId) || null;
                    groups[projectId] = { project, todos: [] };
                }
                groups[projectId].todos.push(todo);
            }
        });

        // 再处理没有项目的任务
        const noProjectTodos = overdueTodos.filter(todo => !todo.projectId);
        if (noProjectTodos.length > 0) {
            groups['no-project'] = { project: null, todos: noProjectTodos };
        }

        return Object.values(groups);
    };

    const overdueProjectGroups = groupOverdueByProject();

    const today = new Date();
    const formatDate = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="flex justify-between mb-6">
                    <div className="h-6 w-40 bg-gray-100 rounded"></div>
                    <div className="h-6 w-20 bg-gray-100 rounded"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-50 rounded p-4">
                            <div className="flex justify-between mb-3">
                                <div className="h-5 w-24 bg-gray-100 rounded"></div>
                                <div className="h-5 w-10 bg-gray-100 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                {[1, 2].map(j => (
                                    <div key={j} className="h-4 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalDailyTasks = todayTodos.length + overdueTodos.length;
    const completedTasks = [...todayTodos, ...overdueTodos].filter(t => t.status === TodoStatus.COMPLETED).length;
    const progressPercentage = totalDailyTasks > 0 ? Math.round((completedTasks / totalDailyTasks) * 100) : 0;

    return (
        <div>
            {/* 头部进度 */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{formatDate}</p>
                    <div className="text-sm font-medium">{progressPercentage}% 完成</div>
                </div>
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gray-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="space-y-6">
                {/* 今日待办 - 包含逾期和今日任务 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gray-800 rounded-full"></div>
                            <h3 className="text-sm font-semibold text-gray-800">今日待办</h3>
                        </div>
                        <span className="text-sm text-gray-700 font-medium bg-gray-200 px-3 py-1 rounded-full">{overdueTodos.length + todayTodos.length}项</span>
                    </div>

                    {overdueTodos.length > 0 || todayTodos.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {/* 逾期任务 */}
                            {overdueTodos.length > 0 && (
                                <div className="py-3 px-5 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                                            <h4 className="text-xs font-medium text-gray-700">逾期任务 ({overdueTodos.length})</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {overdueTodos.map(todo => (
                                            <DailyTodoItem
                                                key={todo._id}
                                                todo={todo}
                                                onStatusChange={onStatusChange}
                                                onEdit={onEdit}
                                                type="overdue"
                                                projectRequirements={projectRequirements}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 今日任务 */}
                            {todayTodos.length > 0 && (
                                <div className="py-3 px-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                                        <h4 className="text-xs font-medium text-gray-700">今日截止 ({todayTodos.length})</h4>
                                    </div>
                                    <div className="space-y-1">
                                        {todayTodos.map(todo => (
                                            <DailyTodoItem
                                                key={todo._id}
                                                todo={todo}
                                                onStatusChange={onStatusChange}
                                                onEdit={onEdit}
                                                type="today"
                                                projectRequirements={projectRequirements}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <CheckSquare size={24} className="mx-auto mb-2 text-gray-300" />
                            <div className="text-sm">今日无待办任务</div>
                        </div>
                    )}
                </div>

                {/* 逾期项目分类 */}
                {overdueTodos.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-gray-700 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">逾期项目分类</h3>
                            </div>
                            <span className="text-sm text-gray-700 font-medium bg-gray-300 px-3 py-1 rounded-full">{overdueProjectGroups.length}项</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {overdueProjectGroups.map((group, index) => (
                                <div key={group.project?._id || 'no-project'} className="py-4 px-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {group.project ? (
                                                <span className="text-sm font-medium text-gray-800">{group.project.title}</span>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-600">未分类任务</span>
                                            )}
                                            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600 font-medium">
                                                {group.todos.length}项
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pl-3">
                                        {group.todos.map(todo => (
                                            <DailyTodoItem
                                                key={todo._id}
                                                todo={todo}
                                                onStatusChange={onStatusChange}
                                                onEdit={onEdit}
                                                type="overdue"
                                                projectRequirements={projectRequirements}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 即将到期 */}
                {upcomingTodos.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-gray-600 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">即将到期</h3>
                            </div>
                            <span className="text-sm text-gray-700 font-medium bg-gray-200 px-3 py-1 rounded-full">{upcomingTodos.length}项</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingTodos.map(todo => (
                                <DailyTodoItem
                                    key={todo._id}
                                    todo={todo}
                                    onStatusChange={onStatusChange}
                                    onEdit={onEdit}
                                    type="upcoming"
                                    projectRequirements={projectRequirements}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 