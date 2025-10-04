import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/locations - Get all locations for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyId = url.searchParams.get("familyId");

    if (!familyId) {
      return json({ error: "Family ID is required" }, { status: 400 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: { id: familyId, userId },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    const locations = await db.location.findMany({
      where: { familyId },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: { label: "asc" },
    });

    return json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return json({ error: "Failed to fetch locations" }, { status: 500 });
  }
};

// POST /api/locations - Create a new location
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, address, latitude, longitude, notes, familyId } =
      await request.json();

    if (!label || typeof label !== "string" || label.trim().length === 0) {
      return json({ error: "Location label is required" }, { status: 400 });
    }

    if (!familyId) {
      return json({ error: "Family ID is required" }, { status: 400 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: { id: familyId, userId },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    // Validate latitude and longitude if provided
    if (
      latitude !== undefined &&
      (typeof latitude !== "number" || latitude < -90 || latitude > 90)
    ) {
      return json(
        { error: "Invalid latitude. Must be between -90 and 90" },
        { status: 400 }
      );
    }

    if (
      longitude !== undefined &&
      (typeof longitude !== "number" || longitude < -180 || longitude > 180)
    ) {
      return json(
        { error: "Invalid longitude. Must be between -180 and 180" },
        { status: 400 }
      );
    }

    const location = await db.location.create({
      data: {
        label: label.trim(),
        address: address?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
        notes: notes?.trim() || null,
        familyId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    return json(location, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return json({ error: "Failed to create location" }, { status: 500 });
  }
};
