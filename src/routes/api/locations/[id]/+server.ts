import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/locations/[id] - Get a specific location
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const location = await db.location.findFirst({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        events: {
          orderBy: { startTime: "asc" },
          take: 10,
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!location) {
      return json({ error: "Location not found" }, { status: 404 });
    }

    return json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return json({ error: "Failed to fetch location" }, { status: 500 });
  }
};

// PUT /api/locations/[id] - Update a location
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, address, latitude, longitude, notes } = await request.json();

    // Get the existing location to verify ownership
    const existingLocation = await db.location.findFirst({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
    });

    if (!existingLocation) {
      return json({ error: "Location not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (label !== undefined) {
      if (typeof label !== "string" || label.trim().length === 0) {
        return json({ error: "Location label is required" }, { status: 400 });
      }
      updateData.label = label.trim();
    }

    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }

    if (latitude !== undefined) {
      if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
        return json(
          { error: "Invalid latitude. Must be between -90 and 90" },
          { status: 400 }
        );
      }
      updateData.latitude = latitude;
    }

    if (longitude !== undefined) {
      if (
        typeof longitude !== "number" ||
        longitude < -180 ||
        longitude > 180
      ) {
        return json(
          { error: "Invalid longitude. Must be between -180 and 180" },
          { status: 400 }
        );
      }
      updateData.longitude = longitude;
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }

    const location = await db.location.update({
      where: { id: params.id },
      data: updateData,
      include: {
        family: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    return json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    return json({ error: "Failed to update location" }, { status: 500 });
  }
};

// DELETE /api/locations/[id] - Delete a location
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if location has events
    const eventsCount = await db.event.count({
      where: {
        locationId: params.id,
        family: {
          userId,
        },
      },
    });

    if (eventsCount > 0) {
      return json(
        {
          error:
            "Cannot delete location with existing events. Please move or delete events first.",
        },
        { status: 409 }
      );
    }

    const location = await db.location.deleteMany({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
    });

    if (location.count === 0) {
      return json({ error: "Location not found" }, { status: 404 });
    }

    return json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return json({ error: "Failed to delete location" }, { status: 500 });
  }
};
