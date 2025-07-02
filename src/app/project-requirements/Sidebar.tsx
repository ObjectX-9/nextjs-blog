import { Target, Calendar } from "lucide-react";
import { IProjectRequirements } from "@/app/model/types/project-requirements";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    stats: any;
    projectRequirements: IProjectRequirements[];
    onTimelineGroup: (requirements: IProjectRequirements[]) => void;
}

export const Sidebar = ({
    activeTab,
    onTabChange,
    stats,
    projectRequirements,
    onTimelineGroup
}: SidebarProps) => {
    const handleTabClick = (tab: string) => {
        onTabChange(tab);
        if (tab === 'timeline' && activeTab !== 'timeline') {
            onTimelineGroup(projectRequirements);
        }
    };

    return (
        <div className="w-64 border-r border-gray-200 h-full flex-shrink-0 overflow-y-auto">
            {/* 标题部分 */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-medium text-gray-800">项目需求</h1>
                <p className="text-sm text-gray-500 mt-1">管理您的项目需求和开发计划</p>
            </div>

            {/* 分类列表/视图切换 */}
            <div className="py-4 px-3">
                <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">视图</h3>
                <div className="space-y-2">
                    <div
                        className={`group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${activeTab === 'all'
                            ? 'bg-white shadow-md border border-gray-200 text-gray-800'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => handleTabClick('all')}
                    >
                        <div className={`relative p-2 rounded-lg transition-all duration-200 ${activeTab === 'all'
                            ? 'bg-gray-800 shadow-sm'
                            : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            <Target size={16} className={activeTab === 'all' ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <span className="text-sm font-medium">全部需求</span>
                        {activeTab === 'all' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-800 rounded-r"></div>
                        )}
                    </div>

                    <div
                        className={`group relative flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${activeTab === 'timeline'
                            ? 'bg-white shadow-md border border-gray-200 text-gray-800'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => handleTabClick('timeline')}
                    >
                        <div className={`relative p-2 rounded-lg transition-all duration-200 ${activeTab === 'timeline'
                            ? 'bg-gray-800 shadow-sm'
                            : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            <Calendar size={16} className={activeTab === 'timeline' ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <span className="text-sm font-medium">时间线</span>
                        {activeTab === 'timeline' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-800 rounded-r"></div>
                        )}
                    </div>
                </div>
            </div>

            {/* 统计信息 */}
            {stats && (
                <div className="px-4 py-4 mt-2 border-t border-gray-200">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">统计信息</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-sm text-gray-600">总需求</span>
                            </div>
                            <span className="text-sm font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                <span className="text-sm text-gray-600">已完成</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{stats.completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                                <span className="text-sm text-gray-600">进行中</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{stats.inProgress}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <span className="text-sm text-gray-600">完成率</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{stats.completionRate}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 