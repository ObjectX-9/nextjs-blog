import { Tag } from "antd";
import { CheckCircle, Circle } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { getTodoStatusColor, getTodoPriorityColor } from "./types";

interface TodoMiniItemProps {
    todo: ITodo;
    onStatusChange?: (id: string, status: TodoStatus) => void;
}

export const TodoMiniItem = ({ todo, onStatusChange }: TodoMiniItemProps) => {
    const handleToggleComplete = () => {
        if (onStatusChange) {
            const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
            onStatusChange(todo._id!, newStatus);
        }
    };

    return (
        <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded text-sm">
            <button
                onClick={handleToggleComplete}
                className="flex-shrink-0"
            >
                {todo.status === TodoStatus.COMPLETED ? (
                    <CheckCircle size={14} className="text-green-600" />
                ) : (
                    <Circle size={14} className="text-gray-400" />
                )}
            </button>
            <span className={`flex-1 truncate ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
            </span>
            <div className="flex gap-1">
                <Tag color={getTodoStatusColor(todo.status)}>
                    {todo.status === TodoStatus.TODO ? '待办' :
                        todo.status === TodoStatus.IN_PROGRESS ? '进行中' :
                            todo.status === TodoStatus.COMPLETED ? '完成' : '其他'}
                </Tag>
                <Tag color={getTodoPriorityColor(todo.priority || 3)}>
                    P{todo.priority || 3}
                </Tag>
            </div>
        </div>
    );
}; 