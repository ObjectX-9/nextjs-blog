'use client';

import ShareButton from './ShareButton';

interface PageHeaderProps {
    title: string;
    description?: string;
    emoji?: string;
    showShare?: boolean;
}

export default function PageHeader({
    title,
    description,
    emoji,
    showShare = true
}: PageHeaderProps) {
    const displayTitle = emoji ? `${emoji} ${title}` : title;

    return (
        <div className="flex items-start justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold">{displayTitle}</h1>
                {description && (
                    <p className="text-gray-600 mt-1">{description}</p>
                )}
            </div>
            {showShare && (
                <ShareButton title={title} />
            )}
        </div>
    );
}
