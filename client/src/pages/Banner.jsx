import { Link } from "react-router-dom";

export default function Banner(){
  return (
    <div style={{maxWidth:720, margin:"40px auto", textAlign:"center"}}>
      <h1>감정일기</h1>
      <p>목소리로 나의 일기를 완성해보세요</p>
      <div style={{margin:"24px 0"}}>
        <Link to="/record">
          <button style={{fontSize:24, padding:"14px 28px"}}>🎙️ 음성 녹음</button>
        </Link>
      </div>
      <Link to="/main"><button>나의 녹음 확인</button></Link>
    </div>
  );
}
