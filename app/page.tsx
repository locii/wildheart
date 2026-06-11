import { getNav, getArticles, getPage } from "@/lib/cms";
import { HomePage } from "@/components/public/HomePage";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const [nav, { articles }, homePage] = await Promise.all([
    getNav(),
    getArticles(1, 6),
    getPage("home"),
  ]);

  return (
    <HomePage
      nav={nav}
      articles={articles}
      introContent={homePage?.content ?? ""}
    />
  );
}
