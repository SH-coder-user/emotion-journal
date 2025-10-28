import express from "express";
import pool from "../db.js";

const router = express.Router();

// 리스트 (페이지네이션: 10개/페이지)
router.get("/", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    "SELECT id, created_at, title, content, emotion_label, emotion_score FROM entries ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  const { rows: cnt } = await pool.query("SELECT count(*)::int AS total FROM entries");
  res.json({ items: rows, total: cnt[0].total, page, pageSize: limit });
});

// 상세
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, created_at, title, content, emotion_label, emotion_score, transcript FROM entries WHERE id=$1",
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

// 수정(제목은 변경 불가, 내용만)
router.put("/:id", async (req, res) => {
  const { content, emotion_label, emotion_score } = req.body || {};
  const { rows } = await pool.query(
    "UPDATE entries SET content=COALESCE($1, content), emotion_label=COALESCE($2, emotion_label), emotion_score=COALESCE($3, emotion_score) WHERE id=$4 RETURNING id, created_at, title, content, emotion_label, emotion_score, transcript",
    [content, emotion_label, emotion_score, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

// 삭제
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM entries WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
