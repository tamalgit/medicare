import { Link, useLocation } from 'react-router-dom';
import { Globe, Mail, Phone, MessageCircle } from 'lucide-react';

export const Footer = () => {
    const location = useLocation();

    // Hide footer on admin/delivery portals
    if (location.pathname.includes('/admin') || location.pathname.includes('/delivery') || location.pathname.includes('/pharmacy')) {
        return null;
    }

    return (
        <footer className="bg-[#eef4ff] text-slate-700 pt-16 pb-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Partner with Medicare</a></li>
                        </ul>
                        
                        <h3 className="font-bold text-slate-900 mt-8 mb-4">Our Services</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Order Medicine</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Healthcare Products</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Lab Tests</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Featured Categories</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Health Must Haves</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Sexual Wellness</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Vitamins & Supplements</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Personal Care</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Healthcare Devices</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Homeopathy Care</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Ayurvedic Care</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Baby Care</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">Need Help</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Browse All Medicines</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Browse All Stores</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">FAQs</a></li>
                        </ul>

                        <h3 className="font-bold text-slate-900 mt-8 mb-4">Policy Info</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Editorial Policy</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Terms and Conditions</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Customer Support Policy</a></li>
                            <li><a href="#" className="hover:text-healthcare-blue transition-colors">Return Policy</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 flex flex-col items-start lg:items-end">
                        <h3 className="font-bold text-slate-900 mb-4">Contact Us</h3>
                        <div className="flex space-x-4 mb-8">
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                                <Globe className="w-5 h-5 text-slate-700" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                                <MessageCircle className="w-5 h-5 text-slate-700" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                                <Phone className="w-5 h-5 text-slate-700" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                                <Mail className="w-5 h-5 text-slate-700" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-slate-900">Our Payment Partners</span>
                        <div className="flex space-x-2">
                            {/* Mock Payment Partner Logos */}
                            <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-200 text-blue-800">PAYTM</div>
                            <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-200 text-orange-600">UPI</div>
                            <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-200 text-blue-600">VISA</div>
                            <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow-sm border border-slate-200 text-red-500">MasterCard</div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 Medicare. All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};
