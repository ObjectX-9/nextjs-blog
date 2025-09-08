"use client";

import { TravelRecordCard } from "./components/TravelRecordCard";
import { ITravelRecord } from "@/app/model/travel";
import { travelBusiness } from "@/app/business/travel";
import { useState, useEffect } from 'react';

export default function Travel() {
    const [travelRecords, setTravelRecords] = useState<ITravelRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTravelRecords = async () => {
            try {
                const records = await travelBusiness.getTravelRecords();
                setTravelRecords(records);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取旅行记录失败');
            } finally {
                setLoading(false);
            }
        };

        fetchTravelRecords();
    }, []);

    // Group records by year-month
    const recordsByMonth = travelRecords.reduce((acc, record) => {
        const date = new Date(record.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[yearMonth]) {
            acc[yearMonth] = [];
        }
        acc[yearMonth].push(record);
        return acc;
    }, {} as Record<string, ITravelRecord[]>);

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
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                        旅行记录
                    </h1>
                    <div className="mb-4 sm:mb-6 last:mb-0 text-sm sm:text-base text-gray-600">
                        记录旅行的美好时光，分享沿途的精彩瞬间
                    </div>
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
                                            <TravelRecordCard
                                                key={record._id || `${record.date}-${index}`}
                                                record={record}
                                            />
                                        ))}
                                </div>
                            </div>
                        );
                    })}

                    {travelRecords.length === 0 && (
                        <div className="text-center text-gray-500 mt-16">
                            <div className="text-6xl mb-4">✈️</div>
                            <div className="text-lg mb-2">还没有旅行记录</div>
                            <div className="text-sm">开始记录你的旅行足迹吧！</div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
} 