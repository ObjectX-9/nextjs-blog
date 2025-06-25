import { NextRequest, NextResponse } from 'next/server';
import { photoDb } from '@/utils/db-instances';
import { extractCompleteMetadataFromUrl, extractExifFromUrl, generateTagsFromMetadata, generateTagsFromExif } from '@/utils/exif';

export async function POST(request: NextRequest) {
    try {
        const { photoIds } = await request.json();

        if (!photoIds || !Array.isArray(photoIds)) {
            return NextResponse.json(
                { error: 'photoIds is required and must be an array' },
                { status: 400 }
            );
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const photoId of photoIds) {
            try {
                // 获取照片信息
                const photo = await photoDb.findOne({ _id: photoId });
                if (!photo) {
                    results.push({
                        photoId,
                        success: false,
                        error: 'Photo not found'
                    });
                    errorCount++;
                    continue;
                }

                // 尝试提取完整元数据
                let metadata, autoTags;
                try {
                    metadata = await extractCompleteMetadataFromUrl(photo.src);
                    autoTags = generateTagsFromMetadata(metadata.exif, metadata.gps, metadata.analysis);
                } catch (error) {
                    console.warn(`Complete metadata extraction failed for ${photoId}, falling back to basic EXIF:`, error);
                    // 降级到基础EXIF提取
                    const exifData = await extractExifFromUrl(photo.src);
                    metadata = { exif: exifData };
                    autoTags = generateTagsFromExif(exifData);
                }

                // 更新照片信息
                const updateData: any = {
                    exif: metadata.exif,
                    updatedAt: new Date().toISOString(),
                };

                // 添加其他元数据（如果存在）
                if (metadata.gps) updateData.gps = metadata.gps;
                if (metadata.technical) updateData.technical = metadata.technical;
                if (metadata.fileMetadata) updateData.fileMetadata = metadata.fileMetadata;
                if (metadata.analysis) updateData.analysis = metadata.analysis;

                // 如果有自动生成的标签，合并到现有标签中
                if (autoTags.length > 0) {
                    const existingTags = photo.tags || [];
                    const combinedTags = Array.from(new Set(existingTags.concat(autoTags)));
                    updateData.tags = combinedTags;
                }

                await photoDb.updateOne(
                    { _id: photoId },
                    { $set: updateData }
                );

                results.push({
                    photoId,
                    success: true,
                    metadata,
                    autoTags,
                });
                successCount++;

            } catch (error) {
                console.error(`Error processing photo ${photoId}:`, error);
                results.push({
                    photoId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            results,
            summary: {
                total: photoIds.length,
                success: successCount,
                errors: errorCount,
            }
        });

    } catch (error) {
        console.error('Batch EXIF extraction error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 提取单张照片的完整元数据
export async function PUT(request: NextRequest) {
    try {
        const { photoId } = await request.json();

        if (!photoId) {
            return NextResponse.json(
                { error: 'photoId is required' },
                { status: 400 }
            );
        }

        // 获取照片信息
        const photo = await photoDb.findOne({ _id: photoId });
        if (!photo) {
            return NextResponse.json(
                { error: 'Photo not found' },
                { status: 404 }
            );
        }

        // 尝试提取完整元数据
        let metadata, autoTags;
        try {
            metadata = await extractCompleteMetadataFromUrl(photo.src);
            autoTags = generateTagsFromMetadata(metadata.exif, metadata.gps, metadata.analysis);
        } catch (error) {
            console.warn(`Complete metadata extraction failed for ${photoId}, falling back to basic EXIF:`, error);
            // 降级到基础EXIF提取
            const exifData = await extractExifFromUrl(photo.src);
            metadata = { exif: exifData };
            autoTags = generateTagsFromExif(exifData);
        }

        // 更新照片信息
        const updateData: any = {
            exif: metadata.exif,
            updatedAt: new Date().toISOString(),
        };

        // 添加其他元数据（如果存在）
        if (metadata.gps) updateData.gps = metadata.gps;
        if (metadata.technical) updateData.technical = metadata.technical;
        if (metadata.fileMetadata) updateData.fileMetadata = metadata.fileMetadata;
        if (metadata.analysis) updateData.analysis = metadata.analysis;

        // 如果有自动生成的标签，合并到现有标签中
        if (autoTags.length > 0) {
            const existingTags = photo.tags || [];
            const combinedTags = Array.from(new Set(existingTags.concat(autoTags)));
            updateData.tags = combinedTags;
        }

        const result = await photoDb.updateOne(
            { _id: photoId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Photo not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            metadata,
            autoTags,
        });

    } catch (error) {
        console.error('EXIF extraction error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to extract metadata' },
            { status: 500 }
        );
    }
} 