import api from './api';

export const searchMedicines = async (query: string, categoryId?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (categoryId) params.append('categoryId', categoryId);
    
    const response = await api.get(`/medicines/search?${params.toString()}`);
    return response.data.data;
};

export const getMedicineDetails = async (id: string) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data.data;
};

export const getCategories = async () => {
    const response = await api.get('/medicines/categories');
    return response.data.data;
};

export const getManufacturers = async () => {
    const response = await api.get('/medicines/manufacturers');
    return response.data.data;
};

export const addMedicine = async (medicineData: any) => {
    const response = await api.post('/medicines', medicineData);
    return response.data;
};
