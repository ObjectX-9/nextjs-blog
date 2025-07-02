import { Dropdown } from "antd";
import { ChevronDown } from "lucide-react";
import { ProjectRequirementsStatus } from "@/app/model/types/project-requirements";
import { statusConfig } from "./types";

interface StatusSelectorProps {
    status: ProjectRequirementsStatus;
    onChange: (status: ProjectRequirementsStatus) => void;
    size?: 'small' | 'default';
}

export const StatusSelector = ({
    status,
    onChange,
    size = 'default'
}: StatusSelectorProps) => {
    const currentConfig = statusConfig[status];
    const StatusIcon = currentConfig.icon;

    const menuItems = Object.entries(statusConfig).map(([statusKey, config]) => {
        const Icon = config.icon;
        return {
            key: statusKey,
            label: (
                <div className="flex items-center gap-2 py-1">
                    <div className={`p-1 rounded ${config.color}`}>
                        <Icon size={12} />
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                </div>
            ),
            onClick: () => onChange(statusKey as ProjectRequirementsStatus),
        };
    });

    const sizeClasses = size === 'small'
        ? 'px-2 py-1 text-xs'
        : 'px-3 py-1.5 text-sm';

    return (
        <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
        >
            <div className={`inline-flex items-center gap-2 ${sizeClasses} rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md`}>
                <div className={`p-1 rounded ${currentConfig.color}`}>
                    <StatusIcon size={size === 'small' ? 10 : 12} />
                </div>
                <span className="font-medium">{currentConfig.label}</span>
                <ChevronDown size={size === 'small' ? 12 : 14} className="text-gray-400" />
            </div>
        </Dropdown>
    );
}; 