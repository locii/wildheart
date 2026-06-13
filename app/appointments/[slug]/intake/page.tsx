import { IntakeForm } from "@/components/booking/IntakeForm";

export default async function IntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { slug } = await params;
  const { appointmentId } = await searchParams;

  return (
    <IntakeForm
      appointmentId={appointmentId ?? null}
      successHref={`/appointments/${slug}/success`}
      backHref="/appointments"
    />
  );
}
