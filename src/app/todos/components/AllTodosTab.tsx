"use client";

import { Select, Button } from "antd";
import { CheckSquare, Plus, Filter } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { IProjectRequirements } from "@/app/model/types/project-requirements";
import { statusConfig } from "./constants";
import { TodoSkeleton } from "./TodoSkeleton";
import { TodoItem } from "./TodoItem";

interface AllTodosTabProps {
    loading: boolean;
    todos: ITodo[];
    timeGroupedTodos: {
        overdue: ITodo[];
        today: ITodo[];
        thisWeek: ITodo[];
        future: ITodo[];
        noDate: ITodo[];
    };
    selectedProject: string;
    selectedStatus: string;
    projectRequirements: IProjectRequirements[];
    onProjectChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onTodoStatusChange: (id: string, status: TodoStatus) => void;
    onTodoDelete: (id: string) => void;
    onTodoEdit: (todo: ITodo) => void;
    onCreateClick: () => void;
}

export function AllTodosTab({
    loading,
    todos,
    timeGroupedTodos,
    selectedProject,
    selectedStatus,
    projectRequirements,
    onProjectChange,
    onStatusChange,
    onTodoStatusChange,
    onTodoDelete,
    onTodoEdit,
    onCreateClick
}: AllTodosTabProps) {
    return (
        <div className="space-y-4">
            {/* 筛选器 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                            <Filter size={16} className="text-gray-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">筛选条件</span>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Select
                            value={selectedProject}
                            onChange={onProjectChange}
                            style={{ width: 200 }}
                            placeholder="选择项目"
                            className="rounded-lg"
                        >
                            <Select.Option value="all">所有项目</Select.Option>
                            {projectRequirements.map((project) => (
                                <Select.Option key={project._id} value={project._id!}>
                                    {project.title}
                                </Select.Option>
                            ))}
                        </Select>

                        <Select
                            value={selectedStatus}
                            onChange={onStatusChange}
                            style={{ width: 200 }}
                            placeholder="选择状态"
                            className="rounded-lg"
                        >
                            <Select.Option value="all">所有状态</Select.Option>
                            {Object.entries(statusConfig).map(([status, config]) => (
                                <Select.Option key={status} value={status}>
                                    {config.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Todo 列表 - 按时间分组 */}
            {loading ? (
                <div className="space-y-4">
                    {Array(4).fill(0).map((_, index) => (
                        <TodoSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : todos.length > 0 ? (
                <div className="space-y-6">
                    {/* 逾期任务 */}
                    {timeGroupedTodos.overdue.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-gray-700 rounded-full"></div>
                                <h3 className="text-sm font-medium text-gray-700">逾期任务 ({timeGroupedTodos.overdue.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {timeGroupedTodos.overdue.map((todo) => (
                                    <TodoItem
                                        key={todo._id}
                                        todo={todo}
                                        onStatusChange={onTodoStatusChange}
                                        onDelete={onTodoDelete}
                                        onEdit={onTodoEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 今日任务 */}
                    {timeGroupedTodos.today.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-gray-600 rounded-full"></div>
                                <h3 className="text-sm font-medium text-gray-700">今日任务 ({timeGroupedTodos.today.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {timeGroupedTodos.today.map((todo) => (
                                    <TodoItem
                                        key={todo._id}
                                        todo={todo}
                                        onStatusChange={onTodoStatusChange}
                                        onDelete={onTodoDelete}
                                        onEdit={onTodoEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 本周任务 */}
                    {timeGroupedTodos.thisWeek.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-gray-500 rounded-full"></div>
                                <h3 className="text-sm font-medium text-gray-700">本周任务 ({timeGroupedTodos.thisWeek.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {timeGroupedTodos.thisWeek.map((todo) => (
                                    <TodoItem
                                        key={todo._id}
                                        todo={todo}
                                        onStatusChange={onTodoStatusChange}
                                        onDelete={onTodoDelete}
                                        onEdit={onTodoEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 未来任务 */}
                    {timeGroupedTodos.future.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                                <h3 className="text-sm font-medium text-gray-700">未来任务 ({timeGroupedTodos.future.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {timeGroupedTodos.future.map((todo) => (
                                    <TodoItem
                                        key={todo._id}
                                        todo={todo}
                                        onStatusChange={onTodoStatusChange}
                                        onDelete={onTodoDelete}
                                        onEdit={onTodoEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 无截止日期 */}
                    {timeGroupedTodos.noDate.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-gray-300 rounded-full"></div>
                                <h3 className="text-sm font-medium text-gray-700">无截止日期 ({timeGroupedTodos.noDate.length})</h3>
                            </div>
                            <div className="space-y-3">
                                {timeGroupedTodos.noDate.map((todo) => (
                                    <TodoItem
                                        key={todo._id}
                                        todo={todo}
                                        onStatusChange={onTodoStatusChange}
                                        onDelete={onTodoDelete}
                                        onEdit={onTodoEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无待办事项</h3>
                    <p className="text-gray-500 mb-6">创建您的第一个任务开始管理工作吧！</p>
                    <Button
                        type="primary"
                        onClick={onCreateClick}
                        icon={<Plus size={16} />}
                        className="bg-gray-800 hover:bg-gray-900 border-gray-800 hover:border-gray-900"
                    >
                        创建任务
                    </Button>
                </div>
            )}
        </div>
    );
} 