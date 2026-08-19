import React from 'react';
import { Shield, Droplet, Apple, Sparkles, Home, Leaf, Baby, Activity, HeartPulse, Pill, Thermometer, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Healthcare = () => {
    const categories = [
        { name: 'COVID Essentials', discount: 'Upto 76% off', icon: Shield, color: 'text-rose-500' },
        { name: 'Personal Care', discount: 'Upto 80% off', icon: Droplet, color: 'text-blue-500' },
        { name: 'Health Food and Drinks', discount: 'Upto 57% off', icon: Apple, color: 'text-green-500' },
        { name: 'Beauty', discount: 'Upto 35% off', icon: Sparkles, color: 'text-pink-500' },
        { name: 'Skin Care', discount: 'Upto 50% off', icon: HeartPulse, color: 'text-rose-400' },
        { name: 'Home Care', discount: 'Upto 35% off', icon: Home, color: 'text-teal-500' },
        { name: 'Ayurvedic Care', discount: 'Upto 70% off', icon: Leaf, color: 'text-green-600' },
        { name: 'Mother and Baby Care', discount: 'Upto 50% off', icon: Baby, color: 'text-indigo-500' },
        { name: 'Healthcare Devices', discount: 'Upto 65% off', icon: Activity, color: 'text-blue-600' },
        { name: 'Surgicals and Dressings', discount: 'Upto 55% off', icon: Pill, color: 'text-slate-500' },
        { name: 'Sexual Wellness', discount: 'Upto 53% off', icon: HeartPulse, color: 'text-red-500' },
        { name: 'Fitness & Supplements', discount: 'Upto 80% off', icon: Thermometer, color: 'text-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            
            {/* Header/Breadcrumb */}
            <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-500 flex items-center">
                    <Link to="/" className="hover:text-healthcare-blue">Home</Link>
                    <ChevronRight className="w-3 h-3 mx-2" />
                    <span className="text-slate-800 font-medium">Healthcare</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                
                {/* Top Promo Banners */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="w-full md:w-2/3 bg-blue-50 rounded-2xl overflow-hidden relative cursor-pointer group h-48 border border-blue-100 flex">
                        <div className="p-8 z-10 w-2/3">
                            <h2 className="text-3xl font-black text-blue-900 leading-tight mb-2">Protection that starts<br/>from Day 1</h2>
                            <p className="text-blue-700 font-medium text-sm">Shop Baby Care Products</p>
                        </div>
                        <div className="w-1/3 bg-blue-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-300 opacity-50 rounded-full scale-150 -translate-x-1/2"></div>
                            <Baby className="absolute bottom-4 right-4 w-24 h-24 text-blue-100 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 bg-slate-900 rounded-2xl overflow-hidden relative cursor-pointer group h-48 flex flex-col justify-center p-6">
                        <h3 className="text-xl font-bold text-white mb-1">India's most<br/>advanced wellness</h3>
                        <p className="text-slate-400 text-xs mb-4">Explore the entire range</p>
                        <button className="bg-white text-slate-900 font-bold px-4 py-2 rounded-lg text-sm w-fit hover:bg-slate-200 transition-colors">Buy Now</button>
                        <HeartPulse className="absolute bottom-4 right-4 w-16 h-16 text-slate-800 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-healthcare-blue transition-all group">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-50 transition-colors border border-slate-100">
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <h3 className="font-bold text-slate-700 text-sm">{cat.name}</h3>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded leading-tight">Upto<br/>{cat.discount.split(' ')[1]}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SEO Text Block */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Shop Safely And Worry-Free On Medicare</h2>
                    
                    <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
                        <p>
                            Medicare is a renowned name in the online delivery of healthcare products and other daily essentials. We understand the value of your time and money, hence we strive to provide the best of our services. Medicare is your one-stop online destination for your healthcare needs and offers a wide range of products including over-the-counter medicines, healthcare devices, homeopathy, and ayurveda medicines. You can buy medicines online from Medicare and get them delivered to your doorstep.
                        </p>
                        
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm mb-2">Why choose Medicare?</h3>
                            <ul className="list-disc pl-5 space-y-1 text-healthcare-blue">
                                <li>8400+ Brands</li>
                                <li>35K products in our catalog</li>
                                <li>Authentic products delivered</li>
                                <li>On-time delivery within the city</li>
                                <li>Over 100 million customers</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 text-sm mb-2">Our most popular categories:</h3>
                            <p className="mb-2">We have a range of categories and products, some of which are:</p>
                            
                            <h4 className="font-bold text-slate-700 mt-3 mb-1">Devices</h4>
                            <p>With the pandemic upending our lives, we have all realized that there are some medical devices that we need to keep in our homes always. Check out our range of oxygen concentrators, pulse oximeters, BP monitors, thermometers.</p>
                            
                            <h4 className="font-bold text-slate-700 mt-3 mb-1">Personal care</h4>
                            <p>Personal care products can include a wide range of products such as bath products, skin care essentials, razor blades, toothpaste and toothbrushes, wet wipes, lip balm, face masks, hand sanitizer etc.</p>

                            <h4 className="font-bold text-slate-700 mt-3 mb-1">Nutrition and fitness supplements</h4>
                            <p>To give your health a helping hand, you can order a wide variety of health supplements including Health drinks, Nutritional powder, Nutrition tablets/capsules.</p>

                            <h4 className="font-bold text-slate-700 mt-3 mb-1">Ayurvedic care</h4>
                            <p>Place your trust in the goodness of natural and organic ayurvedic products for an all-round healthy mind and body. There is plenty to choose from such as Aloe vera juice, Moringa capsules, Garlic capsules.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
