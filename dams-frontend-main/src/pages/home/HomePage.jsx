import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

function HomePage() {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { loader } = useSelector((state) => state.loadingSlice);
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b-2 border-b-gray-200">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden bg-slate-100">
        {/* Sidebar */}
        <div
          className={`p-4 pr-0 overflow-auto transition-width duration-300 ${
            toggleSidebar ? "w-20" : "w-56"
          }`}
        >
          <div className="rounded-xl shadow-md bg-white h-full hide-scrollbar overflow-auto">
            <Sidebar
              setToggleSidebar={setToggleSidebar}
              toggleSidebar={toggleSidebar}
            />
          </div>
        </div>
        {/* Main content area */}
        <main className="p-4 flex-1 min-w-[25%]">
          <div className="p-2 rounded-xl shadow-md bg-white h-full overflow-y-scroll hide-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
      {loader && <Loader />}
    </div>
  );
}

export default HomePage;
