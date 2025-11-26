import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type MilestoneDto = {
  id: number;
  key: string;
  title: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0–1
};

type GetMilestonesResponse = {
  milestones: MilestoneDto[];
};

export async function GET() {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { order: "asc" },
    });

    const milestonesDto: MilestoneDto[] = milestones.map((m) => ({
      id: m.id,
      key: m.key,
      title: m.title,
      description: m.description,
      order: m.order,
      isUnlocked: m.isUnlocked,
      isCompleted: m.isCompleted,
      progress: m.progress,
    }));

    const response: GetMilestonesResponse = {
      milestones: milestonesDto,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

