import { redirect } from "next/navigation";

export default async function TypeRootPage({
  params,
}: {
  params: Promise<{ location: string; type: string }>;
}) {
  const { location, type } = await params;
  redirect(`/${location}/${type}/select-time`);
}
