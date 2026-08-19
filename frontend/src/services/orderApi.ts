import api from './api';

export const createOrder = async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/orders/my-orders');
    return response.data.data;
};

export const getPharmacyOrders = async () => {
    const response = await api.get('/orders/pharmacy');
    return response.data.data;
};

export const updateOrderStatus = async (id: string, status: string, remarks?: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status, remarks });
    return response.data;
};
