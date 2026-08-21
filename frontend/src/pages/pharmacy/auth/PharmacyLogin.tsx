import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginUser } from '../../../services/authApi';
import { Eye, EyeOff, ShieldCheck, HeartPulse, ArrowRight, Activity } from 'lucide-react';

export const PharmacyLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await loginUser({ email, password });
            if (data.success) {
                login(data.data.user, data.data.token);
                // Check if user has pharmacy roles
                const role = data.data.user.role;
                if (role === 'PHARMACY_ADMIN' || role === 'PHARMACIST' || role === 'SUPER_ADMIN') {
                    navigate('/pharmacy/dashboard');
                } else {
                    setError('Access Denied. You do not have pharmacy portal permissions.');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Branding Side */}
                <div className="md:w-1/2 bg-healthcare-blue text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <HeartPulse className="w-10 h-10 text-white" />
                            <span className="text-3xl font-black tracking-tight">Medicare</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Pharmacy Portal</h1>
                        <p className="text-blue-100 text-lg">
                            Secure enterprise management system for inventory, prescriptions, and order fulfillment.
                        </p>
                    </div>
                    
                    <div className="mt-12 relative z-10 flex items-center gap-3 bg-blue-800/30 p-4 rounded-2xl backdrop-blur-sm border border-blue-400/20">
                        <ShieldCheck className="w-8 h-8 text-blue-300" />
                        <div>
                            <p className="font-semibold text-sm">Secure Authentication</p>
                            <p className="text-blue-200 text-xs">HIPAA Compliant System</p>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <Activity className="absolute -bottom-10 -right-10 w-64 h-64 text-blue-600/50 opacity-20" />
                    <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                </div>

                {/* Login Form Side */}
                <div className="md:w-1/2 p-12 bg-white">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Sign in to your pharmacy account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue outline-none transition-all font-medium text-slate-900"
                                placeholder="pharmacy@medicare.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue outline-none transition-all font-medium text-slate-900 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-slate-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-healthcare-blue focus:ring-healthcare-blue mr-2 cursor-pointer" />
                                Remember me
                            </label>
                            <a href="#" className="font-semibold text-healthcare-blue hover:text-blue-800 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-healthcare-blue hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group shadow-md hover:shadow-lg"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                            {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
