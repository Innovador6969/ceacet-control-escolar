import { revalidateAcademicLevelCatalogPaths } from "@/lib/catalog-revalidation";

export function revalidateAcademicLevelPaths(id?: string) {
  revalidateAcademicLevelCatalogPaths(id);
}
