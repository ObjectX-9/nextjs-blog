"use client";

import { friends, Friend } from "@/config/friends";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./styles.css";

// Mobile card view component
const MobileCard = ({ friend }: { friend: Friend }) => (
  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex items-center p-3 gap-4">
    <div className="relative h-16 w-16 flex-shrink-0">
      <Image
        src={friend.avatar}
        alt={friend.name}
        fill
        className="object-cover rounded-full"
      />
    </div>
    <div className="flex-grow min-w-0">
      <h3 className="font-medium text-base mb-0.5 truncate">{friend.name}</h3>
      <p className="text-gray-600 text-sm mb-1 truncate">{friend.title}</p>
      {friend.location && (
        <p className="text-gray-500 text-xs mb-1 truncate"> {friend.location}</p>
      )}
      <Link
        href={friend.link}
        target="_blank"
        className="text-gray-600 hover:text-gray-900 text-xs inline-flex items-center transition-colors"
      >
        访问主页 →
      </Link>
    </div>
  </div>
);

// Desktop view component
const DesktopView = ({
  friends,
  hoveredName,
  setHoveredName,
}: {
  friends: Friend[];
  hoveredName: string | null;
  setHoveredName: (name: string | null) => void;
}) => (
  <div className="container hidden md:block">
    <ul className="avatars grid grid-cols-3 gap-3 relative">
      {friends.map((friend, index) => (
        <li
          key={`avatar-${friend.name}-${index}`}
          style={
            {
              "--for": `--${friend.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-name`,
            } as any
          }
          className="relative aspect-square overflow-hidden cursor-pointer"
          onMouseEnter={() => setHoveredName(friend.name)}
          onMouseLeave={() => setHoveredName(null)}
        >
          <Image
            key={`image-${friend.name}-${index}`}
            src={friend.avatar}
            alt={friend.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              hoveredName === friend.name ? "scale-125 brightness-75" : ""
            }`}
            style={
              {
                "--is": `--${friend.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-avatar`,
              } as any
            }
          />
        </li>
      ))}
    </ul>

    <ul className="links space-y-2">
      {friends.map((friend, index) => (
        <li
          key={`link-${friend.name}-${index}`}
          style={
            {
              "--for": `--${friend.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-avatar`,
              "--bg": `url('${friend.avatar}')`,
            } as any
          }
          onMouseEnter={() => setHoveredName(friend.name)}
          onMouseLeave={() => setHoveredName(null)}
        >
          <Link
            key={`link-${friend.name}-${index}`}
            href={friend.link}
            target="_blank"
            className={`transition-colors duration-300 ${
              hoveredName === friend.name ? "active" : ""
            }`}
            style={
              {
                "--is": `--${friend.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-name`,
              } as any
            }
          >
            {friend.name}
          </Link>
          <span key={`span-${friend.name}-${index}`} className="text-gray-700">
            : {friend.title}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default function Friends() {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // 初始检查
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px 是 Tailwind md 断点
    };
    
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="speakers py-8 px-8">
      <h1 className="text-2xl font-bold mb-6">🔗 友情链接</h1>
      <div className="mb-6 last:mb-0">友情链接，记录生活中的朋友们。</div>
      
      {isMobile ? (
        <div className="grid grid-cols-1 gap-6">
          {friends.map((friend, index) => (
            <MobileCard key={`mobile-${friend.name}-${index}`} friend={friend} />
          ))}
        </div>
      ) : (
        <DesktopView
          friends={friends}
          hoveredName={hoveredName}
          setHoveredName={setHoveredName}
        />
      )}
    </section>
  );
}
