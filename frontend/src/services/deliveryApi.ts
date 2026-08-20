import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/deliveries/dashboard-stats');
    return response.data.data;
};

export const getMyDeliveries = async () => {
    const response = await api.get('/deliveries/deliveries');
    return response.data.data;
};

export const updateDeliveryStatus = async (id: string, status: string, notes?: string, otp?: string) => {
    const response = await api.patch(`/deliveries/deliveries/${id}/status`, { status, notes, otp });
    return response.data;
};
