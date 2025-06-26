"use client";

import React, { useState } from 'react';
import { IPhoto } from '@/app/model/photo';
import { Progress, Button } from 'antd';
import {
    CameraOutlined,
    SettingOutlined,
    BarChartOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import ToneAnalysisDisplay from '@/components/ToneAnalysisDisplay';

interface PhotoInfoProps {
    photo: IPhoto;
    variant?: 'overlay' | 'modal' | 'sidebar';
    className?: string;
}

const PhotoInfo: React.FC<PhotoInfoProps> = ({
    photo,
    className = ''
}) => {
    const [showToneAnalysis, setShowToneAnalysis] = useState(false);
    // 格式化文件大小
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '未知';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // 格式化GPS坐标
    const formatGPS = (lat?: number, lng?: number): string => {
        if (!lat || !lng) return '未知';
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
    };

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
                        <InfoItem label="文件名" value={photo.fileMetadata?.fileName || photo.title} />
                        <InfoItem label="格式" value={photo.fileMetadata?.format} />
                        <InfoItem label="尺寸" value={`${photo.width} × ${photo.height}`} />
                        <InfoItem label="文件大小" value={formatFileSize(photo.fileMetadata?.fileSize)} />
                        <InfoItem label="像素" value={((photo.width * photo.height) / 1000000).toFixed(1)} unit=" MP" />
                        <InfoItem label="色彩空间" value={photo.exif?.colorSpace} />
                        <InfoItem label="分辨率" value={photo.exif?.xResolution ? `${photo.exif.xResolution} × ${photo.exif.yResolution} dpi` : undefined} />
                        <InfoItem label="图像方向" value={photo.exif?.orientation === 1 ? '正常' : `旋转 ${photo.exif?.orientation}`} />
                        <InfoItem label="拍摄时间" value={photo.date} />
                    </div>
                </div>
                <Divider />

                {/* 设备信息 */}
                {(photo.exif?.camera || photo.exif?.lens) && (
                    <>
                        <div>
                            {groupTitle(<CameraOutlined />, '设备信息')}
                            <div className="space-y-1">
                                <InfoItem label="相机" value={photo.exif?.camera} />
                                <InfoItem label="镜头" value={photo.exif?.lens} />
                                <InfoItem label="镜头规格" value={photo.exif?.lensSpecification} />
                                <InfoItem label="焦距" value={photo.exif?.focalLength} />
                                <InfoItem label="35mm 等效" value={photo.exif?.focalLengthIn35mmFilm} unit="mm" />
                                <InfoItem label="焦平面分辨率" value={photo.exif?.focalPlaneXResolution ? `${photo.exif.focalPlaneXResolution.toFixed(1)} × ${photo.exif.focalPlaneYResolution?.toFixed(1)}` : undefined} />
                                <InfoItem label="镜头序列号" value={photo.exif?.lensSerialNumber} />
                                <InfoItem label="机身序列号" value={photo.exif?.cameraSerialNumber} />
                                <InfoItem label="固件版本" value={photo.exif?.firmware} />
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
                                <InfoItem label="光圈" value={photo.exif.aperture ? `f/${photo.exif.aperture}` : undefined} />
                                <InfoItem label="快门" value={photo.exif.shutterSpeed} />
                                <InfoItem label="ISO" value={photo.exif.iso ? `ISO ${photo.exif.iso}` : undefined} />
                                <InfoItem label="曝光补偿" value={photo.exif.exposureCompensation} />
                                <InfoItem label="曝光程序" value={photo.exif.exposureProgram} />
                                <InfoItem label="测光模式" value={photo.exif.meteringMode} />
                                <InfoItem label="白平衡" value={photo.exif.whiteBalance} />
                                <InfoItem label="光源" value={photo.exif.lightSource} />
                                <InfoItem label="曝光模式" value={photo.exif.exposureMode} />
                                <InfoItem label="场景类型" value={photo.exif.sceneCaptureType} />
                                <InfoItem label="感光方式" value={photo.exif.sensingMethod} />
                                <InfoItem label="闪光灯" value={photo.exif.flash} />
                            </div>
                        </div>
                        <Divider />
                    </>
                )}

                {/* 图像分析 */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        {groupTitle(<BarChartOutlined />, '图像分析')}
                        <Button
                            size="small"
                            type={showToneAnalysis ? 'primary' : 'default'}
                            icon={<BarChartOutlined />}
                            className={showToneAnalysis ? '' : 'border-gray-600 text-gray-300'}
                            onClick={() => setShowToneAnalysis(!showToneAnalysis)}
                        >
                            影调分析
                        </Button>
                    </div>

                    {!showToneAnalysis && photo.analysis && (
                        <>
                            {/* 主色调显示 */}
                            {photo.analysis.dominantColors && photo.analysis.dominantColors.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-gray-400 text-sm block mb-2">主色调</span>
                                    <ColorBar colors={photo.analysis.dominantColors} />
                                </div>
                            )}
                            <div className="space-y-2">
                                {photo.analysis.averageBrightness !== undefined && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1 text-white">
                                            <span>亮度</span>
                                            <span>{(photo.analysis.averageBrightness * 100).toFixed(0)}%</span>
                                        </div>
                                        <Progress
                                            percent={photo.analysis.averageBrightness * 100}
                                            showInfo={false}
                                            strokeColor="#60a5fa"
                                            trailColor="#374151"
                                            size="small"
                                        />
                                    </div>
                                )}
                                {photo.analysis.contrast !== undefined && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1 text-white">
                                            <span>对比度</span>
                                            <span>{(photo.analysis.contrast * 100).toFixed(0)}%</span>
                                        </div>
                                        <Progress
                                            percent={photo.analysis.contrast * 100}
                                            showInfo={false}
                                            strokeColor="#34d399"
                                            trailColor="#374151"
                                            size="small"
                                        />
                                    </div>
                                )}
                                {photo.analysis.saturation !== undefined && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1 text-white">
                                            <span>饱和度</span>
                                            <span>{(photo.analysis.saturation * 100).toFixed(0)}%</span>
                                        </div>
                                        <Progress
                                            percent={photo.analysis.saturation * 100}
                                            showInfo={false}
                                            strokeColor="#f59e0b"
                                            trailColor="#374151"
                                            size="small"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* 影调分析展示 */}
                    {showToneAnalysis && (
                        <div className="mt-4">
                            {photo.analysis?.toneAnalysis ? (
                                <ToneAnalysisDisplay
                                    data={photo.analysis.toneAnalysis}
                                    className="border-none bg-transparent"
                                />
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="mb-2">此照片没有影调分析数据</div>
                                    <div className="text-sm">需要重新上传照片以生成影调分析数据</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Divider />

                {/* 标签 */}
                {photo.tags && photo.tags.length > 0 && (
                    <>
                        <div>
                            {groupTitle(null, '标签')}
                            <div className="flex flex-wrap gap-2">
                                {photo.tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="rounded-full px-3 py-1 text-base font-medium bg-white/20 backdrop-blur-md text-white shadow border border-white/20"
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider />
                    </>
                )}

                {/* 胶片模拟配方 */}
                {photo.exif?.filmSimulation && (
                    <>
                        <div>
                            {groupTitle(null, '胶片模拟配方')}
                            <div className="space-y-1">
                                <InfoItem label="胶片模式" value={photo.exif.filmSimulation} />
                                <InfoItem label="动态范围" value="标准" />
                                <InfoItem label="白平衡" value={photo.exif.whiteBalance} />
                                <InfoItem label="高光色调" value="0" />
                                <InfoItem label="阴影色调" value="0" />
                                <InfoItem label="饱和度" value={photo.exif.saturation || "标准"} />
                                <InfoItem label="锐度" value={photo.exif.sharpness || "标准"} />
                                <InfoItem label="降噪" value="0" />
                                <InfoItem label="清晰度" value="0" />
                                <InfoItem label="色彩效果" value="强" />
                                <InfoItem label="彩色 Fx 蓝色" value="强" />
                                <InfoItem label="白平衡微调" value="红色 -20, 蓝色 +80" />
                                <InfoItem label="颗粒效果强度" value="关" />
                                <InfoItem label="颗粒效果大小" value="关" />
                            </div>
                        </div>
                        <Divider />
                    </>
                )}

                {/* 软件信息 */}
                {(photo.exif?.software || photo.exif?.artist || photo.exif?.copyright || photo.exif?.cameraOwnerName) && (
                    <div>
                        {groupTitle(null, '软件与版权')}
                        <div className="space-y-1">
                            <InfoItem label="编辑软件" value={photo.exif?.software} />
                            <InfoItem label="EXIF版本" value={photo.exif?.exifVersion} />
                            <InfoItem label="相机所有者" value={photo.exif?.cameraOwnerName} />
                            <InfoItem label="摄影师" value={photo.exif?.artist} />
                            <InfoItem label="版权信息" value={photo.exif?.copyright} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoInfo; 