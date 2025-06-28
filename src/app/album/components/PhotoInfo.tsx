"use client";

import React from 'react';
import { IPhoto } from '@/app/model/photo';
import {
    CameraOutlined,
    SettingOutlined,
    InfoCircleOutlined,
    BulbOutlined,
    BgColorsOutlined,
    FilterOutlined,
    CodeOutlined
} from '@ant-design/icons';
import { formatPhotoDateTime } from '@/utils/time';
import { ExifDateTime } from 'exiftool-vendored';
import ImageAnalysisDisplay from './ImageAnalysisDisplay';

interface PhotoInfoProps {
    photo: IPhoto;
    variant?: 'overlay' | 'modal' | 'sidebar';
    className?: string;
}

const PhotoInfo: React.FC<PhotoInfoProps> = ({
    photo,
    className = ''
}) => {
    // 渲染信息项
    const InfoItem: React.FC<{ label: string; value?: string | number; unit?: string }> = ({
        label,
        value,
        unit = ''
    }) => {
        if (!value && value !== 0) return null;
        return (
            <div className="flex justify-between items-center py-1 text-[15px]">
                <span className="text-gray-400 font-normal whitespace-nowrap mr-2">{label}</span>
                <span className="text-white font-medium whitespace-nowrap ml-2">{value}{unit}</span>
            </div>
        );
    };

    // 渲染色彩条
    const ColorBar: React.FC<{ colors?: string[] }> = ({ colors }) => {
        if (!colors || colors.length === 0) return null;
        return (
            <div className="flex h-6 rounded overflow-hidden mt-1 mb-2">
                {colors.map((color, index) => (
                    <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                ))}
            </div>
        );
    };

    // 分割线
    const Divider = () => (
        <div className="my-4 border-t border-white/10" />
    );

    // 右侧面板容器样式
    const containerClass = `
        h-full w-full flex flex-col
        bg-gradient-to-br from-white/30 via-white/10 to-black/30
        backdrop-blur-xl shadow-2xl
        border-l border-white/10
        px-4 py-4
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
        ${className}
    `;

    // 分组标题样式（统一为白色）
    const groupTitle = (icon: React.ReactNode, text: string) => (
        <h4 className="flex items-center gap-2 text-base font-semibold mb-2 text-white">
            {icon}
            {text}
        </h4>
    );

    return (
        <div className={containerClass}>
            <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                    {groupTitle(<InfoCircleOutlined />, '基本信息')}
                    <div className="space-y-1">
                        <InfoItem label="文件名" value={photo.exif?.FileName} />
                        <InfoItem label="标题" value={photo.title} />
                        <InfoItem label="地点" value={photo.location} />
                        <InfoItem label="尺寸" value={`${photo.width} × ${photo.height}`} />
                        <InfoItem label="像素" value={((photo.width * photo.height) / 1000000).toFixed(1)} unit=" MP" />
                        <InfoItem label="拍摄时间" value={formatPhotoDateTime(photo.exif?.DateTimeOriginal as ExifDateTime)} />
                        <InfoItem label="颜色空间" value={photo.exif?.ColorSpace} />
                    </div>
                    <Divider />
                </div>

                {/* 设备信息 */}
                {(photo.exif?.Make || photo.exif?.Model || photo.exif?.LensModel) && (
                    <>
                        <div>
                            {groupTitle(<CameraOutlined />, '设备信息')}
                            <div className="space-y-1">
                                <InfoItem label="相机" value={photo.exif?.Make && photo.exif?.Model ? `${photo.exif.Make} ${photo.exif.Model}` : undefined} />
                                <InfoItem label="固件版本" value={photo.exif?.CanonFirmwareVersion} />
                                <InfoItem label="相机分类" value={photo.exif?.CameraType} />
                                <InfoItem label="镜头" value={photo.exif?.LensModel} />
                                <InfoItem label="闪光灯" value={photo.exif?.Flash} />
                            </div>
                        </div>
                        <Divider />
                    </>
                )}


                {/* 拍摄参数 */}
                {photo.exif && (
                    <>
                        <div>
                            {groupTitle(<SettingOutlined />, '拍摄参数')}
                            <div className="space-y-1">
                                <InfoItem label="光圈" value={photo.exif.Aperture ? `f/${photo.exif.Aperture}` : undefined} />
                                <InfoItem label="快门" value={photo.exif.ShutterSpeed} />
                                <InfoItem label="ISO" value={photo.exif.ISO ? `ISO ${photo.exif.ISO}` : undefined} />
                            </div>
                        </div>
                        <Divider />
                    </>
                )}


                {/* 图片风格 */}
                {photo.exif?.Software && (
                    <div>
                        {groupTitle(<FilterOutlined />, '图片风格')}
                        <div className="space-y-1">
                            <InfoItem label="图片风格" value={photo.exif.PictureStyle} />
                            <InfoItem label="清晰度" value={photo.exif.Clarity} />
                            <InfoItem label="锐度强度" value={photo.exif.Sharpness} />
                            <InfoItem label="锐度精细度" value={photo.exif.UnsharpMaskFineness} />
                            <InfoItem label="锐度临界值" value={photo.exif.UnsharpMaskThreshold} />
                            <InfoItem label="反差/对比度" value={photo.exif.Contrast} />
                            <InfoItem label="饱和度" value={photo.exif.Saturation} />
                            <InfoItem label="色调偏移" value={photo.exif.ColorTone} />
                        </div>
                        <Divider />
                    </div>
                )}


                {/* 曝光参数 */}
                {photo.exif && (
                    <>
                        <div>
                            {groupTitle(<BulbOutlined />, '曝光参数')}
                            <div className="space-y-1">
                                <InfoItem label="曝光模式" value={photo.exif.ExposureProgram} />
                                <InfoItem label="测光模式" value={photo.exif.MeteringMode} />
                                <InfoItem label="曝光补偿" value={photo.exif.ExposureCompensation} />
                                <InfoItem label="白平衡模式" value={photo.exif.WhiteBalance} />
                                <InfoItem label="色温" value={photo.exif.ColorTemperature ? `${photo.exif.ColorTemperature} K` : undefined} />
                            </div>
                        </div>
                        <Divider />
                    </>
                )}

                {/* 影调分析 */}
                {photo.imageAnalysis && (
                    <>
                        <div>
                            {groupTitle(<BgColorsOutlined />, '影调分析')}
                            <ImageAnalysisDisplay imageAnalysis={photo.imageAnalysis} />
                        </div>
                        <Divider />
                    </>
                )}

                {/* 软件信息 */}
                {photo.exif?.Software && (
                    <div>
                        {groupTitle(<CodeOutlined />, '软件')}
                        <div className="text-sm text-gray-300">
                            {photo.exif.Software}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoInfo; 