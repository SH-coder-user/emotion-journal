import "dotenv/config";
import express from "express";
import cors from "cors";
import transcribeRouter from "./routes/transcribe.js";
import entriesRouter from "./routes/entries.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/transcribe", transcribeRouter);
app.use("/api/entries", entriesRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
