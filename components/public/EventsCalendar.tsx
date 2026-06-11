type FeedEvent = {
  title: string;
  extract: string;
  location: string | null;
  url: string;
  image: string | null;
};

export function EventsCalendar({ events }: { events: FeedEvent[] }) {
  if (!events.length) return null;

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <a
          key={event.url}
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded-md px-2 group block"
        >
          {event.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt=""
              className="shrink-0 w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1 leading-snug group-hover:text-orange-600 transition-colors">
              {event.title}
            </h4>
            {event.location && (
              <p className="text-xs text-gray-400 mb-1">{event.location}</p>
            )}
            <p className="text-sm text-gray-500 line-clamp-2">{event.extract}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
