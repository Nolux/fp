import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks - Get all tasks for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyId = url.searchParams.get("familyId");
    const completed = url.searchParams.get("completed");
    const deadline = url.searchParams.get("deadline");

    const where: any = { userId };

    if (familyId) {
      where.familyId = familyId;
    }

    if (completed !== null) {
      where.completed = completed === "true";
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      where.deadline = {
        lte: deadlineDate,
      };
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        family: {
          select: { id: true, name: true },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: {
            checklist: true,
            comments: true,
            reminders: true,
            notifications: true,
          },
        },
      },
      orderBy: [
        { completed: "asc" },
        { deadline: "asc" },
        { createdAt: "desc" },
      ],
    });

    return json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
};

// POST /api/tasks - Create a new task
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, deadline, familyId } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return json({ error: "Task title is required" }, { status: 400 });
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

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        familyId,
        userId,
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: {
            checklist: true,
            comments: true,
            reminders: true,
            notifications: true,
          },
        },
      },
    });

    return json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return json({ error: "Failed to create task" }, { status: 500 });
  }
};
