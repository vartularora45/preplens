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
import toast from "react-hot-toast";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedOut, setLoggedOut] = React.useState(false);
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
    localStorage.removeItem("token");
    setLoggedOut(true);
    toast.success("Logged out successfully!");
    navigate("/");
    
  };
const confirmLogout = () => {
  toast((t) => (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-300">
        Are you sure you want to log out?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-xs px-3 py-1.5 rounded-md
                     border border-zinc-700 text-zinc-400
                     hover:text-zinc-200 hover:border-zinc-500 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            handleLogout(); // 👈 DIRECTLY CALLING YOUR FUNCTION
          }}
          className="text-xs px-3 py-1.5 rounded-md
                     bg-red-500/10 text-red-400
                     border border-red-500/30
                     hover:bg-red-500 hover:text-white transition"
        >
          Log out
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
  });
};
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
         
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
          onClick={confirmLogout}
          className="group flex items-center space-x-3 px-4 py-3 text-xs font-mono tracking-wide text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-300 w-full"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>

      {
        loggedOut && (<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">
              You have been logged out.
            </h2>
            <p className="text-sm text-zinc-400">
              Redirecting to homepage...
            </p>
          </div>
        </div>
      )
      }
    </aside>
  );
}
