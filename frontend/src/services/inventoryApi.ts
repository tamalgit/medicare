import api from './api';

export const getInventory = async () => {
    const response = await api.get('/inventory');
    return response.data.data;
};

export const updateStock = async (data: {
    inventoryId?: string;
    medicineId: string;
    batchId: string;
    batchNumber?: string;
    expiryDate?: string;
    sku?: string;
    quantity: number;
    transactionType: 'IN' | 'OUT' | 'ADJUSTMENT';
    remarks?: string;
}) => {
    const response = await api.post('/inventory/update', data);
    return response.data;
};
