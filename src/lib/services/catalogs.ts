import { getActiveAcademicLevels } from "@/lib/services/academic-levels";
import { getActiveGroups } from "@/lib/services/groups";
import { getActiveModalities } from "@/lib/services/modalities";

export async function getCatalogs() {
  const [academicLevels, modalities, groups] = await Promise.all([
    getActiveAcademicLevels(),
    getActiveModalities(),
    getActiveGroups()
  ]);

  return { academicLevels, modalities, groups };
}
