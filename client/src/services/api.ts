import axios from 'axios';
import { User, AuthResponse, UserUpdateInput, Bookmark } from '../types';

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

interface SearchParams {
    query?: string;
    tags?: string[];
    page?: number;
}

interface SearchResponse {
    data: Bookmark[];
    hasMore: boolean;
}

interface TagCount {
    name: string;
    count: number;
}

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
    getBookmarks: () => 
        axios.get<Bookmark[]>(`${API_URL}/bookmarks`),

    search: (params: SearchParams) => {
        // Convert tags array to comma-separated string
        const searchParams = {
            ...params,
            tags: params.tags?.join(',')
        };
        return axios.get<SearchResponse>(`${API_URL}/bookmarks/search`, { params: searchParams })
            .then(response => response.data);
    },

    create: (url: string) => 
        axios.post<Bookmark>(`${API_URL}/bookmarks`, { url }),

    delete: (id: string) => 
        axios.delete(`${API_URL}/bookmarks/${id}`),

    updateBookmark: (id: string, updates: any) => 
        axios.put<Bookmark>(`${API_URL}/bookmarks/${id}`, updates),

    getTags: (): Promise<TagCount[]> =>
        axios.get(`${API_URL}/bookmarks/tags`).then(res => res.data)
};

// Chat API
export const chatAPI = {
    sendMessage: (message: string, apiKey?: string) => 
        axios.post<{ reply: string }>(`${API_URL}/chat/chat`, { message, apiKey })
            .then(response => response.data)
};
