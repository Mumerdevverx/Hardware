import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DefaultLayout = ({ user, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 ml-0 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;