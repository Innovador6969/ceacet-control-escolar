import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const groupLabelSelect = {
  id: true,
  name: true,
  academicLevelId: true,
  modalityId: true,
  academicLevel: {
    select: {
      id: true,
      name: true
    }
  },
  modality: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.GroupSelect;

export type GroupLabelRecord = Prisma.GroupGetPayload<{
  select: typeof groupLabelSelect;
}>;

export async function getActiveGroups() {
  return prisma.group.findMany({
    where: { active: true },
    select: groupLabelSelect,
    orderBy: [
      { academicLevel: { name: "asc" } },
      { modality: { name: "asc" } },
      { name: "asc" }
    ]
  });
}
