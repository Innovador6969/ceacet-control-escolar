import { revalidateModalityCatalogPaths } from "@/lib/catalog-revalidation";

export function revalidateModalityPaths(modalityId?: string) {
  revalidateModalityCatalogPaths(modalityId);
}
