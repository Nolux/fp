import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/families/[familyId]/members/[id] - Get a specific family member
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

    const member = await db.familyMember.findFirst({
      where: {
        id: params.id,
        familyId: params.familyId,
      },
    });

    if (!member) {
      return json({ error: "Family member not found" }, { status: 404 });
    }

    return json(member);
  } catch (error) {
    console.error("Error fetching family member:", error);
    return json({ error: "Failed to fetch family member" }, { status: 500 });
  }
};

// PUT /api/families/[familyId]/members/[id] - Update a family member
export const PUT: RequestHandler = async ({ params, request, locals }) => {
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

    const member = await db.familyMember.updateMany({
      where: {
        id: params.id,
        familyId: params.familyId,
      },
      data: {
        name: name.trim(),
      },
    });

    if (member.count === 0) {
      return json({ error: "Family member not found" }, { status: 404 });
    }

    const updatedMember = await db.familyMember.findFirst({
      where: { id: params.id },
    });

    return json(updatedMember);
  } catch (error) {
    console.error("Error updating family member:", error);
    return json({ error: "Failed to update family member" }, { status: 500 });
  }
};

// DELETE /api/families/[familyId]/members/[id] - Delete a family member
export const DELETE: RequestHandler = async ({ params, locals }) => {
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

    const member = await db.familyMember.deleteMany({
      where: {
        id: params.id,
        familyId: params.familyId,
      },
    });

    if (member.count === 0) {
      return json({ error: "Family member not found" }, { status: 404 });
    }

    return json({ message: "Family member deleted successfully" });
  } catch (error) {
    console.error("Error deleting family member:", error);
    return json({ error: "Failed to delete family member" }, { status: 500 });
  }
};
