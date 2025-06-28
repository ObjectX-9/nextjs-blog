import { request } from "@/utils/request";
import { Tags } from 'exiftool-vendored';

export interface ExifExtractionResult {
    success: boolean;
    exif?: Tags;
    error?: string;
}

class ExifBusiness {
    /**
     * 从文件提取EXIF信息
     * @param file 图片文件
     * @returns EXIF信息提取结果
     */
    async extractExifFromFile(file: File): Promise<ExifExtractionResult> {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await request.post<{ exif: Tags }>('exif', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.success && response.data?.exif) {
                return {
                    success: true,
                    exif: response.data.exif
                };
            } else {
                return {
                    success: false,
                    error: response.message || "EXIF提取失败"
                };
            }
        } catch (error: any) {
            console.error("EXIF extraction from file failed:", error);
            return {
                success: false,
                error: error.message || "网络请求失败"
            };
        }
    }

    /**
     * 验证图片文件类型
     * @param file 文件对象
     * @returns 是否为有效的图片文件
     */
    isValidImageFile(file: File): boolean {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
        return validTypes.includes(file.type.toLowerCase());
    }

    /**
     * 格式化EXIF数据用于显示
     * @param exif EXIF数据
     * @returns 格式化后的显示信息
     */
    formatExifForDisplay(exif: Tags): {
        camera?: string;
        lens?: string;
        shootingParams?: string;
        location?: string;
        dateTime?: string;
        imageInfo?: string;
    } {
        const result: {
            camera?: string;
            lens?: string;
            shootingParams?: string;
            location?: string;
            dateTime?: string;
            imageInfo?: string;
        } = {};

        // 相机信息
        if (exif.Make && exif.Model) {
            result.camera = `${exif.Make} ${exif.Model}`;
        }

        // 镜头信息
        if (exif.LensModel) {
            result.lens = exif.LensModel;
        }

        // 拍摄参数
        const params: string[] = [];
        if (exif.FocalLength) params.push(exif.FocalLength);
        if (exif.Aperture) params.push(`f/${exif.Aperture}`);
        if (exif.ShutterSpeed) params.push(exif.ShutterSpeed);
        if (exif.ISO) params.push(`ISO${exif.ISO}`);
        if (params.length > 0) {
            result.shootingParams = params.join(' · ');
        }

        // GPS位置信息
        if (exif.GPSLatitude && exif.GPSLongitude) {
            result.location = `${exif.GPSLatitude}, ${exif.GPSLongitude}`;
        }

        // 拍摄时间
        if (exif.DateTimeOriginal) {
            result.dateTime = exif.DateTimeOriginal.toString();
        } else if (exif.DateTime) {
            result.dateTime = exif.DateTime.toString();
        }

        // 图片信息
        if (exif.ImageWidth && exif.ImageHeight) {
            const megapixels = ((exif.ImageWidth * exif.ImageHeight) / 1000000).toFixed(1);
            result.imageInfo = `${exif.ImageWidth}×${exif.ImageHeight} (${megapixels}MP)`;
        }

        return result;
    }

    /**
     * 检查EXIF数据是否为空
     * @param exif EXIF数据
     * @returns 是否为空或无效
     */
    isEmpty(exif?: Tags): boolean {
        if (!exif) return true;

        // 检查是否有实际的相机拍摄信息
        const hasCamera = exif.Make || exif.Model;
        const hasShootingParams = exif.Aperture || exif.ShutterSpeed || exif.ISO || exif.FocalLength;
        const hasDateTime = exif.DateTimeOriginal || exif.DateTime;

        return !hasCamera && !hasShootingParams && !hasDateTime;
    }
}

export const exifBusiness = new ExifBusiness(); 