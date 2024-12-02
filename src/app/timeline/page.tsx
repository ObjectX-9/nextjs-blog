import { TimelineEvent } from "./TimelineEvent";
import { timelineEvents } from "./types";

export default function Timeline() {
  // Group events by year
  const eventsByYear = timelineEvents.reduce((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, typeof timelineEvents>);

  // Sort years in descending order
  const years = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">时间轴</h1>
          <div className="mb-6 last:mb-0">记录了生活中的重要时刻</div>
          {years.map((year) => (
            <div key={year} className="relative">
              <div className="text-2xl font-medium mb-8">{year}</div>
              <div className="relative">
                {eventsByYear[year]
                  .sort((a, b) => b.month - a.month)
                  .map((event, index) => (
                    <TimelineEvent key={index} event={event} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}