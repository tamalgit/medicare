import React from 'react';
import { Activity, Thermometer, Droplet, HeartPulse, Wind, FileText, Phone, ShieldCheck, ChevronRight, Apple } from 'lucide-react';

export const LabTests = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto hide-scrollbar py-3 text-sm font-semibold text-slate-600">
                        <span className="cursor-pointer hover:text-healthcare-blue border-b-2 border-transparent hover:border-healthcare-blue pb-1 whitespace-nowrap">Medicine</span>
                        <span className="cursor-pointer text-healthcare-blue border-b-2 border-healthcare-blue pb-1 whitespace-nowrap">Lab Tests</span>
                        <span className="cursor-pointer hover:text-healthcare-blue border-b-2 border-transparent hover:border-healthcare-blue pb-1 whitespace-nowrap">Health Blogs</span>
                        <span className="cursor-pointer hover:text-healthcare-blue border-b-2 border-transparent hover:border-healthcare-blue pb-1 whitespace-nowrap">PLUS</span>
                        <span className="cursor-pointer hover:text-healthcare-blue border-b-2 border-transparent hover:border-healthcare-blue pb-1 whitespace-nowrap">Value Store</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Book Lab Test Online with Medicare</h1>
                
                {/* Promo Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-teal-50 rounded-2xl overflow-hidden relative group cursor-pointer border border-teal-100 h-48">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                        <div className="p-6 relative z-10">
                            <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">LAB TEST</span>
                            <h3 className="text-lg font-bold text-slate-800 mt-2 w-2/3">Comprehensive Body Checkups</h3>
                        </div>
                        <Activity className="absolute bottom-4 right-4 w-24 h-24 text-teal-200 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl overflow-hidden relative group cursor-pointer h-48 text-white p-6 flex flex-col justify-center">
                        <div className="z-10">
                            <p className="text-sm font-medium text-blue-200 mb-1">Take a step towards a healthier you.</p>
                            <h2 className="text-2xl font-black text-yellow-400 mb-2">FLAT ₹1400 OFF</h2>
                            <p className="text-sm mb-4">on Full Body Checkups</p>
                            <button className="bg-green-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-300 transition-colors">ORDER NOW</button>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl overflow-hidden relative group cursor-pointer h-48 text-white p-6 flex flex-col justify-center">
                        <div className="z-10">
                            <h2 className="text-xl font-bold mb-2">Fasting Tootegi On Time!</h2>
                            <p className="text-sm text-slate-300 mb-4 w-3/4">With <span className="text-yellow-400 font-bold">On-Time</span> Sample Collection Or <span className="text-yellow-400 font-bold">FREE</span> Test</p>
                            <button className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-400 transition-colors">Book Now</button>
                        </div>
                    </div>
                </div>

                {/* Quick Action Pills */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { icon: Activity, label: "All Tests", color: "text-teal-500" },
                        { icon: Thermometer, label: "Fever Package", color: "text-rose-500" },
                        { icon: Phone, label: "Order on Call", color: "text-blue-500" },
                        { icon: FileText, label: "Scan Prescription", color: "text-indigo-500" }
                    ].map((action, idx) => (
                        <div key={idx} className="bg-white border border-slate-300 rounded-full py-4 px-6 flex items-center justify-center cursor-pointer hover:border-healthcare-blue hover:shadow-md transition-all group">
                            <action.icon className={`w-5 h-5 mr-3 ${action.color}`} />
                            <span className="font-bold text-slate-700 text-sm md:text-base group-hover:text-healthcare-blue">{action.label}</span>
                        </div>
                    ))}
                </div>

                {/* Plus Membership Banner */}
                <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:shadow-lg transition-shadow mb-12 border border-purple-300">
                    <div className="flex items-center mb-3 md:mb-0">
                        <div className="bg-yellow-400 text-slate-900 rounded-lg p-2 mr-4 flex flex-col items-center justify-center">
                            <span className="text-xl font-black leading-none">+</span>
                            <span className="text-[10px] font-black uppercase">Plus</span>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm md:text-base">Save 5% on medicines, 50% on 1st lab test & get FREE delivery with PLUS membership</p>
                            <span className="text-purple-100 text-sm font-bold mt-1 flex items-center hover:text-white transition-colors">Know more <ChevronRight className="w-4 h-4 ml-1" /></span>
                        </div>
                    </div>
                </div>

                {/* Browse By Health Concern */}
                <div className="mb-12">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Browse By Health Concern</h2>
                        <p className="text-sm text-slate-500 flex items-center mt-1">Powered By <ShieldCheck className="w-4 h-4 text-rose-500 mx-1" /> <span className="font-bold text-slate-700">MedicareLabs</span></p>
                    </div>

                    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 hide-scrollbar snap-x">
                        {[
                            { name: "Full Body", icon: Activity, color: "bg-teal-50 text-teal-600" },
                            { name: "Fever", icon: Thermometer, color: "bg-rose-50 text-rose-600" },
                            { name: "Thyroid", icon: Wind, color: "bg-blue-50 text-blue-600" },
                            { name: "Diabetes", icon: Droplet, color: "bg-indigo-50 text-indigo-600" },
                            { name: "Heart", icon: HeartPulse, color: "bg-red-50 text-red-600" },
                            { name: "Allergy", icon: Apple, color: "bg-orange-50 text-orange-600" },
                            { name: "Hair & Skin", icon: FileText, color: "bg-pink-50 text-pink-600" }
                        ].map((concern, idx) => (
                            <div key={idx} className="flex flex-col items-center min-w-[120px] snap-center cursor-pointer group">
                                <div className={`w-28 h-28 ${concern.color} rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all relative overflow-hidden`}>
                                    <concern.icon className="w-12 h-12" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 text-center">{concern.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Spacer for bottom padding */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};
