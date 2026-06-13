import { IntakeForm } from "@/components/booking/IntakeForm";

export default async function IntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { location: slug } = await params;
  const { appointmentId } = await searchParams;

  return (
    <IntakeForm
      appointmentId={appointmentId ?? null}
      successHref={`/${slug}/success`}
      backHref="/"
    />
  );
}
