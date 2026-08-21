import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Phone, Heart, Package, LogOut, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const { cart } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const cartItemsCount = cart.reduce((total: number, item: any) => total + item.quantity, 0);

    return (
        <nav className="bg-[#10353a] text-white sticky top-0 z-50">
            {/* Top Bar - Offers & Contact */}
            <div className="bg-[#0a2529] text-xs py-1.5 px-4 hidden sm:block">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex space-x-6">
                        <span className="flex items-center text-teal-100 hover:text-white cursor-pointer transition-colors"><Phone className="w-3 h-3 mr-1.5" /> Call: 1800-123-4567</span>
                        <span className="text-teal-100 hover:text-white cursor-pointer transition-colors">Download App</span>
                    </div>
                    <div className="flex space-x-4">
                        <span className="text-yellow-400 font-medium">Save up to 25% on medicines!</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* Logo & Mobile Menu Toggle */}
                    <div className="flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mr-4 sm:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
                            {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
                        </button>
                        <Link to="/" className="flex items-center group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg transform group-hover:scale-105 transition-transform">
                                <span className="text-[#10353a] font-black text-2xl tracking-tighter">M</span>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">
                                Medicare
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden sm:flex items-center space-x-1">
                        <Link to="/" className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors">Medicines</Link>
                        <Link to="/lab-tests" className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors">Lab Tests</Link>
                        <Link to="/healthcare" className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors">Healthcare</Link>
                        <Link to="/offers" className="px-4 py-2 rounded-lg text-sm font-bold text-yellow-400 hover:bg-white/10 transition-colors flex items-center">
                            Offers <span className="ml-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                        </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-2">
                                <Link to="/customer/prescriptions/upload" className="hidden md:flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 transition-colors group">
                                    <FileText className="w-5 h-5 text-teal-100 group-hover:text-white" />
                                    <span className="text-[10px] font-bold mt-1 text-teal-100 group-hover:text-white">Rx</span>
                                </Link>
                                <Link to="/orders" className="hidden md:flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 transition-colors group">
                                    <Package className="w-5 h-5 text-teal-100 group-hover:text-white" />
                                    <span className="text-[10px] font-bold mt-1 text-teal-100 group-hover:text-white">Orders</span>
                                </Link>
                                <div className="hidden md:flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer group hover:bg-white/20 transition-all">
                                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold mr-2">
                                        {user?.first_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex flex-col pr-2">
                                        <span className="text-xs text-teal-100 leading-none">Hello,</span>
                                        <span className="text-sm font-bold text-white leading-none mt-0.5">{user?.first_name || 'User'}</span>
                                    </div>
                                    <button onClick={logout} title="Logout" className="ml-2 p-1.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:flex items-center px-5 py-2.5 bg-white text-[#10353a] hover:bg-teal-50 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                <User className="w-4 h-4 mr-2" />
                                Sign In
                            </Link>
                        )}
                        
                        <Link to="/cart" className="relative p-3 rounded-xl hover:bg-white/10 transition-colors group flex items-center">
                            <ShoppingCart className="h-6 w-6 text-teal-100 group-hover:text-white" />
                            <span className="hidden sm:block ml-2 text-sm font-bold text-teal-100 group-hover:text-white">Cart</span>
                            {cartItemsCount > 0 && (
                                <span className="absolute top-1 left-7 sm:left-6 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#10353a] shadow-sm transform scale-100 group-hover:scale-110 transition-transform">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-[#0a2529] border-t border-white/10">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">Medicines</Link>
                        <Link to="/lab-tests" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">Lab Tests</Link>
                        <Link to="/healthcare" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">Healthcare</Link>
                        <Link to="/offers" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-white/10">Offers</Link>
                    </div>
                    
                    {/* Mobile Auth Actions */}
                    <div className="pt-4 pb-4 border-t border-white/10">
                        {isAuthenticated ? (
                            <div className="px-5 space-y-3">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                        {user?.first_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">{user?.first_name || 'User'}</div>
                                        <div className="text-sm font-medium text-teal-200">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-col space-y-1">
                                    <Link to="/customer/prescriptions/upload" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-teal-100 hover:text-white hover:bg-white/10">
                                        <FileText className="w-5 h-5 mr-3" /> Upload Prescription
                                    </Link>
                                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-teal-100 hover:text-white hover:bg-white/10">
                                        <Package className="w-5 h-5 mr-3" /> My Orders
                                    </Link>
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:text-rose-300 hover:bg-white/10">
                                        <LogOut className="w-5 h-5 mr-3" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-5">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full px-5 py-3 bg-white text-[#10353a] hover:bg-teal-50 rounded-xl font-bold shadow-sm transition-colors">
                                    <User className="w-5 h-5 mr-2" />
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
