export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  googleId?: string;
  openAiKey?: string;
  claudeKey?: string;
  aiProvider?: 'openai' | 'claude';
  hasCompletedTour: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
  subfolders: Folder[];
  bookmarkCount: number;
}

export interface Bookmark {
  _id: string;
  url: string;
  title: string;
  description: string;
  aiSummary: string;
  tags: string[];
  folder: string | null;
  category: 'Article' | 'Video' | 'Research';
  isFavorite: boolean;
  warning?: string;
  user: string;
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
  folder?: string | null;
  category?: 'Article' | 'Video' | 'Research';
  isFavorite?: boolean;
}

export interface SearchFilters {
  tags?: string[];
  query?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  folder?: string | null;
  category?: 'Article' | 'Video' | 'Research' | null;
  isFavorite?: boolean;
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
  claudeKey?: string;
  aiProvider?: 'openai' | 'claude';
  hasCompletedTour?: boolean;
}

export interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface BookmarkStats {
  totalBookmarks: number;
  tagsCount: number;
}

export interface SearchParams {
  query?: string;
  tags?: string[];
  page?: number;
  folderId?: string | null;
  favorite?: boolean;
  category?: 'Article' | 'Video' | 'Research' | null;
}
