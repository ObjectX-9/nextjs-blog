'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Link, Check, X } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareButtonProps {
    title: string;
    description?: string;
    url?: string;
}

export default function ShareButton({ title, description = '', url }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showQrModal, setShowQrModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 生成微信二维码并复制链接
    const generateQrCode = async () => {
        try {
            // 同时复制链接
            await navigator.clipboard.writeText(shareUrl);

            const qrUrl = await QRCode.toDataURL(shareUrl, {
                width: 200,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });
            setQrCodeUrl(qrUrl);
            setShowQrModal(true);
            setIsOpen(false);
        } catch (err) {
            console.error('生成二维码失败:', err);
        }
    };

    // 复制链接
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    // 分享到微博
    const shareToWeibo = () => {
        const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        window.open(weiboUrl, '_blank', 'width=600,height=500');
        setIsOpen(false);
    };

    // 分享到 Twitter
    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=500');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* 分享按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="分享文章"
            >
                <Share2 size={16} />
                <span className="hidden sm:inline">分享</span>
            </button>

            {/* 分享菜单 */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                        onClick={generateQrCode}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z" />
                        </svg>
                        微信
                    </button>
                    <button
                        onClick={shareToWeibo}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.381-1.017.422-1.896-.001-2.52-.791-1.163-2.924-1.102-5.32-.026-.001-.001-.765.335-.568-.271.383-1.186.324-2.178-.27-2.749-1.346-1.294-4.924.045-7.996 2.992C2.131 10.463.56 12.6.56 14.396c0 3.442 4.407 5.536 8.717 5.536 5.651 0 9.414-3.28 9.414-5.88 0-1.573-1.322-2.467-2.632-2.803zm2.231-4.202c-.881-.973-2.174-1.373-3.408-1.166-.334.056-.648-.17-.704-.505-.056-.336.17-.648.506-.704 1.639-.273 3.355.256 4.522 1.548 1.166 1.29 1.564 3.04 1.132 4.636-.097.332-.44.524-.77.427-.332-.097-.524-.44-.427-.77.323-1.197.031-2.51-.851-3.466zm2.229-2.463c-1.479-1.636-3.651-2.306-5.727-1.96-.349.059-.676-.178-.735-.527-.059-.349.178-.676.527-.735 2.543-.424 5.2.396 7.009 2.397 1.808 1.999 2.366 4.689 1.631 7.143-.106.348-.471.544-.818.438-.348-.106-.544-.471-.438-.818.601-2.005.145-4.202-1.449-5.938z" />
                        </svg>
                        微博
                    </button>
                    <button
                        onClick={shareToTwitter}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter / X
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                        onClick={copyLink}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Link size={16} />}
                        {copied ? '已复制' : '复制链接'}
                    </button>
                </div>
            )}

            {/* 微信二维码弹窗 - 使用 Portal 渲染到 body */}
            {showQrModal && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-[280px] max-w-[90vw]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">微信扫码分享</h3>
                            <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            {qrCodeUrl && <img src={qrCodeUrl} alt="分享二维码" className="w-48 h-48" />}
                        </div>
                        <p className="text-center text-sm text-gray-500 mb-2">打开微信扫一扫，分享给好友</p>
                        <p className="text-center text-xs text-green-600">✓ 链接已复制到剪贴板</p>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
