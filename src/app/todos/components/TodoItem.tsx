import { Button } from "antd";
import { Calendar, User } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { statusConfig, priorityConfig } from "./constants";

interface TodoItemProps {
    todo: ITodo;
    onStatusChange: (id: string, status: TodoStatus) => void;
    onDelete: (id: string) => void;
    onEdit: (todo: ITodo) => void;
}

export const TodoItem = ({
    todo,
    onStatusChange,
    onDelete,
    onEdit
}: TodoItemProps) => {
    const StatusIcon = statusConfig[todo.status].icon;
    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() &&
        todo.status !== TodoStatus.COMPLETED && todo.status !== TodoStatus.CANCELLED;

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleStatusToggle = () => {
        const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
        onStatusChange(todo._id!, newStatus);
    };

    // 获取状态标签样式
    const getStatusTagStyle = (status: TodoStatus) => {
        switch (status) {
            case TodoStatus.COMPLETED: return 'bg-gray-100 text-gray-600';
            case TodoStatus.IN_PROGRESS: return 'bg-gray-200 text-gray-700';
            case TodoStatus.DELAYED: return 'bg-gray-300 text-gray-800';
            case TodoStatus.CANCELLED: return 'bg-gray-200 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className={`bg-white rounded-xl border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-5 hover:shadow-lg hover:shadow-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm`}>
            <div className="space-y-3">
                {/* 标题和状态 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={handleStatusToggle}
                            className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <StatusIcon size={18} className={todo.status === TodoStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
                        </button>
                        <h3 className={`font-medium ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {todo.title}
                        </h3>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusTagStyle(todo.status)}`}>
                        {statusConfig[todo.status].label}
                    </span>
                </div>

                {/* 描述 */}
                {todo.description && (
                    <p className="text-sm text-gray-600 ml-7 leading-relaxed">{todo.description}</p>
                )}

                {/* 底部信息 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* 优先级 */}
                        {todo.priority && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig[todo.priority].color}`}>
                                P{todo.priority} · {priorityConfig[todo.priority].label}
                            </span>
                        )}

                        {/* 截止日期 */}
                        {todo.dueDate && (
                            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${isOverdue ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                <Calendar size={12} />
                                {formatDate(todo.dueDate)}
                            </div>
                        )}

                        {/* 子任务数量 */}
                        {todo.subTasks && todo.subTasks.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700">
                                <User size={12} />
                                {todo.subTasks.length} 子任务
                            </div>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                        <Button
                            type="text"
                            size="small"
                            onClick={() => onStatusChange(todo._id!, TodoStatus.IN_PROGRESS)}
                            disabled={todo.status === TodoStatus.IN_PROGRESS}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            开始
                        </Button>
                        <Button
                            type="text"
                            size="small"
                            onClick={() => onEdit(todo)}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            编辑
                        </Button>
                        <Button
                            type="text"
                            size="small"
                            onClick={() => onDelete(todo._id!)}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            删除
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 