import { TimelineEvent as TimelineEventComponent } from "./TimelineEvent";
import { headers } from 'next/headers';
import { ObjectId } from 'mongodb';

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

async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  const res = await fetch(`${protocol}://${host}/api/timelines`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch timeline events');
  }

  const data = await res.json();
  return data.events;
}

export default async function Timeline() {
  const timelineEvents = await getTimelineEvents();

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
