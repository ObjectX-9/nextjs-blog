"use client";

import { friends } from "@/config/friends";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "./styles.css";

export default function Friends() {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  return (
    <section className="speakers py-8 px-8">
      <h1 className="text-2xl font-bold mb-2">Friends</h1>
      <div className="container">
        {/* Avatars Grid */}
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

        {/* Links List */}
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
              <span key={`span-${friend.name}-${index}`} className="text-gray-700">: {friend.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
