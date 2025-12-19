import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// 获取统计数据
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d'; // 7d, 30d, 90d, custom
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        const db = await getDb();

        // 计算日期范围
        const now = new Date();
        let start: Date;
        let end = new Date(now.setHours(23, 59, 59, 999));

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else if (range === 'all') {
            // 获取全部数据，从很早的时间开始
            start = new Date('2020-01-01');
        } else {
            const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
            start = new Date();
            start.setDate(start.getDate() - days);
            start.setHours(0, 0, 0, 0);
        }

        const dateFilter = {
            timestamp: { $gte: start, $lte: end }
        };

        // 并行获取各项统计
        const [
            overview,
            dailyStats,
            topPages,
            topReferrers,
            devices,
            browsers,
            countries,
            trafficSources,
            realtimeCount,
        ] = await Promise.all([
            getOverview(db, dateFilter),
            getDailyStats(db, start, end),
            getTopPages(db, dateFilter),
            getTopReferrers(db, dateFilter),
            getDeviceStats(db, dateFilter),
            getBrowserStats(db, dateFilter),
            getCountryStats(db, dateFilter),
            getTrafficSourceStats(db, dateFilter),
            getRealtimeVisitors(db),
        ]);

        return NextResponse.json({
            overview,
            dailyStats,
            topPages,
            topReferrers,
            devices,
            browsers,
            countries,
            trafficSources,
            realtimeCount,
            dateRange: { start, end },
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

async function getOverview(db: any, dateFilter: any) {
    const [pvResult, uvResult, sessionResult, bounceResult, durationResult] = await Promise.all([
        // 页面浏览量
        db.collection('analytics_pageviews').countDocuments(dateFilter),
        // 独立访客
        db.collection('analytics_pageviews').distinct('visitorId', dateFilter),
        // 会话数
        db.collection('analytics_sessions').countDocuments({
            startTime: dateFilter.timestamp
        }),
        // 跳出率
        db.collection('analytics_sessions').aggregate([
            { $match: { startTime: dateFilter.timestamp } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    bounced: { $sum: { $cond: ['$isBounce', 1, 0] } }
                }
            }
        ]).toArray(),
        // 平均停留时间
        db.collection('analytics_pageviews').aggregate([
            { $match: { ...dateFilter, duration: { $exists: true, $gt: 0 } } },
            { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
        ]).toArray(),
    ]);

    const bounceData = bounceResult[0] || { total: 0, bounced: 0 };
    const bounceRate = bounceData.total > 0
        ? Math.round((bounceData.bounced / bounceData.total) * 100)
        : 0;

    const avgDuration = durationResult[0]?.avgDuration || 0;

    return {
        pageViews: pvResult,
        uniqueVisitors: uvResult.length,
        sessions: sessionResult,
        bounceRate,
        avgDuration: Math.round(avgDuration),
    };
}

async function getDailyStats(db: any, start: Date, end: Date) {
    const result = await db.collection('analytics_pageviews').aggregate([
        {
            $match: {
                timestamp: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                },
                pageViews: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
                sessions: { $addToSet: '$sessionId' },
            }
        },
        {
            $project: {
                date: '$_id',
                pageViews: 1,
                uniqueVisitors: { $size: '$visitors' },
                sessions: { $size: '$sessions' },
            }
        },
        { $sort: { date: 1 } }
    ]).toArray();

    return result;
}

async function getTopPages(db: any, dateFilter: any, limit = 10) {
    return db.collection('analytics_pageviews').aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$path',
                views: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
                avgDuration: { $avg: '$duration' },
            }
        },
        {
            $project: {
                path: '$_id',
                views: 1,
                uniqueVisitors: { $size: '$visitors' },
                avgDuration: { $round: ['$avgDuration', 0] },
            }
        },
        { $sort: { views: -1 } },
        { $limit: limit }
    ]).toArray();
}

async function getTopReferrers(db: any, dateFilter: any, limit = 10) {
    return db.collection('analytics_pageviews').aggregate([
        { $match: { ...dateFilter, referrer: { $exists: true, $ne: '' } } },
        {
            $group: {
                _id: '$referrer',
                count: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
            }
        },
        {
            $project: {
                referrer: '$_id',
                count: 1,
                uniqueVisitors: { $size: '$visitors' },
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]).toArray();
}

async function getDeviceStats(db: any, dateFilter: any) {
    const result = await db.collection('analytics_pageviews').aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$device',
                count: { $sum: 1 },
            }
        },
        { $sort: { count: -1 } }
    ]).toArray();

    const total = result.reduce((sum: number, item: any) => sum + item.count, 0);
    return result.map((item: any) => ({
        device: item._id,
        count: item.count,
        percentage: Math.round((item.count / total) * 100),
    }));
}

async function getBrowserStats(db: any, dateFilter: any) {
    const result = await db.collection('analytics_pageviews').aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$browser',
                count: { $sum: 1 },
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]).toArray();

    const total = result.reduce((sum: number, item: any) => sum + item.count, 0);
    return result.map((item: any) => ({
        browser: item._id,
        count: item.count,
        percentage: Math.round((item.count / total) * 100),
    }));
}

async function getCountryStats(db: any, dateFilter: any) {
    const result = await db.collection('analytics_pageviews').aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$country',
                count: { $sum: 1 },
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]).toArray();

    const total = result.reduce((sum: number, item: any) => sum + item.count, 0);
    return result.map((item: any) => ({
        country: item._id || 'Unknown',
        count: item.count,
        percentage: Math.round((item.count / total) * 100),
    }));
}

async function getTrafficSourceStats(db: any, dateFilter: any) {
    const result = await db.collection('analytics_pageviews').aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$trafficSource',
                count: { $sum: 1 },
            }
        },
        { $sort: { count: -1 } }
    ]).toArray();

    const total = result.reduce((sum: number, item: any) => sum + item.count, 0);
    return result.map((item: any) => ({
        source: item._id,
        count: item.count,
        percentage: Math.round((item.count / total) * 100),
    }));
}

async function getRealtimeVisitors(db: any) {
    // 5分钟内活跃的访客视为在线
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await db.collection('analytics_realtime').aggregate([
        { $match: { lastActiveAt: { $gte: fiveMinutesAgo } } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                visitors: { $push: { path: '$path', device: '$device', country: '$country' } }
            }
        }
    ]).toArray();

    return {
        count: result[0]?.count || 0,
        visitors: result[0]?.visitors || [],
    };
}
