import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// 清理过期的埋点数据（保留最近90天）
export async function POST(request: NextRequest) {
    try {
        // 简单的密钥验证，防止被随意调用
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key !== process.env.ANALYTICS_CLEANUP_KEY && key !== 'cleanup_analytics_2024') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDb();

        // 90天前的日期
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        // 先统计要清理的独立访客数
        const oldVisitors = await db.collection('analytics_pageviews').distinct('visitorId', {
            timestamp: { $lt: cutoffDate }
        });
        const oldVisitorCount = oldVisitors.length;

        // 把访问人数累加到网站信息表
        if (oldVisitorCount > 0) {
            await db.collection('sites').updateOne(
                {},
                { $inc: { visitCount: oldVisitorCount } }
            );
        }

        // 并行清理各个集合
        const [pageviewsResult, eventsResult, sessionsResult, realtimeResult] = await Promise.all([
            db.collection('analytics_pageviews').deleteMany({
                timestamp: { $lt: cutoffDate }
            }),
            db.collection('analytics_events').deleteMany({
                timestamp: { $lt: cutoffDate }
            }),
            db.collection('analytics_sessions').deleteMany({
                startTime: { $lt: cutoffDate }
            }),
            db.collection('analytics_realtime').deleteMany({
                lastActiveAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }
            }),
        ]);

        return NextResponse.json({
            success: true,
            archivedVisitors: oldVisitorCount,
            deleted: {
                pageviews: pageviewsResult.deletedCount,
                events: eventsResult.deletedCount,
                sessions: sessionsResult.deletedCount,
                realtime: realtimeResult.deletedCount,
            },
            cutoffDate: cutoffDate.toISOString(),
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// 获取数据库统计信息
export async function GET(request: NextRequest) {
    try {
        const db = await getDb();

        const [pageviews, events, sessions, realtime] = await Promise.all([
            db.collection('analytics_pageviews').countDocuments(),
            db.collection('analytics_events').countDocuments(),
            db.collection('analytics_sessions').countDocuments(),
            db.collection('analytics_realtime').countDocuments(),
        ]);

        return NextResponse.json({
            counts: {
                pageviews,
                events,
                sessions,
                realtime,
            },
            total: pageviews + events + sessions + realtime,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
