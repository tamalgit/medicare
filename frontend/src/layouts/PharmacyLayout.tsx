import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    FileSignature, 
    CheckSquare, 
    PackageSearch, 
    Users, 
    Truck, 
    FileText, 
    BarChart3, 
    Bell, 
    UserCircle, 
    Settings, 
    LogOut,
    HeartPulse
} from 'lucide-react';

export const PharmacyLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard, roles: ['PHARMACY_ADMIN', 'PHARMACIST'] },
        { name: 'Orders', path: '/pharmacy/orders', icon: ShoppingCart, roles: ['PHARMACY_ADMIN'] },
        { name: 'Pending Approval', path: '/pharmacy/prescriptions/pending', icon: FileSignature, roles: ['PHARMACIST'] },
        { name: 'Approved Medicines', path: '/pharmacy/prescriptions/approved', icon: CheckSquare, roles: ['PHARMACIST'] },
        { name: 'Inventory', path: '/pharmacy/inventory', icon: PackageSearch, roles: ['PHARMACY_ADMIN'] },
        { name: 'Customers', path: '/pharmacy/customers', icon: Users, roles: ['PHARMACY_ADMIN'] },
        { name: 'Shipments', path: '/pharmacy/shipments', icon: Truck, roles: ['PHARMACY_ADMIN'] },
        { name: 'Reports', path: '/pharmacy/reports', icon: BarChart3, roles: ['PHARMACY_ADMIN'] },
        { name: 'Approval History', path: '/pharmacy/prescriptions/history', icon: FileText, roles: ['PHARMACIST'] },
    ].filter(item => user && item.roles.includes(user.role));

    const bottomNavItems = [
        { name: 'Notifications', path: '/pharmacy/notifications', icon: Bell },
        { name: 'Pharmacy Profile', path: '/pharmacy/profile', icon: UserCircle },
        { name: 'Settings', path: '/pharmacy/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 shrink-0">
                <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shrink-0">
                    <HeartPulse className="w-6 h-6 text-blue-400 mr-2" />
                    <span className="text-xl font-bold text-white tracking-tight">Medicare <span className="font-light text-blue-400">Pharm</span></span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Management
                    </div>
                    <nav className="space-y-1 px-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                        isActive 
                                        ? 'bg-blue-600 text-white' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        System
                    </div>
                    <nav className="space-y-1 px-2">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                        isActive 
                                        ? 'bg-slate-800 text-white' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3 text-slate-400" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex-1">
                        {/* Search could go here */}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-slate-500 font-medium leading-none">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
