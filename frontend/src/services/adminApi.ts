import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data.data;
};

export const getUsersList = async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
};

export const updateUserRole = async (id: string, role?: string, is_active?: boolean) => {
    const response = await api.patch(`/admin/users/${id}`, { role, is_active });
    return response.data;
};
