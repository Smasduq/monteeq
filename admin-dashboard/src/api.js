import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/admin/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const getMe = async (token) => {
    const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getStats = async (token) => {
    const response = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getUsers = async (token) => {
    const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const promoteUser = async (userId, isPremium, token) => {
    const response = await api.post(`/admin/promote/${userId}?is_premium=${isPremium}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPendingVideos = async (token) => {
    const response = await api.get('/videos/?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateVideoStatus = async (videoId, status, token) => {
    const response = await api.put(`/videos/${videoId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
export const getStorageMode = async (token) => {
    const response = await api.get('/admin/settings/storage-mode', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateStorageMode = async (mode, token) => {
    const response = await api.put(`/admin/settings/storage-mode?mode=${mode}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPerformanceStats = async (metric, token) => {
    const response = await api.get(`/admin/stats/performance?metric=${metric}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getAdminConfig = async (token) => {
    const response = await api.get('/admin/config', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Challenges Management
export const getAdminChallenges = async (token) => {
    const response = await api.get('/admin/challenges', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createChallenge = async (challengeData, token) => {
    const response = await api.post('/admin/challenges', challengeData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateChallenge = async (challengeId, challengeData, token) => {
    const response = await api.put(`/admin/challenges/${challengeId}`, challengeData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteChallenge = async (challengeId, token) => {
    const response = await api.delete(`/admin/challenges/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
