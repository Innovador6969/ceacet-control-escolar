import { prisma } from "@/lib/db";

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
    prisma.group.findMany({
      where: { active: true },
      include: { academicLevel: true, modality: true },
      orderBy: { name: "asc" }
    })
  ]);

  return { academicLevels, modalities, groups };
}
