import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  Receipt,
  Users,
  LogOut,
  Store,
  History as HistoryIcon,
  DollarSign,
  BarChart3,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/home" },
  { title: "History", icon: <HistoryIcon size={20} />, path: "/history" },
  { title: "Barrow", icon: <DollarSign size={20} />, path: "/barrow" },
  { title: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
  { title: "Sales", icon: <DollarSign size={20} />, path: "/sales" },
  { title: "Add Items", icon: <Package size={20} />, path: "/add-items" },
  { title: "Stocks", icon: <Layers size={20} />, path: "/stocks" },
  { title: "Suppliers", icon: <Truck size={20} />, path: "/suppliers" },
  { title: "Dealers", icon: <Store size={20} />, path: "/dealers" },
  { title: "Billing", icon: <Receipt size={20} />, path: "/billing" },
  { title: "Expense", icon: <Receipt size={20} />, path: "/expense" },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h2 className="text-2xl font-bold">POS System</h2>
      </div>

      <div className="px-6 py-4 border-b border-gray-700">
        <p className="text-sm text-gray-400">Signed in as</p>
        <p className="font-semibold">{user?.name || "Admin"}</p>
      </div>

      <nav className="flex-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-800 cursor-pointer transition ${
              location.pathname === item.path
                ? "bg-gray-800 border-r-4 border-blue-500"
                : ""
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full hover:text-red-400 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
