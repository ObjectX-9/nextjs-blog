import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 获取漏斗列表或分析结果
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const funnelId = searchParams.get('id');
        const range = searchParams.get('range') || '7d';

        const db = await getDb();

        if (funnelId) {
            // 获取漏斗分析结果
            const funnel = await db.collection('analytics_funnels').findOne({
                _id: new ObjectId(funnelId)
            });

            if (!funnel) {
                return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
            }

            const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
            const start = new Date();
            start.setDate(start.getDate() - days);

            const analysis = await analyzeFunnel(db, funnel, start);

            return NextResponse.json(analysis);
        }

        // 获取漏斗列表
        const funnels = await db.collection('analytics_funnels')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(funnels);
    } catch (error) {
        console.error('Funnel error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// 创建漏斗
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, steps } = body;

        if (!name || !steps || steps.length < 2) {
            return NextResponse.json(
                { error: 'Name and at least 2 steps required' },
                { status: 400 }
            );
        }

        const db = await getDb();

        const funnel = {
            name,
            steps,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('analytics_funnels').insertOne(funnel);

        return NextResponse.json({
            success: true,
            id: result.insertedId
        });
    } catch (error) {
        console.error('Create funnel error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// 删除漏斗
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const funnelId = searchParams.get('id');

        if (!funnelId) {
            return NextResponse.json({ error: 'Funnel ID required' }, { status: 400 });
        }

        const db = await getDb();

        await db.collection('analytics_funnels').deleteOne({
            _id: new ObjectId(funnelId)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete funnel error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

async function analyzeFunnel(db: any, funnel: any, startDate: Date) {
    const steps = funnel.steps;
    const results: any[] = [];

    let previousVisitors: Set<string> | null = null;

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // 构建查询条件
        const matchFilter: any = {
            timestamp: { $gte: startDate },
            eventName: step.eventName,
        };

        if (step.eventCategory) {
            matchFilter.eventCategory = step.eventCategory;
        }

        if (step.properties) {
            for (const [key, value] of Object.entries(step.properties)) {
                matchFilter[`properties.${key}`] = value;
            }
        }

        // 获取完成该步骤的访客
        const visitors = await db.collection('analytics_events').distinct(
            'visitorId',
            matchFilter
        );

        const visitorSet = new Set<string>(visitors as string[]);

        // 如果不是第一步，只计算同时完成了上一步的访客
        let count: number;
        if (previousVisitors === null) {
            count = visitorSet.size;
        } else {
            const visitorArray = Array.from(visitorSet);
            count = visitorArray.filter(v => previousVisitors!.has(v)).length;
            // 更新为交集
            const intersection = new Set<string>(visitorArray.filter(v => previousVisitors!.has(v)));
            previousVisitors = intersection;
        }

        if (previousVisitors === null) {
            previousVisitors = visitorSet;
        }

        const firstStepCount = results[0]?.count || count;
        const prevStepCount = results[i - 1]?.count || count;

        results.push({
            name: step.name,
            eventName: step.eventName,
            count,
            conversionRate: i === 0 ? 100 : Math.round((count / prevStepCount) * 100),
            overallRate: Math.round((count / firstStepCount) * 100),
        });
    }

    const totalConversionRate = results.length > 0
        ? results[results.length - 1].overallRate
        : 0;

    return {
        funnel: {
            _id: funnel._id,
            name: funnel.name,
            steps: funnel.steps,
        },
        dateRange: { start: startDate, end: new Date() },
        steps: results,
        totalConversionRate,
    };
}
