export default function Pagination({ page, total, pageSize, onChange }){
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div style={{display:"flex", gap:8, justifyContent:"center", margin:"10px 0"}}>
      <button disabled={page<=1} onClick={()=>onChange(page-1)}>이전</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page>=totalPages} onClick={()=>onChange(page+1)}>다음</button>
    </div>
  );
}
