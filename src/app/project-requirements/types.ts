import {
    Target,
    Square,
    Clock,
    AlertCircle,
    Pause,
    Briefcase,
    User,
} from "lucide-react";
import { ProjectRequirementsStatus, ProjectRequirementsType } from "@/app/model/types/project-requirements";
import { TodoStatus } from "@/app/model/types/todo";

// 状态配置
export const statusConfig = {
    [ProjectRequirementsStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-700", icon: Square },
    [ProjectRequirementsStatus.IN_PROGRESS]: { label: "进行中", color: "bg-gray-200 text-gray-800", icon: Clock },
    [ProjectRequirementsStatus.COMPLETED]: { label: "已完成", color: "bg-gray-800 text-white", icon: Target },
    [ProjectRequirementsStatus.DELAYED]: { label: "已延期", color: "bg-gray-300 text-gray-900", icon: Pause },
    [ProjectRequirementsStatus.CANCELLED]: { label: "已取消", color: "bg-gray-400 text-white", icon: AlertCircle },
    [ProjectRequirementsStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
    [ProjectRequirementsStatus.ARCHIVED]: { label: "已归档", color: "bg-gray-600 text-white", icon: Target },
};

// 类型配置
export const typeConfig = {
    [ProjectRequirementsType.work]: { label: "工作", color: "bg-gray-200 text-gray-800", icon: Briefcase },
    [ProjectRequirementsType.personal]: { label: "个人", color: "bg-gray-300 text-gray-900", icon: User },
};

// 难度级别配置
export const difficultyConfig: Record<number, { label: string; color: string }> = {
    1: { label: "简单", color: "bg-gray-100 text-gray-700" },
    2: { label: "中等", color: "bg-gray-200 text-gray-800" },
    3: { label: "困难", color: "bg-gray-400 text-white" },
    4: { label: "极难", color: "bg-gray-700 text-white" },
};

// 获取状态颜色
export const getStatusColor = (status: ProjectRequirementsStatus) => {
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
export const getTypeColor = (type: ProjectRequirementsType) => {
    switch (type) {
        case ProjectRequirementsType.work: return 'blue';
        case ProjectRequirementsType.personal: return 'green';
        default: return 'default';
    }
};

// 获取难度级别颜色
export const getDifficultyColor = (level: number) => {
    switch (level) {
        case 1: return 'green';
        case 2: return 'gold';
        case 3: return 'orange';
        case 4: return 'red';
        default: return 'default';
    }
};

// Todo 优先级颜色配置
export const getTodoPriorityColor = (priority: number) => {
    switch (priority) {
        case 1: return 'green';
        case 2: return 'blue';
        case 3: return 'gold';
        case 4: return 'orange';
        case 5: return 'red';
        default: return 'default';
    }
};

// Todo 状态颜色配置
export const getTodoStatusColor = (status: TodoStatus) => {
    switch (status) {
        case TodoStatus.TODO: return 'default';
        case TodoStatus.IN_PROGRESS: return 'blue';
        case TodoStatus.COMPLETED: return 'green';
        case TodoStatus.DELAYED: return 'orange';
        case TodoStatus.CANCELLED: return 'red';
        case TodoStatus.DELETED: return 'default';
        case TodoStatus.ARCHIVED: return 'purple';
        default: return 'default';
    }
}; 