import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Edit(){
  const { id } = useParams();
  const [item, setItem] = useState(null);

  const load = async () => {
    const res = await axios.get(`/api/entries/${id}`);
    setItem(res.data);
  };
  useEffect(()=>{ load(); }, [id]);

  const [content, setContent] = useState("");
  const [label, setLabel] = useState("무난");
  const [score, setScore] = useState(50);

  useEffect(()=>{
    if(item){
      setContent(item.content);
      setLabel(item.emotion_label);
      setScore(item.emotion_score);
    }
  },[item]);

  const onSave = async () => {
    await axios.put(`/api/entries/${id}`, { content, emotion_label: label, emotion_score: score });
    window.location.href = `/detail/${id}`;
  };

  if(!item) return <p>Loading...</p>;
  return (
    <div style={{maxWidth:720, margin:"24px auto"}}>
      <h2>수정: {item.title} (제목 수정 불가)</h2>
      <div>
        <label>내용</label>
        <textarea rows={8} style={{width:"100%"}} value={content} onChange={e=>setContent(e.target.value)}/>
      </div>
      <div style={{display:"flex", gap:12, marginTop:8}}>
        <div>
          <label>감정</label><br/>
          <select value={label} onChange={e=>setLabel(e.target.value)}>
            <option>기쁨</option><option>슬픔</option><option>무난</option>
          </select>
        </div>
        <div>
          <label>점수</label><br/>
          <input type="number" min={0} max={100} value={score} onChange={e=>setScore(Number(e.target.value))}/>
        </div>
      </div>
      <div style={{display:"flex", gap:8, marginTop:12}}>
        <button onClick={onSave}>저장</button>
        <Link to={`/detail/${id}`}><button>취소</button></Link>
      </div>
    </div>
  );
}
