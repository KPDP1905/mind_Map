import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/dev/quick-login", async (req: any, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Not available in production" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  const userId = process.env.DEV_TEST_USER_ID || "user_3EMRVDqYlQ1WbrFdYSsDjpHPTNf";

  if (!secretKey) {
    res.status(500).json({ error: "CLERK_SECRET_KEY not set" });
    return;
  }

  try {
    const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, expires_in_seconds: 3600 }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      res.status(500).json({ error: "Failed to create token", details: data });
      return;
    }

    const ticket = data.token;
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const redirectUrl = `${origin}/auto-login?__clerk_ticket=${ticket}`;

    res.redirect(302, redirectUrl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
