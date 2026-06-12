import { getMenus } from "@/lib/cms";
import { MenuList } from "@/components/admin/MenuList";

export default async function MenusPage() {
  const menus = await getMenus();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Menus</h1>
      <MenuList menus={menus} />
    </div>
  );
}
