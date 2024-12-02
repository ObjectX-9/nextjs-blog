import { TimelineEvent as TimelineEventType } from "./types";
import Image from "next/image";
import { Tweet } from "react-tweet";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function TimelineEvent({ event }: { event: TimelineEventType }) {
  return (
    <div className="group relative flex gap-8 pb-16">
      {/* Month circle and connecting line */}
      <div className="flex-none relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
          {monthNames[event.month - 1]}
        </div>
        <div className="absolute top-10 bottom-0 w-[1px] bg-gray-200 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <h2 className="text-2xl font-medium mb-2">{event.title}</h2>
        {event.location && (
          <span className="text-gray-500 mb-2">• {event.location}</span>
        )}
        <p className="text-gray-600 text-lg mb-4">{event.description}</p>

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
          <div className="mt-4">
            <Tweet id={event.tweetUrl.split("/").pop() || ""} />
          </div>
        )}

        {event.imageUrl && (
          <div className="mt-4 relative h-[300px] rounded-lg overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
