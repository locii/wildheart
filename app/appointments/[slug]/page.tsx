import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SidebarBlock } from "@/components/public/SidebarBlock";
import { getNav, getPage } from "@/lib/cms";
import type { Location, AppointmentType } from "@/lib/supabase/types";

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "true";

  const supabase = createServiceClient();

  const [{ data: locData }, { data: typesData }, nav] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase.from("appointment_types").select("*").eq("is_active", true).order("sort_order"),
    getNav(),
  ]);

  const locations = (locData ?? []) as Location[];
  const types = (typesData ?? []) as AppointmentType[];

  const location = locations.find((l) => l.slug === slug);
  const preselectedType = !location ? types.find((t) => t.slug === slug) : undefined;

  if (!location && !preselectedType) notFound();

  const cmsPage = !isEmbed ? await getPage(`appointments/${slug}`) : null;
  const sidebar = cmsPage?.sidebar_block ? <SidebarBlock block={cmsPage.sidebar_block} /> : undefined;

  if (isEmbed) {
    return (
      <BookingFlow
        locations={location ? [location] : locations}
        initialLocation={location}
        types={types}
        initialType={preselectedType}
        embed
      />
    );
  }

  const title = preselectedType
    ? preselectedType.name
    : "Make a booking at Wildheart Psychotherapy";
  const subtitle = location?.name;

  return (
    <PublicLayout nav={nav} sidebar={sidebar} asideClassName={["aside-booking", cmsPage?.aside_class].filter(Boolean).join(" ")}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
        <BookingFlow
          locations={location ? [location] : locations}
          initialLocation={location}
          types={types}
          initialType={preselectedType}
          embed={false}
        />
      </div>
    </PublicLayout>
  );
}
