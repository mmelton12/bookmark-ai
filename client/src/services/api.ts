import axios, { AxiosError } from 'axios';
import { AuthResponse, Bookmark, SearchFilters, PaginatedResponse } from '../types';

// Hardcode the API URL since server is running on port 5001
const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: (status) => {
        return status >= 200 && status < 300; // Treat 2xx status codes as successful
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear auth state on unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        throw error;
    }
);

interface GetAllBookmarksParams {
    page?: number;
    limit?: number;
    query?: string;
    tags?: string[];
}

const handleApiError = (error: any) => {
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    } else if (error.message) {
        throw new Error(error.message);
    } else {
        throw new Error('An unexpected error occurred');
    }
};

export const authAPI = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/signup', { email, password });
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
};

export const bookmarkAPI = {
    create: async (url: string): Promise<Bookmark> => {
        try {
            const response = await api.post<Bookmark>('/bookmarks', { url });
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
    getAll: async (params: GetAllBookmarksParams = {}): Promise<PaginatedResponse<Bookmark>> => {
        try {
            const response = await api.get<PaginatedResponse<Bookmark>>('/bookmarks', { params });
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
    search: async (filters: SearchFilters): Promise<PaginatedResponse<Bookmark>> => {
        try {
            const response = await api.get<PaginatedResponse<Bookmark>>('/bookmarks/search', {
                params: filters,
            });
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/bookmarks/${id}`);
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
    update: async (id: string, data: Partial<Bookmark>): Promise<Bookmark> => {
        try {
            const response = await api.put<Bookmark>(`/bookmarks/${id}`, data);
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    },
};

export default api;
