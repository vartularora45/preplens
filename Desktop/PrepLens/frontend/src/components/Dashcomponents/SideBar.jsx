import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  Brain
, ClipboardList
, Activity
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
    {
      icon: FileText,
      label: "Submit Problem",
      path: "/dashboard/submit",
      highlight: true
    },
  { icon: ClipboardList, label: "All Submissions", path: "/dashboard/submissions" }

,
{ icon: Activity, label: "Activity", path: "/dashboard/activity" }
,
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" }
  ];

  const handleLogout = () => {
    if (window.confirm("Logout kar diya toh grind ruk jaayegi 😬. Sure?")) {
      navigate("/auth");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-inner">
            <Brain className="w-6 h-6 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
              PrepLens
            </h1>
            <p className="text-[10px] text-zinc-600 tracking-widest">
              INTELLIGENCE MODE
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wide transition-all duration-300 relative
              ${
                isActive
                  ? "bg-zinc-800/70 text-zinc-100 border-l-2 border-blue-400 shadow-[inset_0_0_0.5px_#3b82f6]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 border-l-2 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span>{item.label}</span>

              {item.highlight && (
                <span className="absolute right-4 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="group flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wide text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-300 w-full"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
