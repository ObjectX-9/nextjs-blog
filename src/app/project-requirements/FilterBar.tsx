import { Select } from "antd";
import { Filter } from "lucide-react";
import { statusConfig, typeConfig, difficultyConfig } from "./types";

interface FilterBarProps {
    selectedType: string;
    selectedStatus: string;
    selectedDifficulty: string;
    onTypeChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDifficultyChange: (value: string) => void;
}

export const FilterBar = ({
    selectedType,
    selectedStatus,
    selectedDifficulty,
    onTypeChange,
    onStatusChange,
    onDifficultyChange
}: FilterBarProps) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">筛选：</span>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Select
                        value={selectedType}
                        onChange={onTypeChange}
                        style={{ width: 150 }}
                        placeholder="选择类型"
                    >
                        <Select.Option value="all">所有类型</Select.Option>
                        {Object.entries(typeConfig).map(([type, config]) => (
                            <Select.Option key={type} value={type}>
                                {config.label}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        value={selectedStatus}
                        onChange={onStatusChange}
                        style={{ width: 150 }}
                        placeholder="选择状态"
                    >
                        <Select.Option value="all">所有状态</Select.Option>
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <Select.Option key={status} value={status}>
                                {config.label}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        value={selectedDifficulty}
                        onChange={onDifficultyChange}
                        style={{ width: 150 }}
                        placeholder="选择难度"
                    >
                        <Select.Option value="all">所有难度</Select.Option>
                        {Object.entries(difficultyConfig).map(([level, config]) => (
                            <Select.Option key={level} value={level}>
                                {config.label}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
}; 