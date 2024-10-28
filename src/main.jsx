import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ChatRoom from "./chatroom";
import BanPage from "./components/BanPage";
import ReportForm from "./components/ReportForm";
import NotFound from "./components/NotFound";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/banned" element={<BanPage />} />
        <Route path="/report-problems" element={<ReportForm />} />
        <Route path="*" element={<NotFound />} />{" "}
        {/* This catches all unmatched routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
