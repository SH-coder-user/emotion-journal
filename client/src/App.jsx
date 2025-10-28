import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Banner from "./pages/Banner";
import Record from "./pages/Record";
import Loading from "./pages/Loading";
import Main from "./pages/Main";
import Detail from "./pages/Detail";
import Edit from "./pages/Edit";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Banner/>}/>
        <Route path="/record" element={<Record/>}/>
        <Route path="/loading" element={<Loading/>}/>
        <Route path="/main" element={<Main/>}/>
        <Route path="/detail/:id" element={<Detail/>}/>
        <Route path="/edit/:id" element={<Edit/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  );
}
