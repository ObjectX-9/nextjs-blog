"use client";

import { TimelineEvent as TimelineEventComponent } from "./TimelineEvent";
import { ITimelineEvent } from "@/app/model/timeline";
import { timelinesBusiness } from "@/app/business/timelines";
import { useState, useEffect } from 'react';

export default function Timeline() {
  const [timelineEvents, setTimelineEvents] = useState<ITimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineEvents = async () => {
      try {
        const events = await timelinesBusiness.getTimelineEvents();
        setTimelineEvents(events);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取时间线事件失败');
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
  }, {} as Record<number, ITimelineEvent[]>);

  // Sort years in descending order
  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (loading) {
    return (
      <main className="flex-1 h-screen overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
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
        <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto custom-scrollbar-thin px-4 sm:px-4 py-8 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            时间笔记
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
                    <TimelineEventComponent key={event._id || `${event.year}-${event.month}-${event.day}-${event.title}`} event={event} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
