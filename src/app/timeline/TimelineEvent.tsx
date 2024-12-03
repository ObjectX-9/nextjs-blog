import { TimelineEvent as TimelineEventType } from "../../config/timelines";
import Image from "next/image";
import { Tweet } from "react-tweet";
import { MapPin } from "lucide-react";

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export function TimelineEvent({ event }: { event: TimelineEventType }) {
  return (
    <div className="group relative flex gap-4 sm:gap-8 pb-12 sm:pb-16">
      {/* Month circle and connecting line */}
      <div className="flex-none relative flex flex-col items-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-medium">
          {monthNames[event.month - 1]}
        </div>
        <div className="absolute top-8 sm:top-10 bottom-0 w-[1px] bg-gray-200 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-medium truncate max-w-full">
            {event.title}
          </h2>
          {event.location && (
            <span className="text-gray-500 flex items-center gap-1 text-sm sm:text-base truncate whitespace-nowrap">
              <MapPin size={14} className="flex-shrink-0 text-green-500" />
              {event.location}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-base sm:text-lg mb-2">
          {event.description}
        </p>

        {/* Links with arrow */}
        {event.links?.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex items-center gap-1 mb-2 text-sm sm:text-base"
          >
            {link.text}
            <span className="text-xs">↗</span>
          </a>
        ))}

        {event.tweetUrl && (
          <div className="mt-1 w-full sm:w-3/4 max-w-2xl">
            <Tweet id={event.tweetUrl.split("/").pop() || ""} />
          </div>
        )}

        {event.imageUrl && (
          <div className="mt-1 relative w-full sm:w-3/4 max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
