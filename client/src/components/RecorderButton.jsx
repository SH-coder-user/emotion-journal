import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function RecorderButton({ onUploading }){
  const [rec, setRec] = useState(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    (async () => {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = {};
      // 브라우저가 지원하면 webm 지정, 아니면 비워 둬서 브라우저가 선택하게
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm")) {
          options.mimeType = "audio/webm";
      }
      const mediaRec = new MediaRecorder(stream, options);

      mediaRec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        // 업로드
        onUploading?.(true);
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        await axios.post("/api/transcribe", form, {
        headers: { "Content-Type": "multipart/form-data" }
        });
        onUploading?.(false);
        window.location.href = "/main"; // 완료 후 메인으로
      };
      setRec(mediaRec);
    })();
  }, []);

  const start = () => { if (rec && rec.state === "inactive") { rec.start(); setRecording(true); } };
  const stop  = () => { if (rec && rec.state === "recording") { rec.stop(); setRecording(false);} };

  const ready = !!rec;
  return (
    <div style={{textAlign:"center"}}>
      <button disabled={!ready} onClick={recording ? stop : start} style={{fontSize:24, padding:"14px 28px"}}>
        {!ready ? "장치 준비중..." : (recording ? "■ 녹음 종료" : "● 녹음 시작")}
      </button>
    </div>
  );
}
