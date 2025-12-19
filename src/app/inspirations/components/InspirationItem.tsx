import React, { memo } from 'react';
import { IInspiration } from "@/app/model/inspiration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ISite } from "@/app/model/site";
import BilibiliPlayer from "@/components/inspirations/BilibiliPlayer";
import ImageGallery from "@/components/inspirations/ImageGallery";
import LinksList from "@/components/inspirations/LinksList";
import InspirationHeader from "@/components/inspirations/InspirationHeader";
import TagsList from "@/components/inspirations/TagsList";
import ActionButtons from "@/components/inspirations/ActionButtons";
import { useInspirationView } from "../hooks/useInspirationView";
import { DouyinVideoPlayer } from "@/components/DouyinVideoPreview";

interface InspirationItemProps {
    inspiration: IInspiration;
    onLike: (id: string) => void;
    onView: (id: string) => void;
    hasLiked: boolean;
    site: ISite | null;
    isMobile: boolean;
}

export const InspirationItem = memo<InspirationItemProps>(({
    inspiration,
    onLike,
    onView,
    hasLiked,
    site,
    isMobile,
}) => {
    const { handleMouseEnter, handleMouseLeave } = useInspirationView({
        inspirationId: inspiration._id || '',
        onView,
    });

    const containerClassName = isMobile
        ? "flex flex-col space-y-2 mb-4"
        : "flex flex-col space-y-2 mb-8";

    const avatarClassName = isMobile
        ? "w-8 h-8 flex-shrink-0"
        : "w-10 h-10 flex-shrink-0";

    const contentSpaceClassName = isMobile
        ? "flex items-start space-x-2"
        : "flex items-start space-x-3";

    const contentWrapperClassName = isMobile
        ? "flex-1 min-w-0"
        : "flex-1";

    const textClassName = isMobile
        ? "text-sm leading-relaxed mb-2 whitespace-pre-wrap break-words"
        : "text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words";

    return (
        <div
            className={containerClassName}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={contentSpaceClassName}>
                <Avatar className={avatarClassName}>
                    <AvatarImage src={site?.author?.avatar} alt={site?.author?.name} />
                    <AvatarFallback>{(site?.author?.name)?.[0]}</AvatarFallback>
                </Avatar>
                <div className={contentWrapperClassName}>
                    <InspirationHeader
                        title={inspiration.title}
                        createdAt={inspiration.createdAt}
                        site={site}
                        isMobile={isMobile}
                    >
                        <p className={textClassName}>
                            {inspiration.content}
                        </p>

                        {inspiration.bilibili && (
                            <BilibiliPlayer
                                bvid={inspiration.bilibili.bvid}
                                page={inspiration.bilibili.page || 1}
                                title={inspiration.bilibili.title}
                                isMobile={isMobile}
                            />
                        )}

                        {inspiration.videos && inspiration.videos.length > 0 && (
                            <div className={`grid gap-3 mb-3 ${inspiration.videos.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                                {inspiration.videos.map((video, index) => (
                                    video.isDouyin ? (
                                        <DouyinVideoPlayer key={index} url={video.url} title={video.title} thumbnail={video.thumbnail} />
                                    ) : (
                                        <div key={index} className="relative aspect-video overflow-hidden rounded-lg bg-gray-50 shadow-sm">
                                            <video
                                                src={video.url}
                                                controls
                                                className="w-full h-full object-cover"
                                                poster={video.thumbnail}
                                                preload="metadata"
                                            />
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {inspiration.images && inspiration.images.length > 0 && (
                            <ImageGallery images={inspiration.images} isMobile={isMobile} />
                        )}

                        {inspiration.links && inspiration.links.length > 0 && (
                            <LinksList links={inspiration.links} isMobile={isMobile} />
                        )}

                        {inspiration.tags && inspiration.tags.length > 0 && (
                            <TagsList tags={inspiration.tags} isMobile={isMobile} />
                        )}

                        <ActionButtons
                            inspirationId={inspiration._id || ''}
                            likes={inspiration.likes || 0}
                            views={inspiration.views || 0}
                            hasLiked={hasLiked}
                            onLike={onLike}
                            isMobile={isMobile}
                        />
                    </InspirationHeader>
                </div>
            </div>
        </div>
    );
});

InspirationItem.displayName = 'InspirationItem'; 