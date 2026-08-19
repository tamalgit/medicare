import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut,
    ShieldAlert,
    Bell,
    UserCircle,
    Activity,
    Building2,
    Database
} from 'lucide-react';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Pharmacies', path: '/admin/pharmacies', icon: Building2 }, // Placeholder for future
        { name: 'System Logs', path: '/admin/logs', icon: Activity }, // Placeholder for future
        { name: 'Database', path: '/admin/database', icon: Database }, // Placeholder for future
    ];

    const bottomNavItems = [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'My Profile', path: '/admin/profile', icon: UserCircle },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e1b4b] text-slate-300 flex flex-col shadow-2xl z-20 shrink-0">
                <div className="h-16 flex items-center px-6 bg-[#16143c] border-b border-indigo-900/30 shrink-0">
                    <ShieldAlert className="w-6 h-6 text-indigo-400 mr-2" />
                    <span className="text-xl font-bold text-white tracking-tight">Super <span className="font-light text-indigo-400">Admin</span></span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                    <div className="px-6 mb-3 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                        Global Controls
                    </div>
                    <nav className="space-y-1.5 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${
                                        isActive 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                                        : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-200' : 'text-indigo-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-6 mt-10 mb-3 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                        Preferences
                    </div>
                    <nav className="space-y-1.5 px-3">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${
                                        isActive 
                                        ? 'bg-indigo-900/50 text-white' 
                                        : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3 text-indigo-400" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 bg-[#16143c] border-t border-indigo-900/30 shrink-0">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-indigo-300 hover:text-white hover:bg-indigo-900/50 rounded-xl font-semibold transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Secure Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
                    <div className="flex-1">
                        <div className="bg-slate-100 rounded-full px-4 py-2 flex items-center max-w-md">
                            <Database className="w-4 h-4 text-slate-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Global Search (Users, Orders, Systems)..." 
                                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-indigo-600 font-bold leading-none uppercase tracking-wider">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
