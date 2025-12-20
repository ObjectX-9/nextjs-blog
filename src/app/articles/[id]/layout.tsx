import { Metadata } from 'next';
import { articleDb } from '@/utils/db-instances';

interface Props {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
}

// 动态生成 metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const article = await articleDb.findById(id);

        if (!article) {
            return {
                title: '文章不存在',
            };
        }

        const title = article.title;
        const description = article.content?.slice(0, 160).replace(/[#*`\n]/g, '') || '';
        const url = `https://object-x.com.cn/articles/${id}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url,
                type: 'article',
                siteName: 'ObjectX 博客',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
        };
    } catch (error) {
        console.error('生成 metadata 失败:', error);
        return {
            title: '文章详情',
        };
    }
}

export default function ArticleLayout({ children }: Props) {
    return <>{children}</>;
}
