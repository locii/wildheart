import { redirect } from "next/navigation";

export default async function TypeRootPage({
  params,
}: {
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type } = await params;
  redirect(`/appointments/${slug}/${type}/select-time`);
}
