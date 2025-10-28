import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function EmotionChart({ items }){
  const labels = items.map(i => dayjs(i.created_at).format("MM/DD"));
  const scores = items.map(i => i.emotion_score);
  const data = { labels, datasets: [{ label: "감정 점수(높을수록 긍정)", data: scores }] };
  const options = { responsive: true, maintainAspectRatio: false };
  return <div style={{height:260}}><Line data={data} options={options}/></div>;
}
