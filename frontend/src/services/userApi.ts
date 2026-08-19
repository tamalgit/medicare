import api from './api';

export const getAddresses = async () => {
    const response = await api.get('/users/addresses');
    return response.data.data;
};

export const addAddress = async (addressData: any) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
};
