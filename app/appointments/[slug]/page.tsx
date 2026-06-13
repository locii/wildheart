import { redirect } from "next/navigation";

export default async function AppointmentsSlugRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  // Preserve embed mode for existing embed links
  redirect(embed === "true" ? `/${slug}?embed=true` : `/${slug}`);
}
