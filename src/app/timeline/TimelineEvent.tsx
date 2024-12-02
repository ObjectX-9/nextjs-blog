import { TimelineEvent as TimelineEventType } from "./types";
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
    <div className="group relative flex gap-8 pb-16">
      {/* Month circle and connecting line */}
      <div className="flex-none relative flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
          {monthNames[event.month - 1]}
        </div>
        <div className="absolute top-10 bottom-0 w-[1px] bg-gray-200 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-medium">{event.title}</h2>
          {event.location && (
            <span className="text-gray-500 flex items-center gap-1">
              <MapPin size={14} className="text-green-500" />
              {event.location}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-lg mb-2">{event.description}</p>

        {/* Links with arrow */}
        {event.links?.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex items-center gap-1 mb-2"
          >
            {link.text}
            <span className="text-xs">↗</span>
          </a>
        ))}

        {event.tweetUrl && (
          <div className="mt-4 w-3/4 max-w-2xl">
            <Tweet id={event.tweetUrl.split("/").pop() || ""} />
          </div>
        )}

        {event.imageUrl && (
          <div className="mt-4 relative w-3/4 max-w-2xl aspect-[16/9] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 75vw, 50vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
