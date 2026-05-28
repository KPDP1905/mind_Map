import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/admin/me", (req: any, res): void => {
  const userId = req.session?.userId;
  const role = req.session?.role;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  res.json({ userId: String(userId), isAdmin: role === "admin", adminConfigured: true });
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  res.json({
    totalUsers: users.length,
    newThisWeek: users.filter((u) => u.createdAt.getTime() > sevenDaysAgo).length,
    newThisMonth: users.filter((u) => u.createdAt.getTime() > thirtyDaysAgo).length,
    activeThisWeek: 0,
  });
});

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.displayName,
      email: u.username,
      createdAt: u.createdAt.toISOString(),
      lastSignInAt: null,
    })),
    total: users.length,
    page: 1,
    limit: 50,
  });
});

export default router;
