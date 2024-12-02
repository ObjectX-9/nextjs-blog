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
    <main className="flex min-h-screen w-full flex-col items-center overflow-y-auto py-16 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-16">Journey</h1>
        {years.map((year) => (
          <div key={year} className="relative">
            <div className="text-4xl font-medium mb-12">{year}</div>
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
    </main>
  );
}
