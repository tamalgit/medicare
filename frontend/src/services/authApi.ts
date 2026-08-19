import api from './api';

export const registerUser = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};
