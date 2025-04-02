import React from 'react';

interface BilibiliVideoProps {
  bvid: string;
  page?: number;
  title?: string;
  isMobile?: boolean;
}

/**
 * B站视频播放器组件，同时适配移动端和桌面端
 */
export const BilibiliPlayer: React.FC<BilibiliVideoProps> = ({
  bvid,
  page = 1,
  title,
  isMobile = false
}) => {
  return (
    <div className="w-full max-w-full sm:max-w-5xl mx-auto mb-4">
      <div className={`relative w-full aspect-video ${isMobile ? '' : 'min-h-[240px] sm:min-h-[480px]'}`}>
        <iframe
          src={`//player.bilibili.com/player.html?bvid=${bvid}&page=${page}&autoplay=0&quality=80`}
          scrolling="no"
          style={{ border: "none" }}
          frameBorder="no"
          allowFullScreen={true}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
        />
      </div>
      <div className="flex items-center space-x-2 mt-2 text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z"
            fill="#00AEEC"
          />
        </svg>
        <span>BV号: {bvid}</span>
        {title && (
          <span className="truncate">
            标题: {title}
          </span>
        )}
      </div>
    </div>
  );
};

export default BilibiliPlayer;
