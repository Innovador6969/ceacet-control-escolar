import { prisma } from "@/lib/db";
import { getActiveGroups } from "@/lib/services/groups";

export async function getCatalogs() {
  const [academicLevels, modalities, groups] = await Promise.all([
    prisma.academicLevel.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    }),
    prisma.modality.findMany({
      where: { active: true },
      include: { academicLevel: true },
      orderBy: { name: "asc" }
    }),
    getActiveGroups()
  ]);

  return { academicLevels, modalities, groups };
}
