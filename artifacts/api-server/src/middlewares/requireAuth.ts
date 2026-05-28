export const requireAuth = (req: any, res: any, next: any) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = String(userId);
  next();
};

export const requireAdmin = (req: any, res: any, next: any) => {
  const userId = req.session?.userId;
  const role = req.session?.role;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  req.userId = String(userId);
  next();
};
