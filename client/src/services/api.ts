import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User, AuthResponse, UserUpdateInput, Bookmark, PaginatedResponse, TagCount, BookmarkStats, SearchParams } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.mattymeltz.com';

// Configure axios
axios.defaults.withCredentials = true;

interface ErrorResponse {
    message?: string;
    error?: string;
}

// Add request interceptor to include JWT token
axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ErrorResponse>) => {
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            endpoint: error.config?.url
        });
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string): Promise<AuthResponse> => 
        axios.post(`${API_URL}/auth/login`, { email, password }).then((res: AxiosResponse) => res.data),

    signup: (email: string, password: string): Promise<AuthResponse> => 
        axios.post(`${API_URL}/auth/signup`, { email, password }).then((res: AxiosResponse) => res.data),

    logout: () => 
        axios.post(`${API_URL}/auth/logout`),

    checkAuth: () => 
        axios.get(`${API_URL}/auth/check`),

    getUser: (): Promise<User> =>
        axios.get(`${API_URL}/auth/user`).then((res: AxiosResponse) => res.data),

    updateProfile: (data: UserUpdateInput): Promise<User> =>
        axios.put(`${API_URL}/auth/profile`, data).then((res: AxiosResponse) => res.data),

    updatePassword: (currentPassword: string, newPassword: string): Promise<void> =>
        axios.put(`${API_URL}/auth/password`, { currentPassword, newPassword }).then((res: AxiosResponse) => res.data),
        
    handleCallback: (token: string): Promise<User> => {
        localStorage.setItem('token', token);
        return axios.get(`${API_URL}/auth/user`).then((res: AxiosResponse) => {
            const user = res.data;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        });
    }
};

// Bookmark API
export const bookmarkAPI = {
    getBookmarks: (folderId?: string | null, page: number = 1, limit: number = 24): Promise<PaginatedResponse<Bookmark>> => 
        axios.get(`${API_URL}/bookmarks`, {
            params: { folderId, page, limit }
        }).then((res: AxiosResponse) => res.data),

    search: (params: SearchParams, page: number = 1, limit: number = 24): Promise<PaginatedResponse<Bookmark>> => {
        const searchParams = {
            ...params,
            tags: params.tags?.join(','),
            page,
            limit
        };
        return axios.get(`${API_URL}/bookmarks/search`, { params: searchParams })
            .then((response: AxiosResponse) => response.data);
    },

    create: async (url: string): Promise<Bookmark> => {
        try {
            console.log('Creating bookmark for URL:', url);
            const response: AxiosResponse = await axios.post(`${API_URL}/bookmarks`, { url });
            console.log('Bookmark created successfully:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error creating bookmark:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url
                });
                throw new Error(error.response?.data?.message || 'Failed to create bookmark');
            }
            throw error;
        }
    },

    delete: (id: string): Promise<void> => 
        axios.delete(`${API_URL}/bookmarks/${id}`).then((res: AxiosResponse) => res.data),

    updateBookmark: (id: string, updates: Partial<Bookmark>): Promise<Bookmark> => 
        axios.put(`${API_URL}/bookmarks/${id}`, updates).then((res: AxiosResponse) => res.data),

    getTags: (): Promise<TagCount[]> =>
        axios.get(`${API_URL}/bookmarks/tags`).then((res: AxiosResponse) => res.data),
        
    getStats: (): Promise<BookmarkStats> =>
        axios.get(`${API_URL}/bookmarks/stats`).then((res: AxiosResponse) => res.data),

    bulkUpdate: async (bookmarkIds: string[], data: { action: string, [key: string]: any }): Promise<void> => {
        try {
            console.log('Performing bulk update:', {
                action: data.action,
                bookmarkCount: bookmarkIds.length
            });
            const response: AxiosResponse = await axios.post(`${API_URL}/bookmarks/bulk`, {
                bookmarkIds,
                ...data
            });
            console.log('Bulk update successful');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Bulk update failed:', {
                    action: data.action,
                    error: error.response?.data?.message || error.message
                });
                throw new Error(error.response?.data?.message || 'Failed to perform bulk operation');
            }
            throw error;
        }
    }
};

// Folder API
export const folderAPI = {
    getFolders: () => 
        axios.get(`${API_URL}/folders`).then((res: AxiosResponse) => res.data),

    createFolder: (data: any) =>
        axios.post(`${API_URL}/folders`, data).then((res: AxiosResponse) => res.data),

    updateFolder: (id: string, data: any) =>
        axios.put(`${API_URL}/folders/${id}`, data).then((res: AxiosResponse) => res.data),

    deleteFolder: (id: string) =>
        axios.delete(`${API_URL}/folders/${id}`).then((res: AxiosResponse) => res.data)
};

// Chat API
export const chatAPI = {
    sendMessage: async (message: string) => {
        if (!message?.trim()) {
            throw new Error('Message is required');
        }

        try {
            const response = await axios.post<{ reply: string }>(
                `${API_URL}/chat/chat`,
                {
                    message: message.trim()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Chat API error:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || error.message;
                throw new Error(errorMessage);
            }
            throw error;
        }
    }
};

// Export all APIs as a single object
export const api = {
    auth: authAPI,
    bookmarks: bookmarkAPI,
    folders: folderAPI,
    chat: chatAPI
};

export default api;
