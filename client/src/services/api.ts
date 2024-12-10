import axios from 'axios';
import { User, AuthResponse, UserUpdateInput, Bookmark, PaginatedResponse, TagCount, BookmarkStats, SearchParams } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure axios
axios.defaults.withCredentials = true;

// Add request interceptor to include JWT token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string): Promise<AuthResponse> => 
        axios.post(`${API_URL}/auth/login`, { email, password }).then(res => res.data),

    signup: (email: string, password: string): Promise<AuthResponse> => 
        axios.post(`${API_URL}/auth/signup`, { email, password }).then(res => res.data),

    logout: () => 
        axios.post(`${API_URL}/auth/logout`),

    checkAuth: () => 
        axios.get(`${API_URL}/auth/check`),

    getUser: (): Promise<User> =>
        axios.get(`${API_URL}/auth/user`).then(res => res.data),

    updateProfile: (data: UserUpdateInput): Promise<User> =>
        axios.put(`${API_URL}/auth/profile`, data).then(res => res.data),

    updatePassword: (currentPassword: string, newPassword: string): Promise<void> =>
        axios.put(`${API_URL}/auth/password`, { currentPassword, newPassword }).then(res => res.data),
        
    handleCallback: (token: string): Promise<User> => {
        localStorage.setItem('token', token);
        return axios.get(`${API_URL}/auth/user`).then(res => {
            const user = res.data;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        });
    }
};

// Bookmark API
export const bookmarkAPI = {
    getBookmarks: (folderId?: string | null): Promise<PaginatedResponse<Bookmark>> => 
        axios.get(`${API_URL}/bookmarks`, {
            params: { folderId }
        }).then(res => res.data),

    search: (params: SearchParams): Promise<PaginatedResponse<Bookmark>> => {
        const searchParams = {
            ...params,
            tags: params.tags?.join(',')
        };
        return axios.get(`${API_URL}/bookmarks/search`, { params: searchParams })
            .then(response => response.data);
    },

    create: (url: string): Promise<Bookmark> => 
        axios.post(`${API_URL}/bookmarks`, { url }).then(res => res.data),

    delete: (id: string): Promise<void> => 
        axios.delete(`${API_URL}/bookmarks/${id}`).then(res => res.data),

    updateBookmark: (id: string, updates: Partial<Bookmark>): Promise<Bookmark> => 
        axios.put(`${API_URL}/bookmarks/${id}`, updates).then(res => res.data),

    getTags: (): Promise<TagCount[]> =>
        axios.get(`${API_URL}/bookmarks/tags`).then(res => res.data),
        
    getStats: (): Promise<BookmarkStats> =>
        axios.get(`${API_URL}/bookmarks/stats`).then(res => res.data)
};

// Folder API
export const folderAPI = {
    getFolders: () => 
        axios.get(`${API_URL}/folders`).then(res => res.data),

    createFolder: (data: any) =>
        axios.post(`${API_URL}/folders`, data).then(res => res.data),

    updateFolder: (id: string, data: any) =>
        axios.put(`${API_URL}/folders/${id}`, data).then(res => res.data),

    deleteFolder: (id: string) =>
        axios.delete(`${API_URL}/folders/${id}`).then(res => res.data)
};

// Chat API
export const chatAPI = {
    sendMessage: async (message: string, apiKey?: string) => {
        if (!message?.trim()) {
            throw new Error('Message is required');
        }
        if (!apiKey?.trim()) {
            throw new Error('OpenAI API key is required');
        }

        try {
            console.log('Sending chat request with API key length:', apiKey.length);
            const response = await axios.post<{ reply: string }>(
                `${API_URL}/chat/chat`,
                {
                    message: message.trim(),
                    apiKey: apiKey.trim()
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
