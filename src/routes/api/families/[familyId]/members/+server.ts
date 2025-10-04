import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/families/[familyId]/members - Get all members of a family
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: {
        id: params.familyId,
        userId,
      },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    const members = await db.familyMember.findMany({
      where: { familyId: params.familyId },
      orderBy: { name: "asc" },
    });

    return json(members);
  } catch (error) {
    console.error("Error fetching family members:", error);
    return json({ error: "Failed to fetch family members" }, { status: 500 });
  }
};

// POST /api/families/[familyId]/members - Add a new member to a family
export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: {
        id: params.familyId,
        userId,
      },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return json({ error: "Member name is required" }, { status: 400 });
    }

    const member = await db.familyMember.create({
      data: {
        name: name.trim(),
        familyId: params.familyId,
      },
    });

    return json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating family member:", error);
    return json({ error: "Failed to create family member" }, { status: 500 });
  }
};
