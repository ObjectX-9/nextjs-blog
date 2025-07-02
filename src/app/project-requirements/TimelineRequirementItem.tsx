import {
    Edit,
    Code,
    AlertCircle,
    Calendar,
    BookOpen,
    ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { IProjectRequirements, ProjectRequirementsStatus } from "@/app/model/types/project-requirements";
import { IStack } from "@/app/model/stack";
import { Article } from "@/app/model/article";
import { statusConfig, typeConfig, difficultyConfig } from "./types";
import { StatusSelector } from "./StatusSelector";

interface TimelineRequirementItemProps {
    requirement: IProjectRequirements;
    onStatusChange: (id: string, status: ProjectRequirementsStatus) => void;
    onEdit: (requirement: IProjectRequirements) => void;
    stacks: IStack[];
    articles: Article[];
    isMobile?: boolean;
}

export const TimelineRequirementItem = ({
    requirement,
    onStatusChange,
    onEdit,
    stacks,
    articles,
    isMobile = false
}: TimelineRequirementItemProps) => {
    const StatusIcon = statusConfig[requirement.status].icon;
    const TypeIcon = typeConfig[requirement.type].icon;

    const handleStatusToggle = () => {
        const newStatus = requirement.status === ProjectRequirementsStatus.COMPLETED ?
            ProjectRequirementsStatus.TODO : ProjectRequirementsStatus.COMPLETED;
        onStatusChange(requirement._id!, newStatus);
    };

    // 获取项目相关的技术栈信息
    const getProjectStacks = () => {
        if (!requirement.techStack || requirement.techStack.length === 0) return [];
        return requirement.techStack
            .map(stackId => stacks.find(stack => stack._id === stackId))
            .filter((stack): stack is IStack => !!stack);
    };

    // 获取内部文章的真实标题
    const getArticleTitle = (articleId: string) => {
        const article = articles.find(a => a._id === articleId);
        return article ? article.title : '文章不存在';
    };

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex group">
            {/* 左侧时间线 */}
            <div className={`flex flex-col items-center ${isMobile ? 'mr-3' : 'mr-6'}`}>
                <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-gray-400 shadow-md mb-1 border-2 border-white`}></div>
                <div className="w-0.5 bg-gray-300 flex-1"></div>
            </div>

            {/* 需求内容 */}
            <div className={`flex-1 bg-white border border-gray-200 shadow-sm rounded-xl ${isMobile ? 'p-3 mb-4' : 'p-5 mb-6'} hover:shadow-lg hover:shadow-gray-200 hover:border-gray-300 transition-all duration-200`}>
                <div className="space-y-3">
                    {/* 标题和状态 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                onClick={handleStatusToggle}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <StatusIcon size={18} className={requirement.status === ProjectRequirementsStatus.COMPLETED ? 'text-green-600' : 'text-gray-400'} />
                            </button>
                            <h3 className={`font-medium ${requirement.status === ProjectRequirementsStatus.COMPLETED ? 'line-through text-gray-500' : ''}`}>
                                {requirement.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusSelector
                                status={requirement.status}
                                onChange={(newStatus) => onStatusChange(requirement._id!, newStatus)}
                                size="small"
                            />
                            <button
                                onClick={() => onEdit(requirement)}
                                className="p-1 rounded-full hover:bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit size={14} />
                            </button>
                        </div>
                    </div>

                    {/* 描述 */}
                    <div className="ml-10">
                        <p className="text-sm text-gray-600">{requirement.description}</p>
                    </div>

                    {/* 底部信息 */}
                    <div className="flex flex-col gap-2 ml-10">
                        <div className="flex items-center gap-2">
                            {/* 类型 */}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${typeConfig[requirement.type].color}`}>
                                <TypeIcon size={12} className="mr-1" />
                                {typeConfig[requirement.type].label}
                            </span>

                            {/* 难度级别 */}
                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${difficultyConfig[requirement.difficultyLevel || 2].color}`}>
                                {difficultyConfig[requirement.difficultyLevel || 2].label}
                            </span>

                            {/* 技术栈信息 */}
                            {getProjectStacks().length > 0 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
                                    <Code size={12} className="mr-1" />
                                    {getProjectStacks().length} 技术栈
                                </span>
                            )}

                            {/* 技术难点 */}
                            {requirement.difficulty && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-300 text-gray-900">
                                    <AlertCircle size={12} className="mr-1" />
                                    有难点
                                </span>
                            )}
                        </div>

                        {/* 创建时间 */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(requirement.createdAt)}
                        </span>
                    </div>

                    {/* 技术栈详情和技术难点 */}
                    {(getProjectStacks().length > 0 || requirement.difficulty || (requirement.relatedDocs && requirement.relatedDocs.length > 0)) && (
                        <div className="ml-10 mt-3 pt-3 border-t border-gray-100">
                            <div className="space-y-3">
                                {/* 技术栈 */}
                                {getProjectStacks().length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-600 mb-2">相关技术栈</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {getProjectStacks().map(stack => (
                                                <div key={stack._id} className="flex items-center gap-2 py-1 px-3 bg-gray-100 rounded-lg text-sm">
                                                    {stack.iconSrc && (
                                                        <Image
                                                            src={stack.iconSrc}
                                                            alt={stack.title}
                                                            className="w-4 h-4 object-contain"
                                                            width={16}
                                                            height={16}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <span className="text-gray-800 font-medium">{stack.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 技术难点 */}
                                {requirement.difficulty && (
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-600 mb-2">技术难点</h5>
                                        <div className="p-2 bg-gray-100 rounded text-xs text-gray-800 border-l-2 border-gray-300">
                                            {requirement.difficulty}
                                        </div>
                                    </div>
                                )}

                                {/* 关联文档 */}
                                {requirement.relatedDocs && requirement.relatedDocs.length > 0 && (
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-600 mb-2">关联文档</h5>
                                        <div className="space-y-1">
                                            {requirement.relatedDocs.map((doc, index) => (
                                                <div key={index} className="flex items-center gap-2 text-xs">
                                                    {doc.type === 'article' ? (
                                                        <BookOpen size={12} className="text-gray-600 flex-shrink-0" />
                                                    ) : (
                                                        <ExternalLink size={12} className="text-gray-600 flex-shrink-0" />
                                                    )}
                                                    {doc.type === 'article' ? (
                                                        <a
                                                            href={`/articles/${doc.value}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-700 hover:text-gray-900 underline truncate"
                                                        >
                                                            {getArticleTitle(doc.value)}
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={doc.value}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-700 hover:text-gray-900 underline truncate"
                                                        >
                                                            {doc.title}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 