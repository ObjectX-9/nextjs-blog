import { CheckSquare, Square, Edit } from "lucide-react";
import { ITodo, TodoStatus } from "@/app/model/types/todo";
import { IProjectRequirements } from "@/app/model/types/project-requirements";

interface DailyTodoItemProps {
    todo: ITodo;
    onStatusChange: (id: string, status: TodoStatus) => void;
    onEdit: (todo: ITodo) => void;
    type: 'today' | 'overdue' | 'upcoming';
    projectRequirements: IProjectRequirements[];
}

export const DailyTodoItem = ({
    todo,
    onStatusChange,
    onEdit,
    type,
    projectRequirements
}: DailyTodoItemProps) => {
    const handleToggleComplete = () => {
        const newStatus = todo.status === TodoStatus.COMPLETED ? TodoStatus.TODO : TodoStatus.COMPLETED;
        onStatusChange(todo._id!, newStatus);
    };

    // 根据类型获取颜色
    const getTypeColor = () => {
        switch (type) {
            case 'overdue': return 'hover:bg-gray-100';
            case 'today': return 'hover:bg-gray-50';
            case 'upcoming': return 'hover:bg-gray-50';
            default: return 'hover:bg-gray-50';
        }
    };

    // 获取项目名称
    const getProjectName = () => {
        if (!todo.projectId) return null;
        const project = projectRequirements.find(p => p._id === todo.projectId);
        return project?.title;
    };

    const projectName = getProjectName();

    return (
        <div className={`${getTypeColor()} transition-colors group`}>
            <div className="py-3 px-4 flex items-center gap-3">
                {/* 勾选按钮 */}
                <button
                    onClick={handleToggleComplete}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:shadow-sm transition-all"
                >
                    {todo.status === TodoStatus.COMPLETED ? (
                        <CheckSquare size={16} className="text-gray-600" />
                    ) : (
                        <Square size={16} className="text-gray-300 group-hover:text-gray-400" />
                    )}
                </button>

                {/* 主体内容 */}
                <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onEdit(todo)}
                >
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${todo.status === TodoStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {todo.title}
                        </span>
                        {projectName && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 max-w-[120px] truncate flex-shrink-0">
                                {projectName}
                            </span>
                        )}
                    </div>
                    {todo.description && (
                        <div className={`text-xs mt-1 truncate ${todo.status === TodoStatus.COMPLETED ? 'text-gray-300' : 'text-gray-500'}`}>
                            {todo.description}
                        </div>
                    )}
                </div>

                {/* 右侧信息 */}
                <div className="flex items-center gap-2 shrink-0">
                    {todo.priority && todo.priority >= 4 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                            P{todo.priority}
                        </span>
                    )}
                    {todo.dueDate && (
                        <span className="text-xs text-gray-500">
                            {new Date(todo.dueDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                        </span>
                    )}

                    {/* 编辑按钮 - 仅在悬停时显示 */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(todo);
                        }}
                        className="p-1 rounded-full hover:bg-white hover:shadow-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Edit size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}; 