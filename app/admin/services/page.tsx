import { ServicesEditor } from "@/components/admin/ServicesEditor";

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-5">Services</h1>
      <ServicesEditor />
    </div>
  );
}
