import Link from "next/link";
import { NavSlideOut } from "./NavSlideOut";
import type { NavItem } from "@/lib/supabase/types";

export function PublicLayout({
  children,
  nav,
  hero,
  sidebar,
}: {
  children: React.ReactNode;
  nav: NavItem[];
  hero?: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="public-site min-h-screen antialiased">
      {hero ? (
        hero
      ) : (
        <div className="relative px-4 md:px-8 pt-8 pb-0">
          <div
            className="relative rounded-t-lg overflow-hidden min-h-80 flex items-start"
            style={{
              backgroundColor: "#1e3d58",
              backgroundImage: "url(https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto//w_1200/1042/balazs-busznyak-T5MCCh70zYE-unsplash_wftlpo)",
              backgroundSize: "cover",
              backgroundPosition: "left top",
            }}
          >
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
              <NavSlideOut items={nav} />
            </div>
            <div className="relative z-10 p-6 md:p-8">
              <h1 className="font-light text-4xl md:text-5xl lowercase tracking-widest text-white">
                <Link href="/" className="text-white! hover:text-orange-400 transition-colors">WildHeart</Link>
              </h1>
              <p className="text-sm uppercase tracking-widest hidden md:block" style={{ color: "rgba(255,255,255,0.85)" }}>
                <Link href="/services/psychotherapy-and-counselling" className="no-theme-link text-white/85 hover:text-orange-400 transition-colors">Psychotherapy</Link>
                {" - "}
                <Link href="/services/holotropic-breathwork" className="no-theme-link text-white/85 hover:text-orange-400 transition-colors">Holotropic Breathwork</Link>
                {" - "}
                <Link href="/services/mens-groups" className="no-theme-link text-white/85 hover:text-orange-400 transition-colors">Men&apos;s Groups</Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-8">
        <main className="rounded-b-lg bg-white min-h-[60vh]">
          {sidebar ? (
            <div className="flex flex-col md:flex-row">
              <aside className="order-last md:order-first w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-r border-stone-100 p-6 md:pt-12">
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
            <Link href="/book/brunswick" className="text-white/70 hover:text-white transition-colors">Appointments</Link>
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
