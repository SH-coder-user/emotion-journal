import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EmotionChart from "../components/EmotionChart";
import Pagination from "../components/Pagination";

export default function Main(){
  const [data, setData] = useState({ items:[], total:0, page:1, pageSize:10 });

  const load = async (page=1) => {
    const res = await axios.get(`/api/entries?page=${page}`);
    setData(res.data);
  };
  useEffect(()=>{ load(1); },[]);

  return (
    <div style={{maxWidth:900, margin:"24px auto"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>내 일기</h2>
        <Link to="/"><button>홈으로</button></Link>
      </div>

      <table width="100%" border="1" cellPadding="8" style={{borderCollapse:"collapse"}}>
        <thead><tr><th>날짜</th><th>제목</th><th>감정</th><th>점수</th></tr></thead>
        <tbody>
          {data.items.map(row=>(
            <tr key={row.id}>
              <td>{new Date(row.created_at).toLocaleString()}</td>
              <td><Link to={`/detail/${row.id}`}>{row.title}</Link></td>
              <td>{row.emotion_label}</td>
              <td>{row.emotion_score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={data.page} total={data.total} pageSize={data.pageSize} onChange={load}/>

      <h3 style={{marginTop:20}}>감정 변화 그래프</h3>
      <EmotionChart items={[...data.items].reverse()} />
    </div>
  );
}
