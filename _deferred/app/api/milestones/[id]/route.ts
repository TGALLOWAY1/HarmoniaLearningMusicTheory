import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

type PatchMilestoneRequest = {
  isUnlocked?: boolean;
  isCompleted?: boolean;
  progress?: number;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const milestoneId = Number(params.id);
    if (Number.isNaN(milestoneId)) {
      return NextResponse.json(
        { error: "Invalid milestone id" },
        { status: 400 }
      );
    }

    const body: PatchMilestoneRequest = await req.json();

    // Validate at least one field is present
    const { isUnlocked, isCompleted, progress } = body;
    if (
      isUnlocked === undefined &&
      isCompleted === undefined &&
      progress === undefined
    ) {
      return NextResponse.json(
        { error: "At least one field (isUnlocked, isCompleted, progress) must be provided" },
        { status: 400 }
      );
    }

    // Validate progress is between 0 and 1 if provided
    if (progress !== undefined) {
      if (typeof progress !== "number" || progress < 0 || progress > 1) {
        return NextResponse.json(
          { error: "Progress must be a number between 0 and 1" },
          { status: 400 }
        );
      }
    }

    // Check if milestone exists
    const existing = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Build update data object with only provided fields
    const updateData: Partial<PatchMilestoneRequest> = {};
    if (isUnlocked !== undefined) {
      updateData.isUnlocked = isUnlocked;
    }
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
    }
    if (progress !== undefined) {
      updateData.progress = progress;
    }

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

