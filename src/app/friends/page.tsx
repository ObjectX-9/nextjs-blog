"use client";

import { Friend } from "@/config/friends";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./styles.css";

interface FriendWithId extends Friend {
  _id: string;
}

// 过滤出审核通过的友链

// Cache management
const CACHE_KEYS = {
  FRIENDS: "friends_data",
  LAST_FETCH: "friends_last_fetch",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

// Mobile card view component
const MobileCard = ({ friend }: { friend: FriendWithId }) => (
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
        <p className="text-gray-500 text-xs mb-1 truncate">
          {" "}
          {friend.location}
        </p>
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
  friends: FriendWithId[];
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

// 新友链的初始状态
const initialNewFriend: Friend = {
  avatar: "",
  name: "",
  title: "",
  description: "",
  link: "",
  position: "",
  location: "",
  isApproved: false,
};

export default function Friends() {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFriend, setNewFriend] = useState<Friend>(initialNewFriend);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friends, setFriends] = useState<FriendWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      // Try to get from cache first
      const cached = getFromCache<FriendWithId[]>(CACHE_KEYS.FRIENDS);
      if (cached) {
        setFriends(cached);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/friends?approved=true");
        const data = await response.json();
        if (data.success) {
          setFriends(data.friends);
          setCache(CACHE_KEYS.FRIENDS, data.friends);
        } else {
          throw new Error("Failed to fetch friends");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch friends"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/friends/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friend: newFriend }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit friend");
      }

      setNewFriend(initialNewFriend);
      setShowAddForm(false);
      alert("提交成功！请等待审核。");
    } catch (error) {
      console.error("Error submitting friend:", error);
      alert("提交失败，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="speakers py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-64 mb-8"></div>

        {isMobile ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-grow">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="container hidden md:block animate-pulse">
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="speakers py-8 px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🔗 友情链接</h1>
        </div>
        <div className="text-red-500">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="speakers py-8 px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🔗 友情链接</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          提交友链
        </button>
      </div>
      <div className="mb-6 last:mb-0">友情链接，记录生活中的朋友们。</div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">提交友链</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newFriend.avatar}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, avatar: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="头像URL"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.name}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="名字"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.title}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="标题"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.description}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="描述"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.link}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, link: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="链接"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.position}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, position: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="职位（可选）"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newFriend.location}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, location: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="地点（可选）"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                >
                  {isSubmitting ? "提交中..." : "提交"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="grid grid-cols-1 gap-6">
          {friends.map((friend, index) => (
            <MobileCard
              key={`mobile-${friend.name}-${index}`}
              friend={friend}
            />
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
