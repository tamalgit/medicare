import api from './api';

export const uploadPrescription = async (formData: FormData) => {
    const response = await api.post('/prescriptions/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const linkPrescription = async (prescriptionId: string, orderId: string) => {
    const response = await api.post(`/prescriptions/${prescriptionId}/link`, { orderId });
    return response.data;
};

export const getPrescriptions = async () => {
    const response = await api.get('/prescriptions');
    return response.data.data;
};

export const verifyPrescription = async (id: string, verificationData: any) => {
    const response = await api.post(`/prescriptions/${id}/verify`, verificationData);
    return response.data;
};

export const getPrescriptionFileUrl = async (id: string) => {
    const response = await api.get(`/prescriptions/${id}/download`, {
        responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
};
