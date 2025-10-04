import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks/[taskId]/comments - Get all comments for a task
export const GET: RequestHandler = async ({ params, url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the task
    const task = await db.task.findFirst({
      where: { id: params.taskId, userId },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const comments = await db.taskComment.findMany({
      where: { taskId: params.taskId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await db.taskComment.count({
      where: { taskId: params.taskId },
    });

    return json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching task comments:", error);
    return json({ error: "Failed to fetch task comments" }, { status: 500 });
  }
};

// POST /api/tasks/[taskId]/comments - Create a new comment
export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the task
    const task = await db.task.findFirst({
      where: { id: params.taskId, userId },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const { content } = await request.json();

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return json({ error: "Comment content is required" }, { status: 400 });
    }

    const comment = await db.taskComment.create({
      data: {
        content: content.trim(),
        taskId: params.taskId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating task comment:", error);
    return json({ error: "Failed to create task comment" }, { status: 500 });
  }
};
