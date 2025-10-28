import express from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import pool from "../db.js";
import { openai, TRANSCRIBE_MODEL, SUMMARY_MODEL } from "../openai.js";
import fs from "fs";

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm"; // 확장자 유지(없으면 webm)
   cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

const Emotion = z.object({
  title: z.string().max(100),
  summary: z.string(),
  emotion_label: z.enum(["기쁨", "슬픔", "무난"]),
  emotion_score: z.number().int().min(0).max(100)
});

/**
 * 1) 오디오 파일 업로드
 * 2) OpenAI STT
 * 3) OpenAI 요약+감정분류
 * 4) DB 저장
 * 5) 결과 반환
 */
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "audio file required" });

    // (A) STT: 음성 -> 텍스트
    // OpenAI Audio Transcription API 호출 (파일 스트림 업로드)
    // 공식 문서의 audio transcription 엔드포인트 사용
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: TRANSCRIBE_MODEL,
      // language: "ko"  // 명시해도 되고 생략 가능 (한국어 추론)
    });

    const transcriptText = transcription.text || "";

    // (B) 요약 + 감정
    const prompt = `
다음은 사용자의 한국어 일기 원문입니다. 아래 형식으로 결과만 출력하세요.

원문:
"""
${transcriptText}
"""

요구 형식(JSON):
{
  "title": "최대 20자 제목",
  "summary": "핵심 요약(2~3문장)",
  "emotion_label": "기쁨|슬픔|무난 중 1개",
  "emotion_score": 0~100 정수 (긍정적이면 높게)
}
    `.trim();

    const result = await openai.chat.completions.create({
      model: SUMMARY_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: "넌 한국어 텍스트 요약/감정분석 어시스턴트야. 반드시 JSON만 출력해." },
        { role: "user", content: prompt }
      ]
    });

    const raw = result.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try { parsed = Emotion.parse(JSON.parse(raw)); }
    catch {
      // 실패 시 보수적 기본값
      parsed = { title: "일기", summary: transcriptText.slice(0, 120), emotion_label: "무난", emotion_score: 50 };
    }

    // (C) DB 저장
    const insertSql = `
      INSERT INTO entries (title, content, emotion_label, emotion_score, transcript)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    const vals = [parsed.title, parsed.summary, parsed.emotion_label, parsed.emotion_score, transcriptText];
    const { rows } = await pool.query(insertSql, vals);

    // 임시 파일 제거
    fs.unlink(req.file.path, () => {});

    return res.json({
      id: rows[0].id,
      created_at: rows[0].created_at,
      title: parsed.title,
      content: parsed.summary,
      emotion_label: parsed.emotion_label,
      emotion_score: parsed.emotion_score,
      transcript: transcriptText
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
});

export default router;
