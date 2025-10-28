import { useState } from "react";
import RecorderButton from "../components/RecorderButton";

export default function Record(){
  const [uploading, setUploading] = useState(false);
  return (
    <div style={{maxWidth:720, margin:"40px auto", textAlign:"center"}}>
      <h2>녹음</h2>
      <RecorderButton onUploading={setUploading}/>
      {uploading && <p>로딩 중... (AI 처리 및 DB 저장)</p>}
    </div>
  );
}
