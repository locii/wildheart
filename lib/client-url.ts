export function toClientSlug(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Pass allClients when you have the full list so duplicates get -2, -3 etc.
 * Without allClients the base slug is returned (resolves to the first match).
 */
export function clientUrl(
  c: { id: string; first_name: string; last_name: string },
  allClients?: { id: string; first_name: string; last_name: string }[]
): string {
  const base = toClientSlug(c.first_name, c.last_name);
  if (allClients) {
    const dupes = allClients.filter(
      (x) => toClientSlug(x.first_name, x.last_name) === base
    );
    const idx = dupes.findIndex((x) => x.id === c.id);
    if (idx > 0) return `/admin/clients/${base}-${idx + 1}`;
  }
  return `/admin/clients/${base}`;
}
