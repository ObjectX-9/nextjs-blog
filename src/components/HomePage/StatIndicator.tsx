"use client";

import React, { memo } from "react";

// 状态指示器组件
const StatIndicator = memo(({
    icon,
    label,
    value,
    bgColor,
    iconColor,
    onClick,
    isDisabled,
    title
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    bgColor: string;
    iconColor: string;
    onClick?: () => void;
    isDisabled?: boolean;
    title?: string;
}) => (
    <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 ${bgColor} ${onClick && !isDisabled ? "cursor-pointer hover:scale-105 transition-all duration-200" :
            isDisabled ? "cursor-not-allowed" : ""
            }`}
        onClick={isDisabled ? undefined : onClick}
        title={title}
    >
        {React.cloneElement(icon as React.ReactElement, {
            className: `w-4 h-4 ${iconColor} translate-y-[1px]`
        })}
        <span className="text-sm whitespace-nowrap">{label}</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center whitespace-nowrap">
            {value}
        </span>
    </div>
));

StatIndicator.displayName = 'StatIndicator';

export default StatIndicator;