import {
    CheckSquare,
    Square,
    Clock,
    AlertCircle,
    Pause,
} from "lucide-react";
import { TodoStatus } from "@/app/model/types/todo";

// 状态配置
export const statusConfig = {
    [TodoStatus.TODO]: { label: "待办", color: "bg-gray-100 text-gray-700", icon: Square },
    [TodoStatus.IN_PROGRESS]: { label: "进行中", color: "bg-gray-200 text-gray-800", icon: Clock },
    [TodoStatus.COMPLETED]: { label: "已完成", color: "bg-gray-700 text-white", icon: CheckSquare },
    [TodoStatus.DELAYED]: { label: "已延期", color: "bg-gray-400 text-white", icon: Pause },
    [TodoStatus.CANCELLED]: { label: "已取消", color: "bg-gray-300 text-gray-800", icon: AlertCircle },
    [TodoStatus.DELETED]: { label: "已删除", color: "bg-gray-100 text-gray-500", icon: AlertCircle },
    [TodoStatus.ARCHIVED]: { label: "已归档", color: "bg-gray-600 text-white", icon: CheckSquare },
};

// 优先级配置
export const priorityConfig: Record<number, { label: string; color: string }> = {
    1: { label: "低", color: "bg-gray-100 text-gray-700" },
    2: { label: "中低", color: "bg-gray-200 text-gray-800" },
    3: { label: "中", color: "bg-gray-300 text-gray-800" },
    4: { label: "高", color: "bg-gray-500 text-white" },
    5: { label: "紧急", color: "bg-gray-800 text-white" },
}; 