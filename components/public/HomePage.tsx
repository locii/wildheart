import Link from "next/link";
import Image from "next/image";
import { NavSlideOut } from "./NavSlideOut";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { NavItem, Article } from "@/lib/supabase/types";

const HERO_IMAGE = "https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/balazs-busznyak-T5MCCh70zYE-unsplash_wftlpo";
const AVATAR_IMAGE = "https://res.cloudinary.com/feelbettr/image/upload/q_70/f_auto/r_0/1314/anthony-avatar-large-anthony-olsen-1080x675_xmdgo9_ynyj1z_5f2vrU_ouiqt4";

type Event = {
  date: string;
  month: string;
  year: string;
  title: string;
  href: string;
  excerpt: string;
};

const UPCOMING_EVENTS: Event[] = [
  {
    date: "14",
    month: "Aug",
    year: "2026",
    title: "Naarm (Melbourne) August 2026 One Day Holotropic Breathwork Workshop",
    href: "https://melbournebreathwork.com/breathwork-workshops/naarm-melbourne-2026-august",
    excerpt: "A one-day Holotropic Breathwork workshop in Melbourne. Friday evening August 14th and all day Saturday August 15th.",
  },
  {
    date: "21",
    month: "Aug",
    year: "2026",
    title: "Perth September 2026 2-Day Residential Workshop",
    href: "https://www.wolfmedicine.com.au/events-1/residential-holotropic-breathwork-r-retreat-wa-2026",
    excerpt: "Holotropic Breathwork® residential retreat in Western Australia — two breathing sessions and two sitting sessions.",
  },
  {
    date: "09",
    month: "Oct",
    year: "2026",
    title: "Naarm (Melbourne) October 2026 Two-Day Holotropic Breathwork Workshop",
    href: "https://melbournebreathwork.com/breathwork-workshops/naarm-melbourne-2026-october-two-day-holotropic-breathwork-workshop",
    excerpt: "Two-day Holotropic Breathwork workshop in Melbourne in October 2026.",
  },
  {
    date: "11",
    month: "Dec",
    year: "2026",
    title: "Naarm (Melbourne) December 2026 Two-Day Holotropic Breathwork Workshop",
    href: "https://melbournebreathwork.com/breathwork-workshops/naarm-melbourne-2026-two-day-holotropic-breathwork-workshop-december",
    excerpt: "Two-day Holotropic Breathwork workshop in Melbourne in December 2026.",
  },
];

export function HomePage({
  nav,
  articles,
  introContent,
}: {
  nav: NavItem[];
  articles: Article[];
  introContent: string;
}) {
  return (
    <div className="public-site min-h-screen antialiased">
      {/* Hero */}
      <div className="md:p-8">
        <div
          className="rounded-t-lg md:min-h-[600px] min-h-[400px] flex items-start justify-start relative"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute md:top-20 top-9 md:right-20 right-10 z-20">
            <NavSlideOut items={nav} />
          </div>
          <div className="relative z-10 p-8">
            <h1 className="font-light text-6xl md:text-5xl lowercase tracking-widest text-white">
              <Link href="/" className="hover:text-orange-400 transition-colors">WildHeart</Link>
              <span className="text-sm block md:hidden uppercase" style={{ letterSpacing: "5.25px" }}>
                Psychotherapy
              </span>
            </h1>
            <p className="text-sm text-white uppercase tracking-widest mb-8 hidden md:block">
              <Link href="/services/psychotherapy-and-counselling" className="hover:underline hover:text-orange-400 transition-colors">Psychotherapy</Link>
              {" - "}
              <Link href="/services/holotropic-breathwork" className="hover:underline hover:text-orange-400 transition-colors">Holotropic Breathwork</Link>
              {" - "}
              <Link href="/services/mens-groups" className="hover:underline hover:text-orange-400 transition-colors">Men's Groups</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main white card */}
      <div className="md:px-8">
        <main className="rounded-b-lg bg-white p-0 md:p-8 -mt-64 min-h-[40vw] border-t-8 border-gray-100">

          {/* Intro section */}
          <div className="py-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
                {/* Left col: photo + CTA + quote */}
                <div className="md:col-span-4">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg mb-6 shadow-lg">
                    <Image
                      src={AVATAR_IMAGE}
                      alt="Anthony Olsen"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <Link
                    href="/book/brunswick"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-orange-500 text-white border border-orange-500 rounded-md font-medium text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors mb-8"
                  >
                    Book a Session
                  </Link>
                  <blockquote className="text-gray-600 italic border-l-4 border-gray-200 pl-4 mt-8 text-sm leading-relaxed">
                    In the middle of the road of my life, I awoke in a dark wood, where the true way was wholly lost.
                  </blockquote>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-3 text-right">— David Whyte</p>
                </div>

                {/* Right col: intro text */}
                <div className="md:col-span-8" style={{ marginTop: "-50px" }}>
                  <div className="pt-4 md:pt-12">
                    {introContent ? (
                      <MarkdownRenderer content={introContent} />
                    ) : (
                      <>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
                          I am a Melbourne &amp; Surfcoast based Psychotherapist, Holotropic Breathwork practitioner and Men&apos;s Group facilitator.
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          I work from a therapy clinic on Sydney Road in Brunswick and, from February 2026, will also be offering psychotherapy and individual breathwork sessions in Lorne on the Surf Coast of Victoria.
                        </p>
                        <p className="mb-4">
                          <Link href="/about" className="text-orange-600 hover:underline">Read More about my work →</Link>
                        </p>
                      </>
                    )}

                    <hr className="my-8 border-gray-200" />

                    {/* Services */}
                    <ServicesSection />

                    <hr className="my-8 border-gray-200" />

                    {/* Events */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                    <div className="space-y-3">
                      {UPCOMING_EVENTS.map((event) => (
                        <div key={event.href} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="shrink-0">
                            <div className="text-center bg-white rounded-lg p-3 min-w-[70px] shadow-sm border border-gray-100">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{event.month}</div>
                              <div className="text-2xl font-bold text-gray-900 leading-none">{event.date}</div>
                              <div className="text-xs text-gray-500">{event.year}</div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 mb-1 leading-snug">
                              <a
                                href={event.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-orange-600 transition-colors"
                              >
                                {event.title}
                              </a>
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2">{event.excerpt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources section */}
          {articles.length > 0 && (
            <div className="py-16 px-4" style={{ backgroundColor: "rgb(245, 245, 245)" }}>
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">Resources for therapy</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {articles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Locations section */}
          <div className="py-8 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
                <div className="md:col-span-3">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Two practice locations</h2>
                  <p className="text-gray-600 text-sm">Sessions available in Brunswick and Lorne on the Surf Coast of Victoria.</p>
                </div>
                <div className="md:col-span-9 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Brunswick Practice</h3>
                    <p className="text-sm text-gray-600 mb-3">503 Sydney Rd, Brunswick, 3056</p>
                    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height: 400 }}>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder={0}
                        scrolling="no"
                        src="https://maps.google.com/maps?&q=503%20Sydney%20Rd%20Brunswick%20Vic%20Australia&output=embed"
                        title="Brunswick Clinic Location"
                      />
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorne Practice</h3>
                    <p className="text-sm text-gray-600 mb-3">6/5 Cora Lynne Crt, Lorne, 3232</p>
                    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height: 400 }}>
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3121.452969334028!2d143.9361975759189!3d-38.52332537180633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad3653a2508d14d%3A0xf36e7ab931454e69!2sUnit%206%2F5%20Cora%20Lynn%20Ct%2C%20Lorne%20VIC%203232!5e0!3m2!1sen!2sau!4v1767311802600!5m2!1sen!2sau"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lorne Clinic Location"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="py-16 px-4" style={{ backgroundColor: "rgb(245, 245, 245)" }}>
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
                <div className="md:col-span-3">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={AVATAR_IMAGE}
                      alt="Anthony Olsen"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Anthony Olsen</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    My work is informed by Gestalt, Process Oriented, and Transpersonal psychotherapy, with roots in Traditional Chinese Medicine. It is awareness-based and attends to breath, body, and relational experience as central elements of the therapeutic process.
                  </p>
                  <hr className="my-6 border-gray-200" />
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/book/brunswick"
                      className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-md font-medium text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors"
                    >
                      Book in Brunswick
                    </Link>
                    <Link
                      href="/book/lorne"
                      className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-md font-medium text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors"
                    >
                      Book in Lorne
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Or{" "}
                    <Link href="/book/intro" className="text-orange-600 hover:underline">
                      book a free 20-minute exploratory call
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer style={{ backgroundColor: "#1a3347" }} className="text-white">
        <div className="container mx-auto px-6 py-10 text-center">
          <h2 className="text-2xl font-light mb-1">Wild Heart Psychotherapy</h2>
          <h3 className="text-base font-normal text-white/70 mb-4">Psychotherapy, Holotropic Breathwork &amp; Men&apos;s Groups</h3>
          <address className="not-italic text-white/80 text-sm mb-6">503 Sydney Rd, Brunswick, 3056</address>
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

function ServicesSection() {
  const services = [
    {
      title: "Psychotherapy & Counselling",
      href: "/services/psychotherapy-and-counselling",
      body: "I offer one-on-one psychotherapy and counselling in Brunswick, and from February 2026, in Lorne on the Surf Coast. My work draws on Gestalt, Process-Oriented, and Transpersonal approaches, using mind, body, and awareness-based practices to support psychological healing and personal growth.",
    },
    {
      title: "Holotropic Breathwork",
      href: "/services/holotropic-breathwork",
      body: "I offer Holotropic Breathwork sessions and workshops that use guided breathing to help people process emotions, increase self-awareness, and support personal growth.",
    },
    {
      title: "Men's Groups",
      href: "/services/mens-groups",
      body: "I facilitate ongoing Men's Groups to support personal insight, relational growth, and emotional resilience — providing a safe space for men to explore their inner world and build authentic connections.",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Services and Modalities offered</h2>
      {services.map((s, i) => (
        <div key={s.href}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">{s.body}</p>
          <Link href={s.href} className="text-orange-600 text-sm hover:underline">
            Find out more about {s.title} →
          </Link>
          {i < services.length - 1 && <hr className="mt-6 border-gray-200" />}
        </div>
      ))}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const href = article.external_url ?? `/resources/${article.slug}`;
  const isExternal = !!article.external_url;

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group block overflow-hidden bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-base font-bold text-black line-clamp-2 mb-3 group-hover:text-orange-600 transition-colors">
          {article.title} <span className="text-sm font-normal">→</span>
        </h3>
        {article.excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
        )}
      </div>
    </a>
  );
}
