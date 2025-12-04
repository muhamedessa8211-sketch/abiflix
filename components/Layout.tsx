import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Film, LogOut, Home } from 'lucide-react';
import { logout } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/movies', icon: Film, label: 'All Movies' },
    { path: '/admin/upload', icon: Upload, label: 'Upload Movie' },
  ];

  return (
    <div className="flex h-screen bg-[#141414] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-3xl font-bold text-netflix-red tracking-tighter">NETFLEX</h1>
          <span className="ml-2 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded">ADMIN</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname === item.path;
             return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-netflix-red text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
             );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
            <NavLink 
              to="/"
              className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
                <Home size={20} />
                <span>Client View</span>
            </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#141414] relative">
        <div className="md:hidden bg-black p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-20">
           <span className="text-netflix-red font-bold text-xl">NETFLEX ADMIN</span>
           <div className="flex gap-4">
             <NavLink to="/admin/dashboard" className="text-white"><LayoutDashboard /></NavLink>
             <NavLink to="/admin/upload" className="text-white"><Upload /></NavLink>
           </div>
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;