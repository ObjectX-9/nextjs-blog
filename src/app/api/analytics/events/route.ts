import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// 获取自定义事件统计
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';
        const eventName = searchParams.get('eventName');
        const eventCategory = searchParams.get('category');

        const db = await getDb();

        // 计算日期范围
        const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

        const matchFilter: any = {
            timestamp: { $gte: start }
        };

        if (eventName) matchFilter.eventName = eventName;
        if (eventCategory) matchFilter.eventCategory = eventCategory;

        // 获取事件统计
        const [eventSummary, eventsByDay, topEvents, eventCategories] = await Promise.all([
            // 事件总数
            db.collection('analytics_events').countDocuments(matchFilter),
            // 按天统计
            db.collection('analytics_events').aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                            eventName: '$eventName',
                        },
                        count: { $sum: 1 },
                    }
                },
                { $sort: { '_id.date': 1 } }
            ]).toArray(),
            // 热门事件
            db.collection('analytics_events').aggregate([
                { $match: { timestamp: { $gte: start } } },
                {
                    $group: {
                        _id: { name: '$eventName', category: '$eventCategory' },
                        count: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$visitorId' },
                    }
                },
                {
                    $project: {
                        eventName: '$_id.name',
                        eventCategory: '$_id.category',
                        count: 1,
                        uniqueUsers: { $size: '$uniqueUsers' },
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]).toArray(),
            // 事件分类统计
            db.collection('analytics_events').aggregate([
                { $match: { timestamp: { $gte: start } } },
                {
                    $group: {
                        _id: '$eventCategory',
                        count: { $sum: 1 },
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray(),
        ]);

        return NextResponse.json({
            total: eventSummary,
            eventsByDay,
            topEvents,
            eventCategories,
        });
    } catch (error) {
        console.error('Events stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
