import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ChatRoom from "./chatroom";
import BanPage from "./components/BanPage";
import ReportForm from "./components/ReportForm";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/banned" element={<BanPage />} />
        <Route path="/report-problems" element={<ReportForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
