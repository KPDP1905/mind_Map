import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";

const router: IRouter = Router();

const requireAdmin = async (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId) {
    res.status(403).json({ error: "ADMIN_USER_ID not configured", hint: "Set the ADMIN_USER_ID env var to your Clerk user ID." });
    return;
  }
  if (auth.userId !== adminId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  req.userId = auth.userId;
  next();
};

router.get("/admin/me", async (req: any, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const adminId = process.env.ADMIN_USER_ID;
  res.json({
    userId: auth.userId,
    isAdmin: !!adminId && auth.userId === adminId,
    adminConfigured: !!adminId,
  });
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const result = await clerkClient().users.getUserList({ limit: 500, orderBy: "-created_at" });
  const users = result.data;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  res.json({
    totalUsers: result.totalCount,
    newThisWeek: users.filter((u) => u.createdAt > sevenDaysAgo).length,
    newThisMonth: users.filter((u) => u.createdAt > thirtyDaysAgo).length,
    activeThisWeek: users.filter((u) => u.lastSignInAt && u.lastSignInAt > sevenDaysAgo).length,
  });
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const result = await clerkClient().users.getUserList({ limit, offset, orderBy: "-created_at" });
  const users = result.data.map((u) => ({
    id: u.id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "No name",
    email: u.emailAddresses[0]?.emailAddress || "",
    imageUrl: u.imageUrl,
    createdAt: new Date(u.createdAt).toISOString(),
    lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : null,
  }));

  res.json({ users, total: result.totalCount, page, limit });
});

export default router;
