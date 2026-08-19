import api from './api';

export const getPharmacyDashboardStats = async () => {
    const response = await api.get('/pharmacy/dashboard-stats');
    return response.data.data;
};
