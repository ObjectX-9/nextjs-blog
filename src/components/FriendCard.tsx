import { Friend } from "@/config/friends";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function FriendCard({ friend }: { friend: Friend }) {
  return (
    <Link
      href={friend.link}
      target="_blank"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-500">
        <div className="absolute bottom-0 left-4 -mb-8">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white">
            <Image
              src={friend.avatar}
              alt={friend.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-10">
        <h3 className="font-semibold text-gray-900">{friend.name}</h3>
        <p className="text-sm text-gray-500">{friend.position}</p>
        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={14} />
          <span>{friend.location}</span>
        </div>
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
          {friend.description}
        </p>
      </div>
    </Link>
  );
}
