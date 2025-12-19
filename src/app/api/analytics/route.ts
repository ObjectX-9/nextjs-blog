import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { parseUserAgent, getTrafficSource, getGeoFromIP } from './utils';

// 收集页面访问
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        const db = await getDb();
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || '';

        if (type === 'pageview') {
            const uaInfo = parseUserAgent(userAgent);
            const geoInfo = await getGeoFromIP(ip);
            const trafficSource = getTrafficSource(data.referrer, data.utmSource, data.utmMedium);

            const pageView = {
                sessionId: data.sessionId,
                visitorId: data.visitorId,
                path: data.path,
                title: data.title,
                referrer: data.referrer,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                utmTerm: data.utmTerm,
                utmContent: data.utmContent,
                trafficSource,
                userAgent,
                device: uaInfo.device,
                browser: uaInfo.browser,
                browserVersion: uaInfo.browserVersion,
                os: uaInfo.os,
                osVersion: uaInfo.osVersion,
                screenWidth: data.screenWidth,
                screenHeight: data.screenHeight,
                language: data.language,
                country: geoInfo.country,
                city: geoInfo.city,
                ip,
                timestamp: new Date(),
                createdAt: new Date(),
            };

            await db.collection('analytics_pageviews').insertOne(pageView);

            // 更新或创建会话
            await updateSession(db, pageView);

            // 更新实时访客
            await updateRealtimeVisitor(db, pageView);

            return NextResponse.json({ success: true });
        }

        if (type === 'event') {
            const customEvent = {
                sessionId: data.sessionId,
                visitorId: data.visitorId,
                eventName: data.eventName,
                eventCategory: data.eventCategory || 'custom',
                path: data.path,
                elementId: data.elementId,
                elementClass: data.elementClass,
                elementText: data.elementText,
                properties: data.properties,
                timestamp: new Date(),
                createdAt: new Date(),
            };

            await db.collection('analytics_events').insertOne(customEvent);

            // 更新会话事件计数
            await db.collection('analytics_sessions').updateOne(
                { sessionId: data.sessionId },
                {
                    $inc: { events: 1 },
                    $set: { lastActiveAt: new Date(), updatedAt: new Date() }
                }
            );

            return NextResponse.json({ success: true });
        }

        if (type === 'duration') {
            // 更新页面停留时间（更新最近的一条记录）
            const latestPageView = await db.collection('analytics_pageviews')
                .findOne(
                    { sessionId: data.sessionId, path: data.path },
                    { sort: { timestamp: -1 } }
                );

            if (latestPageView) {
                await db.collection('analytics_pageviews').updateOne(
                    { _id: latestPageView._id },
                    { $set: { duration: data.duration } }
                );
            }

            return NextResponse.json({ success: true });
        }

        if (type === 'heartbeat') {
            // 心跳更新，保持实时在线状态
            await db.collection('analytics_realtime').updateOne(
                { visitorId: data.visitorId },
                {
                    $set: {
                        sessionId: data.sessionId,
                        path: data.path,
                        lastActiveAt: new Date()
                    }
                },
                { upsert: true }
            );

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

async function updateSession(db: any, pageView: any) {
    const existingSession = await db.collection('analytics_sessions').findOne({
        sessionId: pageView.sessionId
    });

    if (existingSession) {
        // 更新现有会话
        const updates: any = {
            $inc: { pageViews: 1 },
            $set: {
                exitPage: pageView.path,
                lastActiveAt: new Date(),
                updatedAt: new Date(),
                isBounce: false, // 访问了多个页面，不是跳出
            }
        };

        await db.collection('analytics_sessions').updateOne(
            { sessionId: pageView.sessionId },
            updates
        );
    } else {
        // 创建新会话
        const session = {
            sessionId: pageView.sessionId,
            visitorId: pageView.visitorId,
            startTime: new Date(),
            pageViews: 1,
            events: 0,
            entryPage: pageView.path,
            exitPage: pageView.path,
            isBounce: true, // 默认为跳出，后续访问会更新
            device: pageView.device,
            browser: pageView.browser,
            os: pageView.os,
            country: pageView.country,
            city: pageView.city,
            trafficSource: pageView.trafficSource,
            lastActiveAt: new Date(),
            createdAt: new Date(),
        };

        await db.collection('analytics_sessions').insertOne(session);
    }
}

async function updateRealtimeVisitor(db: any, pageView: any) {
    await db.collection('analytics_realtime').updateOne(
        { visitorId: pageView.visitorId },
        {
            $set: {
                sessionId: pageView.sessionId,
                path: pageView.path,
                device: pageView.device,
                country: pageView.country,
                lastActiveAt: new Date(),
            }
        },
        { upsert: true }
    );
}
