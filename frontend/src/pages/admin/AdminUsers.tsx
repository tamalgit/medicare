import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersList, updateUserRole } from '../../services/adminApi';
import { Users, Search, Filter, Shield, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';

export const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: getUsersList,
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role, is_active }: any) => updateUserRole(id, role, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setEditingUser(null);
        }
    });

    const filteredUsers = users?.filter((u: any) => {
        if (!u) return false;
        const matchesSearch = `${u?.first_name || ''} ${u?.last_name || ''} ${u?.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const userRole = u?.role || 'CUSTOMER';
        const matchesRole = roleFilter === 'ALL' || userRole === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                        <Users className="w-8 h-8 mr-3 text-indigo-600" /> User Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage system access, roles, and permissions across the platform.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all">
                    + Invite User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
                <div className="relative w-full sm:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="PHARMACY_ADMIN">Pharmacy Admin</option>
                        <option value="PHARMACIST">Pharmacist</option>
                        <option value="DELIVERY_AGENT">Delivery Agent</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black">
                                <th className="p-5">User</th>
                                <th className="p-5">Role Identity</th>
                                <th className="p-5">Account Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Loading user database...</td>
                                </tr>
                            ) : filteredUsers?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium flex flex-col items-center">
                                        <Shield className="w-12 h-12 mb-3 text-slate-200" />
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers?.map((u: any, idx: number) => (
                                    <tr key={u?.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center border border-indigo-200">
                                                    {u?.first_name?.[0] || '?'}{u?.last_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u?.first_name || 'Unknown'} {u?.last_name || 'User'}</p>
                                                    <p className="text-sm text-slate-500 font-medium">{u?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {editingUser === u?.id ? (
                                                <select 
                                                    value={u?.role || 'CUSTOMER'}
                                                    onChange={(e) => updateRoleMutation.mutate({ id: u?.id, role: e.target.value, is_active: u?.is_active })}
                                                    className="text-xs font-bold uppercase tracking-wider bg-white border-2 border-indigo-500 rounded-lg p-1.5 outline-none text-indigo-700 shadow-sm"
                                                >
                                                    <option value="CUSTOMER">Customer</option>
                                                    <option value="PHARMACY_ADMIN">Pharmacy Admin</option>
                                                    <option value="PHARMACIST">Pharmacist</option>
                                                    <option value="DELIVERY_AGENT">Delivery Agent</option>
                                                    <option value="SUPER_ADMIN">Super Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider border ${
                                                    u?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    u?.role === 'PHARMACY_ADMIN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    u?.role === 'PHARMACIST' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    u?.role === 'DELIVERY_AGENT' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                    {String(u?.role || 'CUSTOMER').replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <button 
                                                onClick={() => updateRoleMutation.mutate({ id: u?.id, role: u?.role, is_active: !u?.is_active })}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                    u?.is_active !== false
                                                    ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200' 
                                                    : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                                                }`}
                                            >
                                                {u?.is_active !== false ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {u?.is_active !== false ? 'ACTIVE' : 'SUSPENDED'}
                                            </button>
                                        </td>
                                        <td className="p-5 text-right">
                                            {editingUser === u?.id ? (
                                                <button 
                                                    onClick={() => setEditingUser(null)}
                                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Done
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setEditingUser(u?.id)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
