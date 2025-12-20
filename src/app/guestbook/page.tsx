'use client';

import GiscusComments from '@/components/GiscusComments';
import Link from 'next/link';
import { useSiteStore } from '@/store/site';
import { useEffect, useState } from 'react';
import { ISocialLink } from '@/app/model/social-link';
import { socialLinkBusiness } from '@/app/business/social-link';
import { MessageCircle, Bug, Users, Star } from 'lucide-react';

export default function GuestbookPage() {
    const { site } = useSiteStore();
    const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);

    useEffect(() => {
        const fetchSocialLinks = async () => {
            try {
                const links = await socialLinkBusiness.getSocialLinks();
                setSocialLinks(links);
            } catch (error) {
                console.error('Failed to fetch social links:', error);
            }
        };
        fetchSocialLinks();
    }, []);

    const juejinLink = socialLinks.find(link => link.name === '掘金')?.url;
    const githubLink = socialLinks.find(link => link.name === 'Github' || link.name === 'GitHub')?.url;

    const features = [
        { icon: MessageCircle, text: '分享想法和建议' },
        { icon: Bug, text: '反馈问题或 Bug' },
        { icon: Users, text: '交个朋友' },
        { icon: Star, text: '路过打招呼' },
    ];

    return (
        <div className="h-screen w-full overflow-y-auto custom-scrollbar-thin">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* 页面标题 */}
                <h1 className="text-2xl font-bold mb-8">📝 留言板</h1>

                {/* 欢迎卡片 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">👋</div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                你好，欢迎来到留言板！
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                我是 <span className="font-medium text-gray-900">{site?.author?.name || 'ObjectX'}</span>，
                                {site?.author?.bio || '前端工程师'}。
                                {site?.author?.description || '希望通过这个博客与大家分享生活和技术，期待与你交流！'}
                            </p>

                            {/* 功能标签 */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {features.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 shadow-sm"
                                    >
                                        <item.icon size={12} />
                                        {item.text}
                                    </span>
                                ))}
                            </div>

                            {/* 社交链接 */}
                            {(juejinLink || githubLink) && (
                                <p className="text-xs text-gray-500">
                                    也可以在{' '}
                                    {juejinLink && (
                                        <Link href={juejinLink} target="_blank" className="text-gray-900 hover:underline font-medium">
                                            掘金
                                        </Link>
                                    )}
                                    {juejinLink && githubLink && ' / '}
                                    {githubLink && (
                                        <Link href={githubLink} target="_blank" className="text-gray-900 hover:underline font-medium">
                                            GitHub
                                        </Link>
                                    )}
                                    {' '}找到我
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 评论区 */}
                <GiscusComments
                    className="mt-0 pt-0 border-t-0"
                    isOpenGiscus={site?.isOpenGiscus}
                    giscusRepo={site?.giscusRepo}
                    giscusRepoId={site?.giscusRepoId}
                    giscusCategory={site?.giscusCategory}
                    giscusCategoryId={site?.giscusCategoryId}
                />
            </div>
        </div>
    );
}
