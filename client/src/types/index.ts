export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  googleId?: string;
  openAiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  url: string;
  title: string;
  description?: string;
  aiSummary?: string;
  tags: string[];
  warning?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface BookmarkCreateInput {
  url: string;
}

export interface BookmarkUpdateInput {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface SearchFilters {
  tags?: string[];
  query?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  openAiKey?: string;
}

export interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}
