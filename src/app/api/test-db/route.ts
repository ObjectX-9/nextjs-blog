import { NextRequest, NextResponse } from 'next/server';
import { checkConnection } from '@/lib/mongodb';
import { photoDb } from '@/utils/db-instances';

export async function GET() {
    try {
        console.log('Testing database connection...');

        // 测试MongoDB连接
        const isConnected = await checkConnection();
        if (!isConnected) {
            return NextResponse.json({
                success: false,
                error: 'Database connection failed'
            }, { status: 500 });
        }

        // 测试照片集合
        try {
            const photoCount = await photoDb.countDocuments();
            console.log(`Found ${photoCount} photos in database`);

            return NextResponse.json({
                success: true,
                message: 'Database connection successful',
                data: {
                    connected: true,
                    photoCount
                }
            });
        } catch (dbError) {
            console.error('Error accessing photos collection:', dbError);
            return NextResponse.json({
                success: false,
                error: 'Failed to access photos collection',
                details: dbError instanceof Error ? dbError.message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Test API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 