import { revalidateGroupCatalogPaths } from "@/lib/catalog-revalidation";

export function revalidateGroupPaths(groupId?: string) {
  revalidateGroupCatalogPaths(groupId);
}
