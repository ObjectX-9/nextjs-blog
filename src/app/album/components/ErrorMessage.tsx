import React from 'react';

interface ErrorMessageProps {
    error: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
    return (
        <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
            <h1 className="text-3xl font-bold mb-8">生活相册</h1>

            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                {/* 错误图标 */}
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                {/* 错误信息 */}
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">加载失败</h3>
                    <p className="text-red-500 text-sm max-w-md">{error}</p>
                </div>

                {/* 重试按钮 */}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        重试
                    </button>
                )}
            </div>
        </main>
    );
};

export default React.memo(ErrorMessage); 