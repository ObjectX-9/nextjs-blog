"use client";

import { TimelineEvent as TimelineEventComponent } from "./TimelineEvent";
import { ObjectId } from 'mongodb';
import { useState, useEffect } from 'react';

interface TimelineLink {
  text: string;
  url: string;
}

interface TimelineEvent {
  _id: string | ObjectId;
  year: number;
  month: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: TimelineLink[];
}

// Cache management
const CACHE_KEYS = {
  TIMELINE_EVENTS: 'timeline_events',
  LAST_FETCH: 'timeline_last_fetch',
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

export default function Timeline() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineEvents = async () => {
      // Try to get from cache first
      const cached = getFromCache<TimelineEvent[]>(CACHE_KEYS.TIMELINE_EVENTS);
      if (cached) {
        setTimelineEvents(cached);
        setLoading(false);
        return;
      }

      try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const res = await fetch(`${protocol}//${host}/api/timelines`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch timeline events');
        }

        const data = await res.json();
        setTimelineEvents(data.events);
        setCache(CACHE_KEYS.TIMELINE_EVENTS, data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline events');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineEvents();
  }, []);

  // Group events by year
  const eventsByYear = timelineEvents.reduce((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  // Sort years in descending order
  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (loading) {
    return (
      <main className="flex-1 h-screen overflow-hidden">
        <div className="h-full overflow-y-auto px-4 sm:px-4 py-8 sm:py-16">
          <div className="w-full max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8">
                  <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-24 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 h-screen overflow-hidden">
        <div className="h-full overflow-y-auto px-4 sm:px-4 py-8 sm:py-16">
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto px-4 sm:px-4 py-8 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            时间轴
          </h1>
          <div className="mb-4 sm:mb-6 last:mb-0 text-sm sm:text-base">
            记录了生活中的重要时刻
          </div>
          {years.map((year) => (
            <div key={year} className="relative">
              <div className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8">
                {year}
              </div>
              <div className="relative">
                {eventsByYear[year]
                  .sort((a, b) => b.month - a.month)
                  .map((event) => (
                    <TimelineEventComponent key={event._id.toString()} event={event} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
