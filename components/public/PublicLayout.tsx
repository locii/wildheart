import Link from "next/link";
import { PublicHeader } from "./PublicHeader";
import type { NavItem } from "@/lib/supabase/types";

export function PublicLayout({
  children,
  nav,
  hero,
  sidebar,
  imageUrl,
  asideClassName,
  className,
}: {
  children: React.ReactNode;
  nav: NavItem[];
  hero?: React.ReactNode;
  sidebar?: React.ReactNode;
  imageUrl?: string;
  asideClassName?: string;
  className?: string;
}) {
  return (
    <div className={["public-site min-h-screen antialiased", className].filter(Boolean).join(" ")}>
      {hero ?? <PublicHeader nav={nav} />}

      <div className="px-4 md:px-8">
        <main className="rounded-b-lg bg-white min-h-[60vh] border-t-12 border-slate-100 px-8">
          {sidebar|| imageUrl ? (
            <div className="flex flex-col gap-8 md:flex-row max-w-5xl">
              <aside className={`order-last md:order-first w-full md:w-1/4 md:pt-12${asideClassName ? ` ${asideClassName}` : ""}`}>
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full rounded-xl object-cover mb-6 p-4 bg-white"
                  />
                )}
                {sidebar}
              </aside>
              <div className="order-first md:order-last flex-1 min-w-0">{children}</div>
            </div>
          ) : children}
        </main>
      </div>

      <footer  className="text-white mt-0">
        <div className="container mx-auto px-6 py-10 text-center">
          <h2 className="text-2xl font-light mb-1">Wild Heart Psychotherapy</h2>
          <h3 className="text-base font-normal text-white/70 mb-4">Psychotherapy, Holotropic Breathwork &amp; Men&apos;s Groups</h3>
          <address className="not-italic text-white/80 text-sm mb-6">
            503 Sydney Rd, Brunswick, 3056
          </address>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link href="/services" className="text-white/70 hover:text-white transition-colors">Services</Link>
            <Link href="/resources" className="text-white/70 hover:text-white transition-colors">Resources</Link>
            <Link href="/appointments/brunswick" className="text-white/70 hover:text-white transition-colors">Appointments</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
          </nav>
          <p className="mt-6 text-xs uppercase text-white/40 tracking-wide">
            Copyright Wildheart Psychotherapy {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
