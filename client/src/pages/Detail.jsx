import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Detail(){
  const { id } = useParams();
  const [item, setItem] = useState(null);

  const load = async () => {
    const res = await axios.get(`/api/entries/${id}`);
    setItem(res.data);
  };
  useEffect(()=>{ load(); }, [id]);

  const onDelete = async () => {
    if (!confirm("삭제하시겠습니까?")) return;
    await axios.delete(`/api/entries/${id}`);
    window.location.href="/main";
  };

  if(!item) return <p>Loading...</p>;
  return (
    <div style={{maxWidth:720, margin:"24px auto"}}>
      <h2>{item.title}</h2>
      <p><b>날짜:</b> {new Date(item.created_at).toLocaleString()}</p>
      <p><b>감정:</b> {item.emotion_label} ({item.emotion_score})</p>
      <h4>요약 내용</h4>
      <p>{item.content}</p>
      <details><summary>원문(Transcript)</summary><pre>{item.transcript}</pre></details>
      <div style={{display:"flex", gap:8, marginTop:16}}>
        <Link to={`/edit/${item.id}`}><button>수정</button></Link>
        <button onClick={onDelete}>삭제</button>
        <Link to="/main"><button>목록으로</button></Link>
      </div>
    </div>
  );
}
