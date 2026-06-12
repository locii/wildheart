import Link from "next/link";
import { NavSlideOut } from "./NavSlideOut";
import type { NavItem } from "@/lib/supabase/types";

const HERO_IMAGE = "https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/balazs-busznyak-T5MCCh70zYE-unsplash_wftlpo";

export function PublicHeader({ nav }: { nav: NavItem[] }) {
  return (
    <div className="public-header md:px-8 md:pt-8">
      <div
        className="rounded-t-lg min-h-100 flex items-start justify-start relative overflow-hidden"
        style={{
          backgroundImage: `url('${HERO_IMAGE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute md:top-16 top-8 md:right-20 right-10 z-20">
          <NavSlideOut items={nav} />
        </div>
        <div className="relative z-10 p-8">
          <h1 className="font-light text-4xl md:text-4xl lowercase tracking-widest text-white mb-4">
            <Link href="/" className="text-white! hover:text-orange-400 transition-colors">WildHeart</Link>
          </h1>
          <p className="text-sm text-white uppercase tracking-widest">
            <Link href="/services/psychotherapy-and-counselling" className="hover:underline hover:text-orange-400 transition-colors text-white!">Psychotherapy</Link>
            {" - "}
            <Link href="/services/holotropic-breathwork" className="hover:underline hover:text-orange-400 transition-colors text-white!">Holotropic Breathwork</Link>
            {" - "}
            <Link href="/services/mens-groups" className="hover:underline hover:text-orange-400 transition-colors text-white!">Men&apos;s Groups</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
