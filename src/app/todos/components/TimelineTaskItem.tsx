import { CheckSquare, Square, Edit } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { statusConfig, priorityConfig } from "./constants";

interface TimelineTaskItemProps {
    todo: ITodo;
    onStatusChange: (id: string, status: TodoStatus) => void;
    onEdit: (todo: ITodo) => void;
}

export const TimelineTaskItem = ({
    todo,
    onStatusChange,
    onEdit
}: TimelineTaskItemProps) => {
    const handleToggleComplete = () => {
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
        <div className="flex group">
            {/* 左侧时间线 */}
            <div className="flex flex-col items-center mr-6">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 shadow-sm mb-1 border-2 border-white"></div>
                <div className="w-0.5 bg-gray-200 flex-1"></div>
            </div>

            {/* 任务内容 */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-lg hover:shadow-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleComplete}
                            className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {todo.status === TodoStatus.COMPLETED ? (
                                <CheckSquare size={16} className="text-green-600" />
                            ) : (
                                <Square size={16} className="text-gray-300" />
                            )}
                        </button>
                        <h4 className={`text-sm font-medium ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {todo.title}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2">
                        {todo.priority && todo.priority >= 4 && (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold ${priorityConfig[todo.priority].color}`}>
                                P{todo.priority}
                            </span>
                        )}
                        <button
                            onClick={() => onEdit(todo)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                            <Edit size={14} />
                        </button>
                    </div>
                </div>
                {todo.description && (
                    <p className="text-xs text-gray-600 ml-8 mb-3 leading-relaxed">{todo.description}</p>
                )}
                <div className="flex items-center justify-between ml-8">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${getStatusTagStyle(todo.status)}`}>
                        {statusConfig[todo.status].label}
                    </span>
                </div>
            </div>
        </div>
    );
}; 