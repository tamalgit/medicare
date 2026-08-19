import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchMedicines } from '../../services/medicineApi';
import { API_BASE_URL } from '../../services/api';
import { Link } from 'react-router-dom';
import { Search, Package, Pill, ShieldCheck, Phone, BadgePercent, Star, FileText, HeartPulse, Activity, Stethoscope, Droplet, Apple, Wind, Thermometer, Shield } from 'lucide-react';
import { FaqAccordion } from '../../components/FaqAccordion';

export const SearchMedicines = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: medicines, isLoading } = useQuery({
        queryKey: ['medicines', debouncedSearch],
        queryFn: () => searchMedicines(debouncedSearch),
    });

    const isSearching = debouncedSearch.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            
            {/* HERO SECTION (Teal Background with Pattern) */}
            <div className="bg-gradient-to-br from-[#10353a] via-[#123e44] to-[#0a2529] pt-16 pb-40 px-4 sm:px-6 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight drop-shadow-md">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Get Medicines Fast</span> <br className="hidden md:block"/> with Superfast Delivery
                    </h1>
                    
                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-12 mb-8">
                        <div className="flex items-center text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-lg transform hover:-translate-y-1 transition-all">
                            <ShieldCheck className="w-5 h-5 text-yellow-400 mr-2" />
                            <span className="text-sm font-semibold tracking-wide">Cash on Delivery</span>
                        </div>
                        <div className="flex items-center text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-lg transform hover:-translate-y-1 transition-all">
                            <Package className="w-5 h-5 text-yellow-400 mr-2" />
                            <span className="text-sm font-semibold tracking-wide">Express Delivery</span>
                        </div>
                        <div className="flex items-center text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md shadow-lg transform hover:-translate-y-1 transition-all">
                            <Star className="w-5 h-5 text-yellow-400 mr-2" />
                            <span className="text-sm font-semibold tracking-wide">Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING SEARCH CONTAINER */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-28 relative z-20">
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-6 md:p-10 border border-slate-100 ring-1 ring-black/5">
                    <div className="flex items-center mb-6">
                        <div className="flex-1 relative group" onBlur={(e) => {
                            // Delay hiding the dropdown slightly so clicks on links can register
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setTimeout(() => setIsInputFocused(false), 200);
                            }
                        }}>
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-healthcare-blue transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-14 pr-4 py-4 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-l-2xl text-lg focus:outline-none focus:ring-0 focus:border-healthcare-blue focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
                                placeholder="Search for Medicines, Health products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                            />

                            {/* Autocomplete Dropdown */}
                            {isInputFocused && debouncedSearch && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-slate-500">Searching...</div>
                                    ) : medicines && medicines.length > 0 ? (
                                        <ul>
                                            {medicines.map((med: any) => (
                                                <li key={med.id} className="border-b border-slate-50 last:border-0">
                                                    <Link 
                                                        to={`/medicines/${med.id}`}
                                                        className="flex items-center p-3 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 bg-slate-100 rounded mr-3 flex items-center justify-center flex-shrink-0">
                                                            {med.image_url ? (
                                                                <img src={med.image_url.startsWith('http') ? med.image_url : `${API_BASE_URL}${med.image_url}`} alt={med.name} className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <Pill className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-slate-800 text-sm">{med.name}</h4>
                                                            <p className="text-xs text-slate-500">{med.manufacturer_name || 'Generic'}</p>
                                                        </div>
                                                        <div className="font-bold text-healthcare-blue">
                                                            ₹{Number(med.selling_price).toFixed(2)}
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-slate-500">No medicines found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button className="bg-gradient-to-r from-[#10353a] to-[#1a555c] hover:from-[#0a2529] hover:to-[#10353a] text-white px-8 py-4 md:py-6 rounded-r-2xl text-lg font-bold transition-all shadow-md hover:shadow-lg">
                            Search
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        <Link to="/customer/prescriptions/upload" className="flex items-center justify-center p-5 border-2 border-blue-50 bg-blue-50/50 rounded-2xl hover:border-healthcare-blue hover:bg-blue-50 transition-all group shadow-sm hover:shadow-md">
                            <div className="bg-white p-2 rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6 text-healthcare-blue" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-healthcare-blue text-lg">Order via Prescription</span>
                        </Link>
                        <button className="flex items-center justify-center p-5 border-2 border-green-50 bg-green-50/50 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group shadow-sm hover:shadow-md">
                            <div className="bg-white p-2 rounded-full mr-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-green-700 text-lg">Call to Order</span>
                        </button>
                    </div>

                    {/* Offer Banners */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 flex items-center justify-between border border-blue-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                            <div className="z-10">
                                <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded shadow-sm mb-2 inline-block">APP ONLY OFFER</span>
                                <h4 className="font-bold text-slate-800 mb-1">Get 25% OFF on orders above Rs 1000</h4>
                                <p className="text-xs text-slate-500">on medicine & healthcare</p>
                            </div>
                            <BadgePercent className="w-20 h-20 text-blue-200 absolute -right-4 -bottom-4 opacity-40 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-2xl p-5 flex items-center justify-between border border-rose-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                            <div className="z-10">
                                <span className="text-xs font-black text-rose-600 bg-white px-2.5 py-1 rounded-md shadow-sm mb-3 inline-block tracking-wide">WEBSITE OFFER</span>
                                <h4 className="font-bold text-slate-800 mb-1 text-lg">Get 20% OFF on orders</h4>
                                <div className="text-xs font-mono font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded mt-2 w-fit border border-rose-200 tracking-widest shadow-inner">MEDICARE20</div>
                            </div>
                            <BadgePercent className="w-20 h-20 text-rose-200 absolute -right-4 -bottom-4 opacity-40 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    </div>
                </div>

                {/* QUICK LINKS NAVBAR */}
                <div className="bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 p-6 mt-8 flex justify-between items-center overflow-x-auto hide-scrollbar snap-x relative z-20">
                    {[
                        { icon: Pill, label: 'Medicine', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: HeartPulse, label: 'Lab Tests', color: 'text-rose-600', bg: 'bg-rose-50' },
                        { icon: Shield, label: 'Healthcare', color: 'text-green-600', bg: 'bg-green-50' },
                        { icon: Activity, label: 'Surgeries', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { icon: Stethoscope, label: 'Consult', color: 'text-orange-600', bg: 'bg-orange-50' },
                        { icon: FileText, label: 'Health Blogs', color: 'text-teal-600', bg: 'bg-teal-50' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[100px] snap-center cursor-pointer group px-2">
                            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:-translate-y-2 group-hover:shadow-md transition-all`}>
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                            </div>
                            <span className="text-[13px] font-extrabold tracking-wide text-slate-700 group-hover:text-healthcare-blue text-center uppercase">{item.label}</span>
                        </div>
                    ))}
                </div>

            {/* DYNAMIC SEARCH RESULTS OR PROMO BANNERS */}
            <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
                
                {!isSearching ? (
                    <>
                        {/* PRESCRIPTION WIDE BANNER */}
                        <div className="mb-16">
                            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/30 to-white rounded-2xl border border-blue-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="flex items-center z-10 mb-6 md:mb-0">
                                    <div className="bg-white p-4 rounded-xl shadow-sm mr-6 border border-blue-50">
                                        <FileText className="w-10 h-10 text-healthcare-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-1">Order with Prescription</h3>
                                        <p className="text-slate-500">Upload your prescription and we will deliver your medicines</p>
                                    </div>
                                </div>
                                <Link to="/customer/prescriptions/upload" className="z-10 w-full md:w-auto bg-healthcare-blue hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-md transition-colors flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 mr-2" />
                                    Upload Now
                                </Link>
                            </div>
                        </div>

                        {/* SHOP BY CATEGORY (CIRCULAR ICONS) */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-8">Shop By Category</h3>
                            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 hide-scrollbar snap-x">
                                {[
                                    { name: "Nutritional Drinks", icon: Apple, color: "bg-orange-100 text-orange-600" },
                                    { name: "Ayurveda", icon: Droplet, color: "bg-green-100 text-green-600" },
                                    { name: "Vitamins", icon: Pill, color: "bg-yellow-100 text-yellow-600" },
                                    { name: "Diabetes", icon: Activity, color: "bg-blue-100 text-blue-600" },
                                    { name: "Respiratory", icon: Wind, color: "bg-teal-100 text-teal-600" },
                                    { name: "Fever & Pain", icon: Thermometer, color: "bg-rose-100 text-rose-600" },
                                    { name: "Personal Care", icon: HeartPulse, color: "bg-pink-100 text-pink-600" },
                                    { name: "First Aid", icon: Package, color: "bg-indigo-100 text-indigo-600" }
                                ].map((cat, idx) => (
                                    <div key={idx} className="flex flex-col items-center min-w-[120px] snap-center cursor-pointer group">
                                        <div className={`w-24 h-24 ${cat.color} rounded-full flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:scale-105 transition-all`}>
                                            <cat.icon className="w-10 h-10" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 text-center">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Promo Banner Replacement */}
                        <div className="w-full bg-[#0b2447] rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between p-8 md:px-16 mb-16 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                            <div className="z-10">
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-tight">FEVER TESTS</h2>
                                <p className="text-xl md:text-2xl text-blue-200 font-medium mb-4">Starting at <span className="text-yellow-400 font-bold">₹1199</span></p>
                                <p className="text-blue-100 text-sm md:text-base">Check for Dengue, Typhoid & more from home.</p>
                            </div>
                            <div className="mt-6 md:mt-0 z-10 bg-teal-500 text-white rounded-full w-32 h-32 flex flex-col items-center justify-center font-bold text-center border-4 border-white/20 shadow-xl transform rotate-12">
                                <span className="text-sm">1 in 3</span>
                                <span className="text-xl">fevers</span>
                                <span className="text-[10px] uppercase tracking-wider">can be typhoid</span>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="mb-20 mt-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                    <div className="flex -space-x-3 mr-5">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white flex items-center justify-center font-bold text-blue-700 text-sm shadow-sm z-30">A</div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-white flex items-center justify-center font-bold text-pink-700 text-sm shadow-sm z-20">R</div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 border-2 border-white flex items-center justify-center font-bold text-green-700 text-sm shadow-sm z-10">S</div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">See What Our Customers Have to Say</h3>
                                </div>
                            </div>
                            
                            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6 hide-scrollbar snap-x pt-2">
                                {[
                                    { name: "Amit", city: "Kolkata", text: "I recently tried the pharmacy app for ordering my medicines and it's my saviour. The delivery was very quick!" },
                                    { name: "Rajeev", text: "I have purchased medicines from nearby chemist in the past and was not really sure about online order process... until I tried this app." },
                                    { name: "Alina", city: "Gurugram", text: "My mother's daily medicine was not available in any of the chemist shops near my home. Just to search for it online and found it available here!" },
                                    { name: "Rajesh", city: "Mumbai", text: "I have been using this pharmacy app for sometime now for my family's medicine needs. The order process is very simple and easy." }
                                ].map((t, i) => (
                                    <div key={i} className="relative min-w-[320px] w-[320px] bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 snap-center overflow-hidden group">
                                        {/* Background large quote icon */}
                                        <div className="absolute -top-4 -right-4 text-slate-50 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                            <svg width="120" height="120" viewBox="0 0 32 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.44 24H0L6.72 0H19.2L13.44 24ZM32 24H18.56L25.28 0H32L32 24Z"/></svg>
                                        </div>
                                        
                                        <div className="text-yellow-400 mb-5 relative z-10 flex space-x-1">
                                            {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                                        </div>
                                        <p className="text-base text-slate-600 leading-relaxed mb-6 relative z-10 italic">"{t.text}"</p>
                                        
                                        <div className="flex items-center relative z-10 mt-auto pt-4 border-t border-slate-50">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 mr-3">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{t.name}</h4>
                                                {t.city && <p className="text-xs text-slate-500 font-medium">{t.city}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="mb-20">
                            <FaqAccordion />
                        </div>

                        {/* Browse Medicines Section */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Browse Medicines</h3>
                            </div>
                            
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10353a]"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {medicines?.map((med: any) => (
                                        <Link to={`/medicines/${med.id}`} key={med.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                                            <div className="h-48 bg-white flex items-center justify-center p-6 border-b border-slate-50 relative">
                                                {med.image_url ? (
                                                    <img src={med.image_url.startsWith('http') ? med.image_url : `${API_BASE_URL}${med.image_url}`} alt={med.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                                ) : (
                                                    <Pill className="w-16 h-16 text-slate-200 group-hover:scale-110 transition-transform duration-300" />
                                                )}
                                                {med.prescription_required && (
                                                    <div className="absolute top-3 left-3 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center">
                                                        <ShieldCheck className="w-3 h-3 mr-1" /> Rx Only
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1" title={med.name}>{med.name}</h3>
                                                <p className="text-xs text-slate-500 mb-4">{med.manufacturer_name || 'Generic'}</p>
                                                
                                                <div className="mt-auto">
                                                    <div className="flex items-end gap-2 mb-4">
                                                        <span className="text-xl font-black text-slate-900">₹{Number(med.selling_price).toFixed(2)}</span>
                                                        {med.mrp > med.selling_price && (
                                                            <>
                                                                <span className="text-sm text-slate-400 line-through pb-0.5">₹{Number(med.mrp).toFixed(2)}</span>
                                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded pb-0.5">
                                                                    {Math.round(((med.mrp - med.selling_price) / med.mrp) * 100)}% OFF
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button className="w-full py-2.5 rounded-lg border-2 border-healthcare-blue text-healthcare-blue font-bold group-hover:bg-healthcare-blue group-hover:text-white transition-colors">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Search Results Layout */
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            Search Results for <span className="text-healthcare-blue ml-2">"{debouncedSearch}"</span>
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10353a]"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {medicines?.map((med: any) => (
                                    <Link to={`/medicines/${med.id}`} key={med.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                                        <div className="h-48 bg-white flex items-center justify-center p-6 border-b border-slate-50 relative">
                                            {med.image_url ? (
                                                <img src={med.image_url.startsWith('http') ? med.image_url : `${API_BASE_URL}${med.image_url}`} alt={med.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                            ) : (
                                                <Pill className="w-16 h-16 text-slate-200 group-hover:scale-110 transition-transform duration-300" />
                                            )}
                                            {med.prescription_required && (
                                                <div className="absolute top-3 left-3 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Rx Only
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1" title={med.name}>{med.name}</h3>
                                            <p className="text-xs text-slate-500 mb-4">{med.manufacturer_name || 'Generic'}</p>
                                            
                                            <div className="mt-auto">
                                                <div className="flex items-end gap-2 mb-4">
                                                    <span className="text-xl font-black text-slate-900">₹{Number(med.selling_price).toFixed(2)}</span>
                                                    {med.mrp > med.selling_price && (
                                                        <>
                                                            <span className="text-sm text-slate-400 line-through pb-0.5">₹{Number(med.mrp).toFixed(2)}</span>
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded pb-0.5">
                                                                {Math.round(((med.mrp - med.selling_price) / med.mrp) * 100)}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <button className="w-full py-2.5 rounded-lg border-2 border-healthcare-blue text-healthcare-blue font-bold group-hover:bg-healthcare-blue group-hover:text-white transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                
                                {medicines?.length === 0 && (
                                    <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">No medicines found</h3>
                                        <p className="text-slate-500">We couldn't find anything matching "{searchTerm}". Try checking your spelling or search for a different product.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
