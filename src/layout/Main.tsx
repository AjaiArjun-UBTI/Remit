// src/layout/Main.tsx
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { Outlet } from "react-router-dom";


export default function Main() {
  

  return (
<div className="flex flex-col h-screen bg-[#f0f5f3] dark:bg-gray-900">
  {/* HEADER – flows naturally */}
  <Header  />

  <div className="flex flex-1 min-h-0">
    {/* SIDEBAR */}
    <Sidebar />

    {/* MAIN CONTENT */}
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto pt-6 px-6">
        <Outlet />
      </div>
      <Footer />
    </main>
  </div>
</div>
  );
}