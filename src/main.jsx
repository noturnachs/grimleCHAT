import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ChatRoom from "./chatroom";
import BanPage from "./components/BanPage";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/banned" element={<BanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
