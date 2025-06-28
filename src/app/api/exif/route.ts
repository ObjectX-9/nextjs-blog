import { createApiParams } from "@/utils/api-helpers";
import { successResponse, withErrorHandler, errorResponse, ApiErrors } from "../data";
import { exiftool, Tags } from 'exiftool-vendored';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// POST: 接收上传的图片文件，分析EXIF信息
export const POST = withErrorHandler<[Request], { exif: Tags }>(async (request: Request) => {
    let tempFilePath: string | null = null;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return errorResponse(ApiErrors.BAD_REQUEST("No file provided"));
        }

        // 检查文件类型
        if (!file.type.startsWith("image/")) {
            return errorResponse(ApiErrors.BAD_REQUEST("Only image files are allowed"));
        }

        // 将文件转换为Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // 创建临时文件
        const tempDir = os.tmpdir();
        const extension = path.extname(file.name) || '.jpg';
        tempFilePath = path.join(tempDir, `exif_${Date.now()}_${Math.random().toString(36).substring(7)}${extension}`);

        // 写入临时文件
        await fs.writeFile(tempFilePath, buffer);

        // 分析EXIF信息
        const exif = await exiftool.read(tempFilePath);

        return successResponse({ exif });
    } catch (error: any) {
        console.error("EXIF extraction error:", error);
        return errorResponse(ApiErrors.INTERNAL_ERROR(`Failed to extract EXIF data: ${error.message}`));
    } finally {
        // 清理临时文件
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
            } catch (cleanupError) {
                console.warn("Failed to cleanup temp file:", cleanupError);
            }
        }
    }
});

// GET: 接收图片URL，下载后分析EXIF信息
export const GET = withErrorHandler<[Request], { exif: Tags }>(async (request: Request) => {
    let tempFilePath: string | null = null;

    try {
        const apiParams = createApiParams(request);
        const imageUrl = apiParams.getString("url");

        if (!imageUrl) {
            return errorResponse(ApiErrors.BAD_REQUEST("Image URL is required"));
        }

        // 验证URL格式
        try {
            new URL(imageUrl);
        } catch {
            return errorResponse(ApiErrors.BAD_REQUEST("Invalid URL format"));
        }

        // 下载图片
        const response = await fetch(imageUrl);
        if (!response.ok) {
            return errorResponse(ApiErrors.BAD_REQUEST("Failed to download image"));
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.startsWith("image/")) {
            return errorResponse(ApiErrors.BAD_REQUEST("URL does not point to an image"));
        }

        // 获取图片数据
        const buffer = Buffer.from(await response.arrayBuffer());

        // 创建临时文件
        const tempDir = os.tmpdir();
        const extension = path.extname(new URL(imageUrl).pathname) || '.jpg';
        tempFilePath = path.join(tempDir, `exif_url_${Date.now()}_${Math.random().toString(36).substring(7)}${extension}`);

        // 写入临时文件
        await fs.writeFile(tempFilePath, buffer);

        // 分析EXIF信息
        const exif = await exiftool.read(tempFilePath);

        return successResponse({ exif });
    } catch (error: any) {
        console.error("EXIF extraction error:", error);
        return errorResponse(ApiErrors.INTERNAL_ERROR(`Failed to extract EXIF data: ${error.message}`));
    } finally {
        // 清理临时文件
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
            } catch (cleanupError) {
                console.warn("Failed to cleanup temp file:", cleanupError);
            }
        }
    }
}); 