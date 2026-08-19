import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Truck, 
    Settings, 
    LogOut,
    Package,
    Navigation,
    CheckCircle2,
    XCircle,
    Bell,
    UserCircle,
    DollarSign,
    Headset
} from 'lucide-react';

export const DeliveryLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
        { name: 'My Deliveries', path: '/delivery/my-deliveries', icon: Truck },
        { name: 'Pickups', path: '/delivery/pickups', icon: Package },
        { name: 'In Transit', path: '/delivery/in-transit', icon: Navigation },
        { name: 'Delivered', path: '/delivery/delivered', icon: CheckCircle2 },
        { name: 'Failed', path: '/delivery/failed', icon: XCircle },
    ];

    const bottomNavItems = [
        { name: 'Earnings', path: '/delivery/earnings', icon: DollarSign },
        { name: 'Profile', path: '/delivery/profile', icon: UserCircle },
        { name: 'Support', path: '/delivery/support', icon: Headset },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#fffbeb] border-r border-amber-200 flex flex-col z-20 shrink-0">
                <div className="h-16 flex items-center px-6 bg-amber-500 border-b border-amber-600 shrink-0 shadow-sm">
                    <Truck className="w-6 h-6 text-white mr-2" />
                    <span className="text-xl font-bold text-white tracking-tight">Medicare <span className="font-light text-amber-100">Delivery</span></span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                    <div className="px-6 mb-3 text-xs font-bold text-amber-600 uppercase tracking-widest">
                        Routes & Tasks
                    </div>
                    <nav className="space-y-1.5 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/delivery/dashboard' || location.pathname === '/delivery/dashboard');
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
                                        isActive 
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' 
                                        : 'text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-6 mt-10 mb-3 text-xs font-bold text-amber-600 uppercase tracking-widest">
                        Account
                    </div>
                    <nav className="space-y-1.5 px-3">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
                                        isActive 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3 text-slate-400" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 bg-amber-50 border-t border-amber-200 shrink-0">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
                    <div className="flex-1 flex items-center">
                        <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Online & Ready
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-500 hover:text-amber-500 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-amber-600 transition-colors">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-amber-600 font-bold leading-none uppercase tracking-wider">
                                    Driver
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
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
