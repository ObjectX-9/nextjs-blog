"use client";

import { FitnessRecordCard } from "./components/FitnessRecordCard";
import { IFitnessRecord } from "@/app/model/fitness";
import { fitnessBusiness } from "@/app/business/fitness";
import { useState, useEffect } from 'react';
import PageHeader from "@/components/PageHeader";

export default function Fitness() {
    const [fitnessRecords, setFitnessRecords] = useState<IFitnessRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFitnessRecords = async () => {
            try {
                const records = await fitnessBusiness.getFitnessRecords();
                setFitnessRecords(records);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取健身记录失败');
            } finally {
                setLoading(false);
            }
        };

        fetchFitnessRecords();
    }, []);

    // Group records by year-month
    const recordsByMonth = fitnessRecords.reduce((acc, record) => {
        const date = new Date(record.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[yearMonth]) {
            acc[yearMonth] = [];
        }
        acc[yearMonth].push(record);
        return acc;
    }, {} as Record<string, IFitnessRecord[]>);

    // Sort months in descending order
    const months = Object.keys(recordsByMonth).sort((a, b) => b.localeCompare(a));

    if (loading) {
        return (
            <main className="flex-1 h-screen overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="mb-8">
                                    <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                                    <div className="space-y-4">
                                        {[1, 2].map((j) => (
                                            <div key={j} className="h-32 bg-gray-100 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-1 h-screen overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 h-screen overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
                <div className="w-full max-w-4xl mx-auto">
                    <PageHeader
                        title="健身打卡"
                        description="记录健身的每一天，见证成长的足迹"
                    />
                    {months.map((month) => {
                        const [year, monthNum] = month.split('-');
                        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long'
                        });

                        return (
                            <div key={month} className="relative mb-8">
                                <div className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8 text-gray-800">
                                    {monthName}
                                </div>
                                <div className="space-y-6">
                                    {recordsByMonth[month]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((record, index) => (
                                            <FitnessRecordCard
                                                key={record._id || `${record.date}-${index}`}
                                                record={record}
                                            />
                                        ))}
                                </div>
                            </div>
                        );
                    })}

                    {fitnessRecords.length === 0 && (
                        <div className="text-center text-gray-500 mt-16">
                            <div className="text-6xl mb-4">💪</div>
                            <div className="text-lg mb-2">还没有健身记录</div>
                            <div className="text-sm">开始你的健身之旅吧！</div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
} 