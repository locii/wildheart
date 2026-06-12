import Link from "next/link";
import Image from "next/image";

type GridItem = {
  title: string;
  href: string;
  excerpt?: string;
  image?: string;
};

const colsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function ContentGrid({ items, cols = 3 }: { items: GridItem[]; cols?: number }) {
  if (!items.length) return null;
  const grid = colsClass[cols] ?? colsClass[3];

  return (
    <div className={`grid ${grid} gap-5 my-8`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
        >
          {item.image && (
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="flex-1 p-4 space-y-1.5">
            <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-3">{item.excerpt}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
