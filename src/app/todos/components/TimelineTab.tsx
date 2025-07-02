"use client";

import { Select, Button } from "antd";
import { CheckSquare, Plus, Filter } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { IProjectRequirements } from "@/app/model/types/project-requirements";
import { statusConfig } from "./constants";
import { TimelineTaskItem } from "./TimelineTaskItem";

interface TimelineTabProps {
    loading: boolean;
    timelineTodos: {
        [year: string]: {
            [month: string]: {
                [day: string]: ITodo[]
            }
        }
    };
    selectedProject: string;
    selectedStatus: string;
    projectRequirements: IProjectRequirements[];
    onProjectChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onTodoStatusChange: (id: string, status: TodoStatus) => void;
    onTodoEdit: (todo: ITodo) => void;
    onCreateClick: () => void;
}

export function TimelineTab({
    loading,
    timelineTodos,
    selectedProject,
    selectedStatus,
    projectRequirements,
    onProjectChange,
    onStatusChange,
    onTodoStatusChange,
    onTodoEdit,
    onCreateClick
}: TimelineTabProps) {
    return (
        <div className="space-y-6">
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

            {/* 时间线内容 */}
            {loading ? (
                <div className="space-y-4">
                    {Array(4).fill(0).map((_, index) => (
                        <div key={`skeleton-${index}`} className="animate-pulse">
                            <div className="h-6 w-32 bg-gray-100 rounded mb-3"></div>
                            <div className="flex">
                                <div className="w-3 h-3 rounded-full bg-gray-100 mr-4"></div>
                                <div className="flex-1 h-20 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : Object.keys(timelineTodos).length > 0 ? (
                <div className="space-y-8">
                    {Object.keys(timelineTodos).sort((a, b) => {
                        // 将"无截止日期"排在最后
                        if (a === '无截止日期') return 1;
                        if (b === '无截止日期') return -1;
                        // 其他按年份倒序排列
                        return parseInt(b) - parseInt(a);
                    }).map(year => (
                        <div key={year} className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                                {year === '无截止日期' ? '无截止日期' : `${year}年`}
                            </h3>

                            {Object.keys(timelineTodos[year]).sort((a, b) => {
                                if (a === '00') return 1;
                                if (b === '00') return -1;
                                return parseInt(b) - parseInt(a);
                            }).map(month => (
                                <div key={`${year}-${month}`} className="ml-4 space-y-4">
                                    {month !== '00' && (
                                        <h4 className="text-md font-medium text-gray-600">
                                            {month}月
                                        </h4>
                                    )}

                                    {Object.keys(timelineTodos[year][month]).sort((a, b) => {
                                        if (a === '00') return 1;
                                        if (b === '00') return -1;
                                        return parseInt(b) - parseInt(a);
                                    }).map(day => (
                                        <div key={`${year}-${month}-${day}`} className="ml-4">
                                            {day !== '00' && (
                                                <h5 className="text-sm font-medium text-gray-500 mb-2">
                                                    {day}日 ({timelineTodos[year][month][day].length}项)
                                                </h5>
                                            )}

                                            <div className="space-y-0">
                                                {timelineTodos[year][month][day].map(todo => (
                                                    <TimelineTaskItem
                                                        key={todo._id}
                                                        todo={todo}
                                                        onStatusChange={onTodoStatusChange}
                                                        onEdit={onTodoEdit}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
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