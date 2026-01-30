import { Router } from "express";
import { getCollection } from "../services/firestore.service.js";

const router = Router();

router.get("/health", async (req, res) => {
  const snapshot = await getCollection("test").get();
  res.json({ ok: true, count: snapshot.size });
});

export default router;
